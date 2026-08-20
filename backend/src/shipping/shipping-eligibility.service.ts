// shipping/shipping-eligibility.service.ts
// Shipping Eligibility Engine — menentukan service mana yang boleh dipakai
// untuk berat total tertentu, berdasarkan aturan provider (bukan harga, bukan index).
// Backend adalah sumber kebenaran: service yang tidak eligible TIDAK dikirim ke frontend.
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ShippingCostOption } from './rajaongkir.service';

export interface EligibilityResult {
  eligible: ShippingCostOption[];
  rawCodes: string[];
  decisions: Record<string, boolean>;
}

/**
 * Rule provider (JNE trucking): service cargo (JTR & varian berat) hanya dipakai
 * untuk kiriman berat. Band pada kode service (JTR<130 / JTR>130 / JTR>200)
 * adalah threshold berat dalam KILOGRAM sesuai penamaan service dari provider:
 *
 *   JTR        → cargo dasar, minimal CARGO_MIN_WEIGHT_KG (default 100 kg)
 *   JTR<130    → band [min, 130) kg
 *   JTR>130    → band [130, 200) kg
 *   JTR>200    → band [200, ∞) kg
 *
 * Setiap band bisa diaktifkan/nonaktifkan lewat env. Kalau aturan provider
 * berubah, cukup ubah konfigurasi — bukan hardcode di frontend.
 */
@Injectable()
export class ShippingEligibilityService {
  private readonly cargoMinKg: number;
  private readonly toggles: Record<string, boolean>;

  // Threshold band JTR (kg) yang diketahui dari provider, urut naik.
  private static readonly GT_BANDS = [130, 200];

  constructor(config: ConfigService) {
    this.cargoMinKg = Number(config.get('CARGO_MIN_WEIGHT_KG') ?? 100) || 100;
    this.toggles = {
      JTR: config.get('JTR_ENABLED') !== 'false',
      'JTR<130': config.get('JTR_LT_130_ENABLED') !== 'false',
      'JTR>130': config.get('JTR_GT_130_ENABLED') !== 'false',
      'JTR>200': config.get('JTR_GT_200_ENABLED') !== 'false',
    };
  }

  /**
   * Filter service berdasarkan berat total. Hanya service eligible yang
   * dikembalikan; detail keputusan disediakan untuk log development.
   */
  filterEligibleServices(
    services: ShippingCostOption[],
    totalWeightGrams: number,
  ): EligibilityResult {
    const totalKg = totalWeightGrams / 1000;
    const decisions: Record<string, boolean> = {};
    const rawCodes = services.map((s) => s.service);
    const eligible = services.filter((s) => {
      const ok = this.isEligible(s, totalKg);
      decisions[s.service] = ok;
      return ok;
    });
    return { eligible, rawCodes, decisions };
  }

  private isEligible(opt: ShippingCostOption, totalKg: number): boolean {
    // Paket reguler / express / special tidak punya batas minimum cargo.
    if (opt.category !== 'CARGO') return true;

    const code = (opt.service ?? '').toUpperCase();

    if (code === 'JTR') {
      return this.toggles['JTR'] && totalKg >= this.cargoMinKg;
    }

    const lt = code.match(/^JTR\s*<\s*(\d+)/);
    if (lt) {
      if (!this.toggles['JTR<130']) return false;
      const upper = Number(lt[1]);
      return totalKg >= this.cargoMinKg && totalKg < upper;
    }

    const gt = code.match(/^JTR\s*>\s*(\d+)/);
    if (gt) {
      const lower = Number(gt[1]);
      const toggleKey = lower >= 200 ? 'JTR>200' : 'JTR>130';
      if (!this.toggles[toggleKey]) return false;
      if (totalKg < this.cargoMinKg) return false;
      // Batas atas = threshold band berikutnya yang diketahui (>130 → 200), else ∞
      const next = ShippingEligibilityService.GT_BANDS.find((t) => t > lower);
      const upper = next ?? Infinity;
      return totalKg >= lower && totalKg < upper;
    }

    // Cargo lain (mis. deskripsi "trucking") tanpa kode JTR — ikut minimum cargo.
    return totalKg >= this.cargoMinKg;
  }
}