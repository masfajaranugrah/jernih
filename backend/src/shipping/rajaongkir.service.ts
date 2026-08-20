// shipping/rajaongkir.service.ts
// Service khusus RajaOngkir (API V2 by Komerce).
// Semua panggilan keluar hanya dari backend — API key tidak pernah bocor ke frontend.
//
// Catatan migrasi: sejak 1 Jan 2025 RajaOngkir dikelola Komerce dan memakai
// endpoint baru https://rajaongkir.komerce.id/api/v1 (endpoint lama
// api.rajaongkir.com/starter sudah nonaktif). V2 menghitung ongkir per
// SUB-DISTRICT (kelurahan), jadi alamat bebas-teks di-resolve lewat
// endpoint search destination, bukan daftar kota statis.
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ShippingEligibilityService } from './shipping-eligibility.service';

const V2_BASE = 'https://rajaongkir.komerce.id/api/v1';
const REQUEST_TIMEOUT_MS = 15000;
const COST_CACHE_TTL_MS = 5 * 60 * 1000; // harga bisa berubah, cache pendek
const DEST_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // lokasi statis, cache lama

export type ShippingCategory = 'REGULAR' | 'EXPRESS' | 'SPECIAL' | 'CARGO';

export interface ShippingCostOption {
  code: string; // kode kurir mis. "jne"
  name: string; // nama kurir mis. "Jalur Nugraha Ekakurir (JNE)"
  service: string; // layanan mis. "REG"
  description: string; // deskripsi layanan
  cost: number; // ongkir dalam rupiah
  etd: string; // estimasi (sudah dinormalisasi: "3", "2-4", "0" = hari ini)
  category: ShippingCategory; // REGULAR | EXPRESS | SPECIAL | CARGO
  note: string;
}

export interface DestinationHit {
  id: string;
  label: string;
  provinceName: string;
  cityName: string;
  districtName: string;
  subdistrictName: string;
  zipCode: string;
}

/**
 * Klasifikasikan layanan berdasarkan kode service + deskripsi dari provider.
 * Jangan asal sembunyikan harga — kategori dipakai frontend utk memisahkan
 * paket reguler dari cargo/trucking agar tidak tercampur di UI.
 */
export function categorizeService(service: string, description: string): ShippingCategory {
  const code = (service ?? '').toUpperCase();
  const lower = `${service ?? ''} ${description ?? ''}`.toLowerCase();

  // Cargo/trucking: JNE JTR & varian berat (JTR<130, JTR>130, JTR>200) + deskripsi trucking/cargo
  if (code.startsWith('JTR') || lower.includes('trucking') || lower.includes('cargo')) {
    return 'CARGO';
  }
  // Express: same-day / next-day / layanan kilat
  if (
    lower.includes('same day') ||
    lower.includes('sameday') ||
    lower.includes('next day') ||
    lower.includes('nextday') ||
    lower.includes('instant') ||
    lower.includes('yes') ||
    code.includes('YES')
  ) {
    return 'EXPRESS';
  }
  // Special (mis. JNE CTCSPS = City Courier Special/Same-day Pickup Service)
  if (lower.includes('special') || code.includes('SPS')) {
    return 'SPECIAL';
  }
  return 'REGULAR';
}

/** Normalisasi ETD dari response provider → angka/rentang saja ("3 day" → "3", "0 day" → "0"). */
export function normalizeEtd(etd: string): string {
  if (!etd) return '';
  return etd
    .toLowerCase()
    .replace(/\b(hari|day|jam|hr)\b/g, ' ')
    .replace(/[^0-9\-]/g, '')
    .trim();
}

@Injectable()
export class RajaOngkirService {
  private readonly logger = new Logger(RajaOngkirService.name);
  private originIdCache: string | null = null;
  private destCache = new Map<string, string>();
  private destCacheAt = 0;
  private costCache = new Map<string, { at: number; options: ShippingCostOption[] }>();

  constructor(private readonly eligibility: ShippingEligibilityService) {}

  private get apiKey(): string {
    return process.env.RAJAONGKIR_API_KEY ?? '';
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!this.apiKey) {
      throw new BadRequestException('RAJAONGKIR_API_KEY belum dikonfigurasi di backend');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(`${V2_BASE}${path}`, {
        ...init,
        headers: {
          key: this.apiKey,
          ...(init?.headers ?? {}),
        },
        signal: controller.signal,
      });
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        throw new BadRequestException('RajaOngkir timeout — coba lagi');
      }
      throw new BadRequestException('Gagal terhubung ke RajaOngkir');
    } finally {
      clearTimeout(timer);
    }

    const data = await res.json().catch(() => ({}));
    const meta = data?.meta;
    // V2 kadang tetap HTTP 200 walau gagal — wajib cek meta.status === "success"
    if (!res.ok || !meta || meta.status !== 'success') {
      const msg = meta?.message ?? `RajaOngkir error (${res.status})`;
      throw new BadRequestException(`Gagal memanggil RajaOngkir: ${msg}`);
    }
    return data;
  }

  private normalize(s: string): string {
    return (s ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .replace(
        /\b(kota|kabupaten|administrasi|adm|daerah istimewa|di|dki|provinsi|prov|kepulauan|kep)\b/g,
        ' ',
      )
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Search destination domestik (return id level sub-district/kelurahan). */
  async searchDestination(query: string, limit = 20, offset = 0): Promise<DestinationHit[]> {
    const q = encodeURIComponent(query);
    const data = await this.request<any>(
      `/destination/domestic-destination?search=${q}&limit=${limit}&offset=${offset}`,
    );
    const rows = Array.isArray(data?.data) ? data.data : [];
    return rows.map((r: any) => ({
      id: String(r.id),
      label: r.label ?? '',
      provinceName: r.province_name ?? '',
      cityName: r.city_name ?? '',
      districtName: r.district_name ?? '',
      subdistrictName: r.subdistrict_name ?? '',
      zipCode: r.zip_code ?? '',
    }));
  }

  /**
   * Resolve alamat bebas-teks (city + province + opsional district) menjadi
   * destination id RajaOngkir V2 (sub-district). Alamat hanya menyimpan teks,
   * jadi cocokkan hasil search dengan nama kota & provinsi (dinormalisasi) —
   * bukan menebak ID sembarangan.
   */
  async resolveDestinationId(city: string, province?: string, district?: string): Promise<string> {
    const key = `${this.normalize(city)}|${this.normalize(province ?? '')}|${this.normalize(district ?? '')}`;
    if (Date.now() - this.destCacheAt >= DEST_CACHE_TTL_MS) {
      this.destCache.clear();
    }
    const cached = this.destCache.get(key);
    if (cached) return cached;

    if (!this.normalize(city)) {
      throw new BadRequestException('Nama kota pada alamat tidak valid');
    }

    const results = await this.searchDestination(city, 50);

    let candidates = results.filter((r) => this.normalize(r.cityName) === this.normalize(city));
    if (province) {
      const withProvince = candidates.filter(
        (r) => this.normalize(r.provinceName) === this.normalize(province),
      );
      if (withProvince.length) candidates = withProvince;
    }

    let match: DestinationHit | undefined;
    if (district) {
      match = candidates.find(
        (r) => this.normalize(r.districtName) === this.normalize(district),
      );
    }
    if (!match && candidates.length) {
      match = candidates[0];
    }
    if (!match) {
      // Fallback partial match pada nama kota
      const partial = results.filter((r) =>
        this.normalize(r.cityName).includes(this.normalize(city)),
      );
      if (partial.length) {
        const withProvince = province
          ? partial.find((r) => this.normalize(r.provinceName) === this.normalize(province))
          : undefined;
        match = withProvince ?? partial[0];
      }
    }
    if (!match) {
      throw new BadRequestException(
        `Kota "${city}" tidak ditemukan di RajaOngkir. Periksa kembali alamat pengiriman.`,
      );
    }

    this.destCache.set(key, match.id);
    this.destCacheAt = Date.now();
    return match.id;
  }

  /**
   * Origin (lokasi toko). Prioritas:
   * 1. RAJAONGKIR_ORIGIN_ID — sub-district id (direkomendasikan, deterministik).
   * 2. RAJAONGKIR_ORIGIN_QUERY — nama kota (default "Klaten") di-resolve otomatis.
   * Hasil di-cache per proses.
   */
  async getOriginId(): Promise<string> {
    if (this.originIdCache) return this.originIdCache;

    const configured = process.env.RAJAONGKIR_ORIGIN_ID;
    if (configured) {
      this.originIdCache = configured;
      return configured;
    }

    const query = process.env.RAJAONGKIR_ORIGIN_QUERY ?? 'Klaten';
    const results = await this.searchDestination(query, 10);
    const match = results[0];
    if (!match) {
      throw new BadRequestException(
        'Lokasi asal pengiriman tidak ditemukan di RajaOngkir. Set RAJAONGKIR_ORIGIN_ID di backend.',
      );
    }
    this.originIdCache = match.id;
    return match.id;
  }

  /**
   * Hitung ongkir RajaOngkir V2 (POST /calculate/domestic-cost).
   * `origin` & `destination` adalah id sub-district dari search destination.
   * `courier` diisi kode kurir yang didukung (jne, jnt, sicepat, pos, tiki, ...).
   * Hasil di-cache pendek (5 menit) per kombinasi origin|destination|weight|courier.
   */
  async calculateCost(opts: {
    origin: string;
    destination: string;
    weight: number;
    courier: string;
  }): Promise<ShippingCostOption[]> {
    if (!opts.weight || opts.weight <= 0) {
      throw new BadRequestException('Weight must be greater than 0');
    }

    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(
        `RAJAONGKIR REQUEST origin=${opts.origin} destination=${opts.destination} weight=${opts.weight} courier=${opts.courier}`,
      );
    }

    const cacheKey = `${opts.origin}|${opts.destination}|${opts.weight}|${opts.courier}`;
    const cached = this.costCache.get(cacheKey);
    if (cached && Date.now() - cached.at < COST_CACHE_TTL_MS) {
      return cached.options;
    }

    const body = new URLSearchParams();
    body.set('origin', String(opts.origin));
    body.set('destination', String(opts.destination));
    body.set('weight', String(opts.weight));
    body.set('courier', opts.courier);

    const data = await this.request<any>(`/calculate/domestic-cost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`RAJAONGKIR RAW RESPONSE ${JSON.stringify(data)}`);
    }

    const rows = Array.isArray(data?.data) ? data.data : [];
    const options: ShippingCostOption[] = rows.map((r: any) => ({
      code: String(r.code ?? ''),
      name: String(r.name ?? ''),
      service: String(r.service ?? ''),
      description: String(r.description ?? ''),
      cost: Number(r.cost ?? 0),
      etd: normalizeEtd(String(r.etd ?? '')),
      category: categorizeService(r.service ?? '', r.description ?? ''),
      note: '',
    }));

    // ELIGIBILITY ENGINE (backend source of truth) — service tidak eligible
    // TIDAK dikirim ke frontend. Tidak ada filter harga / slice / index.
    const { eligible, rawCodes, decisions } = this.eligibility.filterEligibleServices(
      options,
      opts.weight,
    );

    if (process.env.NODE_ENV !== 'production') {
      const bar = '='.repeat(48);
      const lines = [
        `${bar}`,
        `SHIPPING CALCULATION`,
        `${bar}`,
        `Weight: ${opts.weight} grams / ${opts.weight / 1000} kg`,
        `Origin: ${opts.origin}`,
        `Destination: ${opts.destination}`,
        `Courier: ${opts.courier}`,
        ``,
        `RAW SERVICES: ${rawCodes.join(', ') || '(none)'}`,
        ``,
        `ELIGIBILITY:`,
        ...rawCodes.map((c) => `  ${c}${' '.repeat(Math.max(1, 24 - c.length))}→ ${decisions[c] ? 'YES' : 'NO'}`),
        ``,
        `FINAL SERVICES: ${eligible.map((o) => o.service).join(', ') || '(none)'}`,
        `${bar}`,
      ];
      this.logger.log(lines.join('\n'));
    }

    this.costCache.set(cacheKey, { at: Date.now(), options: eligible });
    return eligible;
  }
}