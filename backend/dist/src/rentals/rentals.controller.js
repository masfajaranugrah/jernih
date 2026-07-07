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
exports.RentalsController = void 0;
const common_1 = require("@nestjs/common");
const rentals_service_1 = require("./rentals.service");
const create_rental_dto_1 = require("./dto/create-rental.dto");
const update_rental_dto_1 = require("./dto/update-rental.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let RentalsController = class RentalsController {
    constructor(rentalsService) {
        this.rentalsService = rentalsService;
    }
    findAllItems(search) {
        return this.rentalsService.findAllItems({ search });
    }
    create(req, dto) {
        return this.rentalsService.create(req.user.id, dto);
    }
    findAll(req, mitraId) {
        const isAdmin = req.user.role === 'ADMIN';
        return this.rentalsService.findAll(isAdmin ? undefined : req.user.id, mitraId);
    }
    findOne(id) {
        return this.rentalsService.findOne(id);
    }
    update(id, dto) {
        return this.rentalsService.update(id, dto);
    }
};
exports.RentalsController = RentalsController;
__decorate([
    (0, common_1.Get)('items'),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RentalsController.prototype, "findAllItems", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_rental_dto_1.CreateRentalDto]),
    __metadata("design:returntype", void 0)
], RentalsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('mitraId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RentalsController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RentalsController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_rental_dto_1.UpdateRentalDto]),
    __metadata("design:returntype", void 0)
], RentalsController.prototype, "update", null);
exports.RentalsController = RentalsController = __decorate([
    (0, common_1.Controller)('rentals'),
    __metadata("design:paramtypes", [rentals_service_1.RentalsService])
], RentalsController);
//# sourceMappingURL=rentals.controller.js.map