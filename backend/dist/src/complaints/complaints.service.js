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
exports.ComplaintsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ComplaintsService = class ComplaintsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.complaint.create({
            data: { userId, ...dto },
            include: { user: { select: { id: true, name: true, email: true } } },
        });
    }
    async findAll(userId) {
        return this.prisma.complaint.findMany({
            where: { ...(userId && { userId }) },
            include: {
                user: { select: { id: true, name: true } },
                order: { select: { id: true, total: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const complaint = await this.prisma.complaint.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                mitra: { select: { id: true, storeName: true } },
                order: true,
            },
        });
        if (!complaint)
            throw new common_1.NotFoundException('Komplain tidak ditemukan');
        return complaint;
    }
    async findOneSafe(id, requesterId, requesterRole) {
        const complaint = await this.findOne(id);
        if (complaint.userId !== requesterId && requesterRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Anda tidak memiliki akses ke komplain ini');
        }
        return complaint;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.complaint.update({ where: { id }, data: dto });
    }
};
exports.ComplaintsService = ComplaintsService;
exports.ComplaintsService = ComplaintsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ComplaintsService);
//# sourceMappingURL=complaints.service.js.map