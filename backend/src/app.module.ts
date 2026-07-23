import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MitraModule } from './mitra/mitra.module';
import { ProductsModule } from './products/products.module';
import { ServicesModule } from './services/services.module';
import { RentalsModule } from './rentals/rentals.module';
import { OrdersModule } from './orders/orders.module';
import { AddressesModule } from './addresses/addresses.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { ChatModule } from './chat/chat.module';
import { TicketsModule } from './tickets/tickets.module';
import { HeroModule } from './hero/hero.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { UploadModule } from './upload/upload.module';
import { SettingsModule } from './settings/settings.module';
import { CategoriesModule } from './categories/categories.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CsrfOriginMiddleware } from './common/middleware/csrf-origin.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limiting global: 100 request per 60 detik
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    MitraModule,
    ProductsModule,
    ServicesModule,
    RentalsModule,
    OrdersModule,
    AddressesModule,
    VouchersModule,
    ChatModule,
    TicketsModule,
    HeroModule,
    ComplaintsModule,
    UploadModule,
    SettingsModule,
    CategoriesModule,
    WishlistModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CsrfOriginMiddleware).forRoutes('*');
  }
}
