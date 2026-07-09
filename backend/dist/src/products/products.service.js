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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsService = class ProductsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        try {
            return await this.prisma.product.create({
                data: dto,
            });
        }
        catch (err) {
            if (err?.message?.includes('numeric field overflow') || err?.code === '22003') {
                throw new common_1.BadRequestException('Harga yang dimasukkan terlalu besar. Maksimum harga adalah Rp 9.999.999.999');
            }
            if (err?.code === 'P2002') {
                throw new common_1.BadRequestException('Slug produk sudah digunakan, gunakan nama yang berbeda.');
            }
            throw err;
        }
    }
    async findAll(query) {
        const page = Math.max(1, Number(query?.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query?.limit) || 20));
        const skip = (page - 1) * limit;
        const where = {
            isActive: true,
            ...(query?.search && {
                OR: [
                    { name: { contains: query.search, mode: 'insensitive' } },
                    { description: { contains: query.search, mode: 'insensitive' } },
                ],
            }),
            ...(query?.categoryId && { categoryId: query.categoryId }),
            ...(query?.minPrice !== undefined && !isNaN(Number(query.minPrice)) && {
                price: { gte: Number(query.minPrice) },
            }),
            ...(query?.maxPrice !== undefined && !isNaN(Number(query.maxPrice)) && {
                price: { lte: Number(query.maxPrice) },
            }),
        };
        const [data, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                include: {
                    category: { select: { id: true, name: true, slug: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.product.count({ where }),
        ]);
        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
            },
        });
        if (!product)
            throw new common_1.NotFoundException('Produk tidak ditemukan');
        return product;
    }
    async findBySlug(slug) {
        const product = await this.prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
            },
        });
        if (!product)
            throw new common_1.NotFoundException('Produk tidak ditemukan');
        return product;
    }
    async update(id, dto) {
        await this.findOne(id);
        try {
            return await this.prisma.product.update({ where: { id }, data: dto });
        }
        catch (err) {
            if (err?.message?.includes('numeric field overflow') || err?.code === '22003') {
                throw new common_1.BadRequestException('Harga yang dimasukkan terlalu besar. Maksimum harga adalah Rp 9.999.999.999');
            }
            if (err?.code === 'P2002') {
                throw new common_1.BadRequestException('Slug produk sudah digunakan, gunakan nama yang berbeda.');
            }
            throw err;
        }
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.product.delete({ where: { id } });
        return { message: 'Produk berhasil dihapus' };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map