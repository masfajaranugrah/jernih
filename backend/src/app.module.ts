import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MitraModule } from './mitra/mitra.module';
import { ProductsModule } from './products/products.module';
import { PromosModule } from './promos/promos.module';
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
import { MidtransModule } from './midtrans/midtrans.module';
import { PaymentsModule } from './payments/payments.module';
import { ShippingModule } from './shipping/shipping.module';
import { CsrfOriginMiddleware } from './common/middleware/csrf-origin.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limiting global: 100 request per 60 detik
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    MitraModule,
    ProductsModule,
    PromosModule,
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
    MidtransModule,
    PaymentsModule,
    ShippingModule,
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
    // Exclude webhook Midtrans — dipanggil server Midtrans (tanpa Origin/Referer
    // dari domain kita), jadi tidak boleh dihambat middleware anti-CSRF.
    consumer
      .apply(CsrfOriginMiddleware)
      .exclude(
        'midtrans/notification',
        'payments/midtrans/notification',
        'payments/midtrans/webhook',
      )
      .forRoutes('*');
  }
}
