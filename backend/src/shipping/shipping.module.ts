// shipping/shipping.module.ts
import { Module } from '@nestjs/common';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';
import { RajaOngkirService } from './rajaongkir.service';
import { ShippingEligibilityService } from './shipping-eligibility.service';

@Module({
  controllers: [ShippingController],
  providers: [ShippingService, RajaOngkirService, ShippingEligibilityService],
  exports: [ShippingService, RajaOngkirService],
})
export class ShippingModule {}