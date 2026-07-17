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
exports.VouchersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let VouchersService = class VouchersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.voucher.create({ data: dto });
    }
    async findAll() {
        return this.prisma.voucher.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async findAvailable(userId) {
        const now = new Date();
        const vouchers = await this.prisma.voucher.findMany({
            where: {
                isActive: true,
                OR: [{ startDate: null }, { startDate: { lte: now } }],
                AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
            },
            orderBy: { createdAt: 'desc' },
        });
        const uses = await this.prisma.voucherUse.findMany({
            where: { userId, voucherId: { in: vouchers.map((v) => v.id) } },
            select: { voucherId: true },
        });
        const usedIds = new Set(uses.map((u) => u.voucherId));
        return vouchers
            .filter((v) => v.usedCount < v.quota)
            .map((v) => ({ ...v, used: usedIds.has(v.id) }));
    }
    async findOne(id) {
        const voucher = await this.prisma.voucher.findUnique({ where: { id } });
        if (!voucher)
            throw new common_1.NotFoundException('Voucher tidak ditemukan');
        return voucher;
    }
    async validate(code, userId, subtotal) {
        const voucher = await this.prisma.voucher.findUnique({ where: { code } });
        if (!voucher || !voucher.isActive) {
            throw new common_1.BadRequestException('Voucher tidak ditemukan atau tidak aktif');
        }
        if (voucher.usedCount >= voucher.quota) {
            throw new common_1.BadRequestException('Kuota voucher sudah habis');
        }
        if (subtotal < Number(voucher.minPurchase)) {
            throw new common_1.BadRequestException(`Minimum pembelian Rp ${voucher.minPurchase}`);
        }
        if (voucher.startDate && new Date() < voucher.startDate) {
            throw new common_1.BadRequestException('Voucher belum berlaku');
        }
        if (voucher.endDate && new Date() > voucher.endDate) {
            throw new common_1.BadRequestException('Voucher sudah kadaluarsa');
        }
        const alreadyUsed = await this.prisma.voucherUse.findUnique({
            where: { voucherId_userId: { voucherId: voucher.id, userId } },
        });
        if (alreadyUsed) {
            throw new common_1.BadRequestException('Anda sudah pernah menggunakan voucher ini');
        }
        let discount = 0;
        if (voucher.type === 'PERCENTAGE') {
            discount = (subtotal * Number(voucher.value)) / 100;
            if (voucher.maxDiscount)
                discount = Math.min(discount, Number(voucher.maxDiscount));
        }
        else {
            discount = Math.min(Number(voucher.value), subtotal);
        }
        return { voucher, discount };
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.voucher.delete({ where: { id } });
        return { message: 'Voucher berhasil dihapus' };
    }
};
exports.VouchersService = VouchersService;
exports.VouchersService = VouchersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VouchersService);
//# sourceMappingURL=vouchers.service.js.map