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
exports.RentalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RentalsService = class RentalsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const item = await this.prisma.rentalItem.findUnique({
            where: { id: dto.rentalItemId },
        });
        if (!item)
            throw new common_1.NotFoundException('Item sewa tidak ditemukan');
        const start = new Date(dto.startDate);
        const end = new Date(dto.endDate);
        if (end <= start) {
            throw new common_1.BadRequestException('Tanggal selesai harus setelah tanggal mulai');
        }
        const totalDays = Math.ceil((end.getTime() - start.getTime()) /
            (1000 * 60 * 60 * 24));
        const totalPrice = Number(item.pricePerDay) * totalDays;
        return this.prisma.rental.create({
            data: {
                userId,
                mitraId: item.mitraId ?? dto.mitraId,
                rentalItemId: dto.rentalItemId,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                totalDays,
                totalPrice,
                notes: dto.notes,
            },
            include: { rentalItem: true },
        });
    }
    async findAll(userId, mitraId) {
        return this.prisma.rental.findMany({
            where: {
                ...(userId && { userId }),
                ...(mitraId && { mitraId }),
            },
            include: {
                rentalItem: true,
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const rental = await this.prisma.rental.findUnique({
            where: { id },
            include: {
                rentalItem: true,
                user: { select: { id: true, name: true, email: true, phone: true } },
                mitra: { select: { id: true, storeName: true } },
            },
        });
        if (!rental)
            throw new common_1.NotFoundException('Data sewa tidak ditemukan');
        return rental;
    }
    async findOneSafe(id, requesterId, requesterRole) {
        const rental = await this.findOne(id);
        if (rental.userId !== requesterId && requesterRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Anda tidak memiliki akses ke data sewa ini');
        }
        return rental;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.rental.update({ where: { id }, data: dto });
    }
    async findAllItems(query) {
        const where = {};
        if (!query?.all)
            where.isActive = true;
        if (query?.search) {
            where.name = { contains: query.search, mode: 'insensitive' };
        }
        return this.prisma.rentalItem.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findItemById(id) {
        const item = await this.prisma.rentalItem.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Item sewa tidak ditemukan');
        return item;
    }
    async findItemBySlug(slug) {
        const item = await this.prisma.rentalItem.findUnique({ where: { slug } });
        if (!item)
            throw new common_1.NotFoundException('Item sewa tidak ditemukan');
        return item;
    }
    async createItem(dto) {
        return this.prisma.rentalItem.create({
            data: {
                name: dto.name,
                slug: dto.slug,
                description: dto.description,
                pricePerDay: dto.pricePerDay,
                deposit: dto.deposit,
                images: dto.images ?? [],
                isActive: dto.isActive ?? true,
            },
        });
    }
    async updateItem(id, dto) {
        await this.findItemById(id);
        return this.prisma.rentalItem.update({ where: { id }, data: dto });
    }
    async removeItem(id) {
        await this.findItemById(id);
        return this.prisma.rentalItem.delete({ where: { id } });
    }
};
exports.RentalsService = RentalsService;
exports.RentalsService = RentalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RentalsService);
//# sourceMappingURL=rentals.service.js.map