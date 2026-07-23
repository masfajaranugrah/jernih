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
exports.CsrfOriginMiddleware = void 0;
const common_1 = require("@nestjs/common");
let CsrfOriginMiddleware = class CsrfOriginMiddleware {
    constructor() {
        const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
        this.allowedOrigins = corsOrigin.split(',').map((o) => o.trim());
    }
    use(req, res, next) {
        if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
            return next();
        }
        const origin = req.headers['origin'];
        const referer = req.headers['referer'];
        const source = origin ?? referer;
        if (!source) {
            return next();
        }
        const isAllowed = this.allowedOrigins.some((allowed) => source.startsWith(allowed));
        if (!isAllowed) {
            return res.status(403).json({
                message: 'Forbidden: invalid request origin',
            });
        }
        next();
    }
};
exports.CsrfOriginMiddleware = CsrfOriginMiddleware;
exports.CsrfOriginMiddleware = CsrfOriginMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CsrfOriginMiddleware);
//# sourceMappingURL=csrf-origin.middleware.js.map