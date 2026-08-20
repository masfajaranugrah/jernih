import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request, Headers as ReqHeaders } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UploadPaymentDto } from './dto/upload-payment.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { UpdateOrderShippingDto } from './dto/update-order-shipping.dto';
import { ConfirmReceivedDto } from './dto/confirm-received.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateOrderDto, @ReqHeaders('idempotency-key') idemKey?: string) {
    const key = dto.idempotencyKey ?? idemKey ?? null;
    return this.ordersService.create(req.user.id, dto, key);
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const isAdmin = req.user.role === 'ADMIN';
    return this.ordersService.findAll(
      isAdmin ? undefined : req.user.id,
      status,
      page ? Math.max(1, Number(page)) : 1,
      limit ? Math.min(100, Math.max(1, Number(limit))) : 20,
    );
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.findOne(id, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }

  /** POST /api/orders/:id/bot-message — kirim bot message dari admin ke customer */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post(':id/bot-message')
  sendBotMessage(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.sendBotMessage(id, req.user.id);
  }

  /** POST /api/orders/:id/payment-intent — buat payment-intent Midtrans (Snap token) */
  @Post(':id/payment-intent')
  createPaymentIntent(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CreatePaymentIntentDto,
  ) {
    return this.ordersService.createPaymentIntent(id, req.user.id, dto.paymentMethod);
  }

  /** PATCH /api/orders/:id/shipping — simpan pilihan pengiriman (backend hitung ulang ongkir) */
  @Patch(':id/shipping')
  updateShipping(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateOrderShippingDto) {
    return this.ordersService.updateShipping(id, req.user.id, dto);
  }

  /** POST /api/orders/:id/confirm-received — konfirmasi diterima + bukti + rating + ulasan */
  @Post(':id/confirm-received')
  confirmReceived(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ConfirmReceivedDto,
  ) {
    return this.ordersService.confirmReceived(id, req.user.id, dto);
  }

  /** PATCH /api/orders/:id/payment — upload bukti bayar oleh customer */
  @Patch(':id/payment')
  uploadPayment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UploadPaymentDto,
  ) {
    return this.ordersService.uploadPayment(id, req.user.id, dto.paymentProof);
  }

  /** POST /api/orders/:id/vouchers — terapkan voucher (DISCOUNT produk / SHIPPING ongkir) */
  @Post(':id/vouchers')
  applyVoucher(@Request() req: any, @Param('id') id: string, @Body('voucherCode') voucherCode: string) {
    return this.ordersService.applyVoucher(id, req.user.id, voucherCode);
  }

  /** DELETE /api/orders/:id/vouchers/:voucherId — hapus voucher dari order */
  @Delete(':id/vouchers/:voucherId')
  removeVoucher(@Request() req: any, @Param('id') id: string, @Param('voucherId') voucherId: string) {
    return this.ordersService.removeVoucher(id, req.user.id, voucherId);
  }
}
