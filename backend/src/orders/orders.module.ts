import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderExpirationService } from './order-expiration.service';
import { MidtransModule } from '../midtrans/midtrans.module';
import { ShippingModule } from '../shipping/shipping.module';

@Module({
  imports: [MidtransModule, ShippingModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderExpirationService],
})
export class OrdersModule {}
