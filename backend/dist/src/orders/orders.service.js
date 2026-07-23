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
        return this.prisma.$transaction(async (tx) => {
            let subtotal = 0;
            const itemsData = [];
            for (const item of dto.items) {
                let price = 0;
                let name = '';
                if (item.productId) {
                    const product = await tx.product.findUnique({ where: { id: item.productId } });
                    if (!product)
                        throw new common_1.NotFoundException(`Produk ${item.productId} tidak ditemukan`);
                    const qty = item.quantity ?? 1;
                    if (Number(product.stock) < qty) {
                        throw new common_1.BadRequestException(`Stok "${product.name}" tidak mencukupi. Tersedia: ${product.stock}, diminta: ${qty}`);
                    }
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: qty } },
                    });
                    price = Number(product.price);
                    name = product.name;
                }
                else if (item.serviceId) {
                    const service = await tx.service.findUnique({ where: { id: item.serviceId } });
                    if (!service)
                        throw new common_1.NotFoundException(`Jasa ${item.serviceId} tidak ditemukan`);
                    price = Number(service.priceFrom);
                    name = service.name;
                }
                else if (item.name && item.price) {
                    name = item.name;
                    price = item.price;
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
                const voucher = await tx.voucher.findUnique({
                    where: { code: dto.voucherCode },
                });
                if (!voucher || !voucher.isActive || voucher.usedCount >= voucher.quota) {
                    throw new common_1.BadRequestException('Voucher tidak valid atau sudah habis');
                }
                if (subtotal < Number(voucher.minPurchase)) {
                    throw new common_1.BadRequestException(`Minimum pembelian Rp ${Number(voucher.minPurchase).toLocaleString('id-ID')} untuk menggunakan voucher ini`);
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
                const voucherUse = await tx.voucherUse.create({
                    data: { voucherId: voucher.id, userId },
                });
                voucherUseId = voucherUse.id;
                await tx.voucher.update({
                    where: { id: voucher.id },
                    data: { usedCount: { increment: 1 } },
                });
            }
            const shippingCost = dto.shippingCost ?? 0;
            const total = subtotal - discountAmount + shippingCost;
            const orderNumber = dto.orderNumber || (() => {
                const uuid = crypto.randomUUID().replace(/-/g, '').toUpperCase();
                return 'ORD-' + uuid.slice(0, 9);
            })();
            return tx.order.create({
                data: {
                    userId,
                    orderNumber,
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
        });
    }
    async findAll(userId, status) {
        return this.prisma.order.findMany({
            where: {
                ...(userId && { userId }),
                ...(status && { status: status }),
            },
            include: {
                items: {
                    include: {
                        product: { select: { id: true, name: true, images: true } },
                        service: { select: { id: true, name: true, images: true } },
                    },
                },
                address: true,
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, requesterId, requesterRole) {
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
        if (requesterId && requesterRole !== 'ADMIN' && order.userId !== requesterId) {
            throw new common_1.ForbiddenException('Anda tidak memiliki akses ke order ini');
        }
        return order;
    }
    async updateStatus(id, dto) {
        await this.findOne(id);
        return this.prisma.order.update({
            where: { id },
            data: {
                status: dto.status,
                ...(dto.status === 'SHIPPED' && {
                    shippingCourier: dto.shippingCourier,
                    trackingNumber: dto.trackingNumber,
                }),
                ...(dto.status === 'DELIVERED' && { paidAt: new Date() }),
            },
        });
    }
    async sendBotMessage(orderId, customerId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order tidak ditemukan');
        const admin = await this.prisma.user.findFirst({
            where: { role: 'ADMIN', isActive: true },
            select: { id: true },
        });
        if (!admin)
            throw new common_1.NotFoundException('Admin tidak ditemukan');
        const orderNumber = order.orderNumber ?? order.id.slice(0, 8).toUpperCase();
        const itemSummary = order.items.map((i) => `${i.name} x${i.quantity}`).join(', ');
        const totalFormatted = `Rp ${Number(order.total).toLocaleString('id-ID')}`;
        let message;
        switch (order.status) {
            case 'PENDING':
                message = `✅ *Pesanan #${orderNumber}*\n\nTerima kasih sudah order! 🙏\n\nPesanan: ${itemSummary}\nTotal: ${totalFormatted}\n\nSilakan lakukan pembayaran ke salah satu rekening yang tertera di halaman pesanan. Jika sudah transfer, kirim bukti pembayaran di sini agar kami segera proses pesanan Anda.\n\n*Tim Jernih Creatife*`;
                break;
            case 'CONFIRMED':
            case 'PROCESSING':
                message = `📦 *Pesanan #${orderNumber}*\n\nMohon ditunggu, pesanan Anda sedang diproses oleh tim kami. Kami akan memberi tahu jika pesanan sudah dikirim.\n\nTerima kasih atas kesabaran Anda 🙏\n\n*Tim Jernih Creatife*`;
                break;
            case 'SHIPPED': {
                const courier = order.shippingCourier ? `Kurir: ${order.shippingCourier}` : '';
                const resi = order.trackingNumber ? `No. Resi: ${order.trackingNumber}` : '';
                const shippingInfo = [courier, resi].filter(Boolean).join('\n');
                message = `🚚 *Pesanan #${orderNumber}*\n\nPesanan Anda sudah dalam perjalanan!${shippingInfo ? `\n\n${shippingInfo}` : ''}\n\nSilakan cek halaman pesanan untuk update terbaru.\n\n*Tim Jernih Creatife*`;
                break;
            }
            case 'DELIVERED':
                message = `🎉 *Pesanan #${orderNumber}*\n\nPesanan Anda sudah terkirim! Terima kasih telah berbelanja di Jernih Creatife 🙏\n\nBantu kami dengan memberikan ulasan untuk produk yang Anda beli. Masukan Anda sangat berarti untuk kami.\n\nAda yang bisa kami bantu lagi? Silakan hubungi kami kapan saja.\n\n*Tim Jernih Creatife*`;
                break;
            case 'CANCELLED':
            case 'REFUNDED':
                message = `❌ *Pesanan #${orderNumber}*\n\nPesanan Anda telah dibatalkan. Jika ada pertanyaan silakan hubungi admin.\n\n*Tim Jernih Creatife*`;
                break;
            default:
                message = `📋 *Pesanan #${orderNumber}*\n\nStatus pesanan: ${order.status}. Silakan hubungi admin untuk informasi lebih lanjut.\n\n*Tim Jernih Creatife*`;
        }
        await this.prisma.chat.create({
            data: {
                senderId: admin.id,
                receiverId: customerId,
                message,
                isSystem: true,
            },
        });
        return { message: 'Bot message sent' };
    }
    async uploadPayment(id, userId, paymentProof) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order)
            throw new common_1.NotFoundException('Order tidak ditemukan');
        if (order.userId !== userId) {
            throw new common_1.ForbiddenException('Anda tidak memiliki akses ke order ini');
        }
        if (order.status !== 'PENDING') {
            throw new common_1.BadRequestException('Order sudah tidak dalam status menunggu pembayaran');
        }
        return this.prisma.order.update({
            where: { id },
            data: {
                paymentProof,
                status: 'CONFIRMED',
                paidAt: new Date(),
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