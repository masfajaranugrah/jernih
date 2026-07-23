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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MitraController = void 0;
const common_1 = require("@nestjs/common");
const mitra_service_1 = require("./mitra.service");
const create_mitra_dto_1 = require("./dto/create-mitra.dto");
const update_mitra_dto_1 = require("./dto/update-mitra.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let MitraController = class MitraController {
    constructor(mitraService) {
        this.mitraService = mitraService;
    }
    create(req, dto) {
        return this.mitraService.create(req.user.id, dto);
    }
    findAll(city) {
        return this.mitraService.findAll({ city });
    }
    findMe(req) {
        return this.mitraService.findByUser(req.user.id);
    }
    findOne(id) {
        return this.mitraService.findOne(id);
    }
    update(req, id, dto) {
        if (req.user.role !== 'ADMIN') {
            return this.mitraService.updateSafe(id, dto, req.user.id);
        }
        return this.mitraService.update(id, dto);
    }
    verify(id) {
        return this.mitraService.verify(id);
    }
};
exports.MitraController = MitraController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_mitra_dto_1.CreateMitraDto]),
    __metadata("design:returntype", void 0)
], MitraController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('city')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MitraController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MitraController.prototype, "findMe", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MitraController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_mitra_dto_1.UpdateMitraDto]),
    __metadata("design:returntype", void 0)
], MitraController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Patch)(':id/verify'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MitraController.prototype, "verify", null);
exports.MitraController = MitraController = __decorate([
    (0, common_1.Controller)('mitra'),
    __metadata("design:paramtypes", [mitra_service_1.MitraService])
], MitraController);
//# sourceMappingURL=mitra.controller.js.map