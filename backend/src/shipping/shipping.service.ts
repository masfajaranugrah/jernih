// shipping/shipping.service.ts
// Orchestrator ongkir: validasi kepemilikan alamat → resolve destination → RajaOngkir.
// Dipakai oleh endpoint /shipping/cost (frontend menampilkan pilihan) DAN oleh
// OrdersService saat membuat/updating order + saat createPaymentIntent (validasi ulang).
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RajaOngkirService, ShippingCostOption } from './rajaongkir.service';
import { addresses } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { CalculateShippingCostDto } from './dto/calculate-shipping-cost.dto';

@Injectable()
export class ShippingService {
  /**
   * Berat sementara untuk tahap awal: 1 kg = 1000 gram (satuan RajaOngkir).
   * Jangan hardcode 1 kg di banyak tempat — nanti cukup diganti totalWeight
   * dari cart/order di satu titik ini.
   */
  static readonly DEFAULT_WEIGHT_GRAMS = 1000;

  static readonly DEFAULT_COURIER = 'jne';

  /** Kurir yang ditawarkan di checkout (urutannya = urutan tampil). */
  static readonly SUPPORTED_COURIERS = ['jne', 'jnt', 'wahana'];

  constructor(
    private readonly database: DatabaseService,
    private readonly rajaongkir: RajaOngkirService,
  ) {}

  /**
   * Satu sumber kebenaran berat checkout.
   * Untuk sementara pakai fallback 1 kg (DEFAULT_WEIGHT_GRAMS) — satuan RajaOngkir
   * adalah gram. Nanti cukup ganti di sini menjadi Σ(product.weightGrams × quantity)
   * dari cart/order, tanpa menyentuh tempat lain.
   */
  getCheckoutWeight(): { totalWeightGrams: number; totalWeightKg: number } {
    const totalWeightGrams = ShippingService.DEFAULT_WEIGHT_GRAMS;
    return {
      totalWeightGrams,
      totalWeightKg: totalWeightGrams / 1000,
    };
  }

  /** Ambil alamat milik user (validasi ownership — IDOR safe). */
  async getOwnedAddress(userId: string, addressId: string) {
    const [addr] = await this.database.db
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
      .limit(1);
    if (!addr) {
      // Alamat milik user lain / tidak ada → 403 (jangan ungkap keberadaan data orang lain)
      throw new ForbiddenException('Anda tidak memiliki akses ke alamat ini');
    }
    return addr;
  }

  /** Hitung biaya ongkir untuk alamat user. Endpoint POST /shipping/cost. */
  async getCost(userId: string, dto: CalculateShippingCostDto) {
    const address = await this.getOwnedAddress(userId, dto.addressId);
    const { totalWeightGrams, totalWeightKg } = this.getCheckoutWeight();
    // Tanpa kurir → hitung semua kurir yang didukung sekaligus ("jne:jnt:wahana").
    // API V2 menerima beberapa kurir dipisah titik dua dalam satu request.
    const courier =
      dto.courier?.toLowerCase() || ShippingService.SUPPORTED_COURIERS.join(':');

    const destination = await this.rajaongkir.resolveDestinationId(
      address.city,
      address.province,
    );
    const options = await this.rajaongkir.calculateCost({
      origin: await this.rajaongkir.getOriginId(),
      destination,
      weight: totalWeightGrams,
      courier,
    });

    if (!options.length) {
      throw new BadRequestException('Tidak ada layanan pengiriman tersedia untuk tujuan ini');
    }

    return {
      addressId: address.id,
      totalWeightGrams,
      totalWeightKg,
      courier,
      destinationId: destination,
      options,
    };
  }

  /**
   * Validasi ulang ongkir saat order dibuat / di-patch / sebelum payment.
   * Backend menghitung harga sendiri — nilai `shippingCost` dari frontend TIDAK dipercaya.
   * Mengembalikan harga valid + snapshot alamat untuk disimpan di order.
   */
  async validateShipping(
    userId: string,
    addressId: string,
    courier: string,
    service: string,
  ): Promise<{ cost: number; address: any; option: ShippingCostOption; weight: number }> {
    const address = await this.getOwnedAddress(userId, addressId);
    const { totalWeightGrams } = this.getCheckoutWeight();
    const courierCode = courier?.toLowerCase();
    if (!courierCode) throw new BadRequestException('Kurir pengiriman wajib diisi');

    const destination = await this.rajaongkir.resolveDestinationId(
      address.city,
      address.province,
    );
    const options = await this.rajaongkir.calculateCost({
      origin: await this.rajaongkir.getOriginId(),
      destination,
      weight: totalWeightGrams,
      courier: courierCode,
    });

    const match = options.find((o) => o.service === service);
    if (!match) {
      throw new BadRequestException('Layanan pengiriman yang dipilih tidak tersedia');
    }
    if (!match.cost) {
      throw new BadRequestException('Biaya pengiriman tidak valid');
    }

    return { cost: match.cost, address, option: match, weight: totalWeightGrams };
  }

  /** Snapshot alamat untuk disimpan di order (agar tidak berubah walau alamat diedit). */
  static buildAddressSnapshot(address: any): Record<string, string | null> {
    return {
      shippingName: address.recipient ?? null,
      shippingPhone: address.phone ?? null,
      shippingAddress: address.street ?? null,
      shippingProvince: address.province ?? null,
      shippingCity: address.city ?? null,
      shippingDistrict: address.district ?? null,
      shippingPostalCode: address.postalCode ?? null,
    };
  }
}