import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { HeroModule } from './hero/hero.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { UploadModule } from './upload/upload.module';
import { SettingsModule } from './settings/settings.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    HeroModule,
    ComplaintsModule,
    UploadModule,
    SettingsModule,
    CategoriesModule,
  ],
})
export class AppModule {}
