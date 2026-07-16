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
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ServicesService = class ServicesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        try {
            return await this.prisma.service.create({ data: dto });
        }
        catch (err) {
            if (err?.message?.includes('numeric field overflow') || err?.code === '22003') {
                throw new common_1.BadRequestException('Harga terlalu besar. Maksimum adalah Rp 9.999.999.999');
            }
            if (err?.code === 'P2002') {
                throw new common_1.BadRequestException('Slug jasa sudah digunakan, gunakan nama yang berbeda.');
            }
            throw err;
        }
    }
    async findAll(query) {
        return this.prisma.service.findMany({
            where: {
                isActive: true,
                ...(query?.search && {
                    OR: [
                        { name: { contains: query.search, mode: 'insensitive' } },
                        { description: { contains: query.search, mode: 'insensitive' } },
                    ],
                }),
                ...(query?.categoryId && { categoryId: query.categoryId }),
                ...(query?.mitraId && { mitraId: query.mitraId }),
            },
            include: {
                mitra: { select: { id: true, storeName: true, city: true } },
                category: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const service = await this.prisma.service.findUnique({
            where: { id },
            include: {
                mitra: { select: { id: true, storeName: true, logo: true, city: true, rating: true } },
                category: true,
            },
        });
        if (!service)
            throw new common_1.NotFoundException('Jasa tidak ditemukan');
        return service;
    }
    async findBySlug(slug) {
        const service = await this.prisma.service.findUnique({
            where: { slug },
            include: {
                mitra: { select: { id: true, storeName: true, logo: true, city: true, rating: true } },
                category: true,
            },
        });
        if (!service)
            throw new common_1.NotFoundException('Jasa tidak ditemukan');
        return service;
    }
    async update(id, dto) {
        await this.findOne(id);
        try {
            return await this.prisma.service.update({ where: { id }, data: dto });
        }
        catch (err) {
            if (err?.message?.includes('numeric field overflow') || err?.code === '22003') {
                throw new common_1.BadRequestException('Harga terlalu besar. Maksimum adalah Rp 9.999.999.999');
            }
            if (err?.code === 'P2002') {
                throw new common_1.BadRequestException('Slug jasa sudah digunakan, gunakan nama yang berbeda.');
            }
            throw err;
        }
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.service.delete({ where: { id } });
        return { message: 'Jasa berhasil dihapus' };
    }
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServicesService);
//# sourceMappingURL=services.service.js.map