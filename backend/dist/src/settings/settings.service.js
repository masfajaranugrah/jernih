"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const DEFAULTS = {
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
let SettingsService = class SettingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSetting(key) {
        const setting = await this.prisma.systemSetting.findUnique({
            where: { key },
        });
        if (!setting) {
            return DEFAULTS[key] ?? null;
        }
        try {
            return JSON.parse(setting.value);
        }
        catch {
            return setting.value;
        }
    }
    async saveSetting(key, value) {
        const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
        const updated = await this.prisma.systemSetting.upsert({
            where: { key },
            create: { key, value: valueStr },
            update: { value: valueStr },
        });
        try {
            return JSON.parse(updated.value);
        }
        catch {
            return updated.value;
        }
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map