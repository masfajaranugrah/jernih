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
exports.HeroService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let HeroService = class HeroService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.heroBanner.findMany({
            orderBy: { position: 'asc' },
        });
    }
    async findByPosition(position) {
        const banner = await this.prisma.heroBanner.findUnique({ where: { position } });
        if (!banner)
            throw new common_1.NotFoundException(`Banner position ${position} tidak ditemukan`);
        return banner;
    }
    async upsert(position, dto) {
        return this.prisma.heroBanner.upsert({
            where: { position },
            create: { position, title: dto.title ?? '', ...dto },
            update: dto,
        });
    }
    async resetAll() {
        await this.prisma.heroBanner.deleteMany();
        return { message: 'Semua hero banner berhasil direset' };
    }
};
exports.HeroService = HeroService;
exports.HeroService = HeroService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HeroService);
//# sourceMappingURL=hero.service.js.map