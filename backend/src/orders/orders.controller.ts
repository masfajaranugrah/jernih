import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UploadPaymentDto } from './dto/upload-payment.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, dto);
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

  /** PATCH /api/orders/:id/payment — upload bukti bayar oleh customer */
  @Patch(':id/payment')
  uploadPayment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UploadPaymentDto,
  ) {
    return this.ordersService.uploadPayment(id, req.user.id, dto.paymentProof);
  }
}
