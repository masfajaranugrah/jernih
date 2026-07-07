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
exports.MitraService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MitraService = class MitraService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const existing = await this.prisma.mitra.findUnique({ where: { userId } });
        if (existing)
            throw new common_1.ConflictException('Akun mitra sudah terdaftar');
        return this.prisma.mitra.create({
            data: { userId, ...dto },
        });
    }
    async findAll(query) {
        return this.prisma.mitra.findMany({
            where: {
                isActive: true,
                ...(query?.city && { city: { contains: query.city, mode: 'insensitive' } }),
                ...(query?.isVerified !== undefined && { isVerified: query.isVerified }),
            },
            include: {
                user: { select: { name: true, email: true, avatar: true } },
                _count: { select: { products: true, services: true } },
            },
            orderBy: { rating: 'desc' },
        });
    }
    async findOne(id) {
        const mitra = await this.prisma.mitra.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, email: true, avatar: true } },
                products: { where: { isActive: true }, take: 8 },
                services: { where: { isActive: true }, take: 8 },
                _count: { select: { products: true, services: true, rentals: true } },
            },
        });
        if (!mitra)
            throw new common_1.NotFoundException('Mitra tidak ditemukan');
        return mitra;
    }
    async findByUser(userId) {
        return this.prisma.mitra.findUnique({
            where: { userId },
            include: {
                _count: { select: { products: true, services: true, rentals: true } },
            },
        });
    }
    async update(id, dto) {
        return this.prisma.mitra.update({ where: { id }, data: dto });
    }
    async verify(id) {
        return this.prisma.mitra.update({
            where: { id },
            data: { isVerified: true },
        });
    }
};
exports.MitraService = MitraService;
exports.MitraService = MitraService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MitraService);
//# sourceMappingURL=mitra.service.js.map