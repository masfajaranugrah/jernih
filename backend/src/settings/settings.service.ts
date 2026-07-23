import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULTS: Record<string, any> = {
  toko: {
    storeName: 'Jernih Creative Official',
    storeTagline: 'Platform belanja terpercaya dengan produk berkualitas pilihan.',
    whatsapp: '6281318638100',
    email: 'hello@jernihcreative.id',
    address: 'Indonesia',
    instagram: '@jernihcreative',
    footerDesc: 'Platform belanja terpercaya dengan produk berkualitas pilihan.',
  },
  homepage_sections: {
    showHero: true,
    showPromo: true,
    showProduct: true,
    showJasa: true,
    showSewa: true,
  },
};

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  // Whitelist key yang bisa dibaca publik — selain ini butuh auth
  private readonly publicKeys = new Set([
    'homepage_sections',
    'promo_cards',
    'maintenance_mode',
    'toko',
  ]);

  async getSetting(key: string) {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });
    if (!setting) {
      return DEFAULTS[key] ?? null;
    }
    // Hanya kembalikan nilai untuk key yang ada di whitelist
    if (!this.publicKeys.has(key)) {
      return null;
    }
    try {
      return JSON.parse(setting.value);
    } catch {
      return setting.value;
    }
  }

  async saveSetting(key: string, value: any) {
    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
    const updated = await this.prisma.systemSetting.upsert({
      where: { key },
      create: { key, value: valueStr },
      update: { value: valueStr },
    });
    try {
      return JSON.parse(updated.value);
    } catch {
      return updated.value;
    }
  }
}
