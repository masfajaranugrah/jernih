// shipping/shipping.controller.ts
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { CalculateShippingCostDto } from './dto/calculate-shipping-cost.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  /**
   * POST /api/shipping/cost
   * Hitung biaya ongkir (RajaOngkir) untuk alamat milik user yang sedang login.
   * Request:  { "addressId": "ADDRESS_ID", "courier": "jne" }
   */
  @Post('cost')
  cost(@Request() req: any, @Body() dto: CalculateShippingCostDto) {
    return this.shippingService.getCost(req.user.id, dto);
  }
}