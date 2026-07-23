"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const mitra_module_1 = require("./mitra/mitra.module");
const products_module_1 = require("./products/products.module");
const services_module_1 = require("./services/services.module");
const rentals_module_1 = require("./rentals/rentals.module");
const orders_module_1 = require("./orders/orders.module");
const addresses_module_1 = require("./addresses/addresses.module");
const vouchers_module_1 = require("./vouchers/vouchers.module");
const chat_module_1 = require("./chat/chat.module");
const tickets_module_1 = require("./tickets/tickets.module");
const hero_module_1 = require("./hero/hero.module");
const complaints_module_1 = require("./complaints/complaints.module");
const upload_module_1 = require("./upload/upload.module");
const settings_module_1 = require("./settings/settings.module");
const categories_module_1 = require("./categories/categories.module");
const wishlist_module_1 = require("./wishlist/wishlist.module");
const csrf_origin_middleware_1 = require("./common/middleware/csrf-origin.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(csrf_origin_middleware_1.CsrfOriginMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 100,
                }]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            mitra_module_1.MitraModule,
            products_module_1.ProductsModule,
            services_module_1.ServicesModule,
            rentals_module_1.RentalsModule,
            orders_module_1.OrdersModule,
            addresses_module_1.AddressesModule,
            vouchers_module_1.VouchersModule,
            chat_module_1.ChatModule,
            tickets_module_1.TicketsModule,
            hero_module_1.HeroModule,
            complaints_module_1.ComplaintsModule,
            upload_module_1.UploadModule,
            settings_module_1.SettingsModule,
            categories_module_1.CategoriesModule,
            wishlist_module_1.WishlistModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map