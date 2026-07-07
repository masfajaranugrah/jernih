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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OrdersService = class OrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        let subtotal = 0;
        const itemsData = [];
        for (const item of dto.items) {
            let price = 0;
            let name = '';
            if (item.productId) {
                const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
                if (!product)
                    throw new common_1.NotFoundException(`Produk ${item.productId} tidak ditemukan`);
                price = Number(product.price);
                name = product.name;
            }
            else if (item.serviceId) {
                const service = await this.prisma.service.findUnique({ where: { id: item.serviceId } });
                if (!service)
                    throw new common_1.NotFoundException(`Jasa ${item.serviceId} tidak ditemukan`);
                price = Number(service.priceFrom);
                name = service.name;
            }
            const qty = item.quantity ?? 1;
            const itemSubtotal = price * qty;
            subtotal += itemSubtotal;
            itemsData.push({
                productId: item.productId,
                serviceId: item.serviceId,
                name,
                price,
                quantity: qty,
                subtotal: itemSubtotal,
            });
        }
        let discountAmount = 0;
        let voucherUseId;
        if (dto.voucherCode) {
            const voucher = await this.prisma.voucher.findUnique({
                where: { code: dto.voucherCode },
            });
            if (!voucher || !voucher.isActive || voucher.usedCount >= voucher.quota) {
                throw new common_1.BadRequestException('Voucher tidak valid atau sudah habis');
            }
            if (subtotal < Number(voucher.minPurchase)) {
                throw new common_1.BadRequestException(`Minimum pembelian Rp ${voucher.minPurchase} untuk menggunakan voucher ini`);
            }
            if (voucher.type === 'PERCENTAGE') {
                discountAmount = (subtotal * Number(voucher.value)) / 100;
                if (voucher.maxDiscount) {
                    discountAmount = Math.min(discountAmount, Number(voucher.maxDiscount));
                }
            }
            else {
                discountAmount = Math.min(Number(voucher.value), subtotal);
            }
            const voucherUse = await this.prisma.voucherUse.create({
                data: { voucherId: voucher.id, userId },
            });
            voucherUseId = voucherUse.id;
            await this.prisma.voucher.update({
                where: { id: voucher.id },
                data: { usedCount: { increment: 1 } },
            });
        }
        const shippingCost = dto.shippingCost ?? 0;
        const total = subtotal - discountAmount + shippingCost;
        return this.prisma.order.create({
            data: {
                userId,
                addressId: dto.addressId,
                voucherUseId,
                subtotal,
                discountAmount,
                shippingCost,
                total,
                notes: dto.notes,
                paymentMethod: dto.paymentMethod,
                items: { create: itemsData },
            },
            include: { items: true, address: true },
        });
    }
    async findAll(userId, status) {
        return this.prisma.order.findMany({
            where: {
                ...(userId && { userId }),
                ...(status && { status: status }),
            },
            include: {
                items: true,
                address: true,
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: { select: { id: true, name: true, images: true } },
                        service: { select: { id: true, name: true, images: true } },
                    },
                },
                address: true,
                user: { select: { id: true, name: true, email: true, phone: true } },
                voucherUse: { include: { voucher: true } },
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order tidak ditemukan');
        return order;
    }
    async updateStatus(id, dto) {
        await this.findOne(id);
        return this.prisma.order.update({
            where: { id },
            data: {
                status: dto.status,
                ...(dto.status === 'DELIVERED' && { paidAt: new Date() }),
            },
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map