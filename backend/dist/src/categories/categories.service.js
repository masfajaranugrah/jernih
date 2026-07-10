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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const slug = dto.slug || dto.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        try {
            return await this.prisma.category.create({
                data: {
                    name: dto.name,
                    slug,
                    icon: dto.icon || null,
                },
            });
        }
        catch (err) {
            if (err?.code === 'P2002') {
                throw new common_1.BadRequestException('Nama atau slug kategori sudah digunakan.');
            }
            throw err;
        }
    }
    async findAll() {
        return await this.prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });
        if (!category)
            throw new common_1.NotFoundException('Kategori tidak ditemukan');
        return category;
    }
    async update(id, dto) {
        await this.findOne(id);
        const data = { ...dto };
        if (dto.name && !dto.slug) {
            data.slug = dto.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        }
        try {
            return await this.prisma.category.update({
                where: { id },
                data,
            });
        }
        catch (err) {
            if (err?.code === 'P2002') {
                throw new common_1.BadRequestException('Nama atau slug kategori sudah digunakan.');
            }
            throw err;
        }
    }
    async remove(id) {
        await this.findOne(id);
        try {
            return await this.prisma.category.delete({
                where: { id },
            });
        }
        catch (err) {
            throw new common_1.BadRequestException('Tidak dapat menghapus kategori karena masih digunakan oleh produk/jasa.');
        }
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map