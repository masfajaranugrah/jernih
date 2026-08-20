// payments/payments.controller.ts
import { Controller, Post, Get, Param, Body, UseGuards, Request, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * POST /payments/midtrans/notification — webhook notifikasi pembayaran dari Midtrans.
   * PUBLIC (tanpa guard auth, tanpa CSRF) — dipanggil server Midtrans.
   * Ini URL KANONIK untuk "Payment Notification URL" di dashboard Midtrans.
   * Keamanan dijamin oleh verifikasi signature (server key hanya di backend).
   */
  @Post('midtrans/notification')
  @HttpCode(200)
  notification(@Body() payload: any) {
    return this.paymentsService.processMidtransNotification(payload);
  }

  /**
   * POST /payments/midtrans/webhook — alias lama webhook notifikasi.
   * Dipertahankan agar konfigurasi Midtrans yang sudah ada tidak rusak.
   * Logika sama persis dengan /payments/midtrans/notification.
   */
  @Post('midtrans/webhook')
  @HttpCode(200)
  webhook(@Body() payload: any) {
    return this.paymentsService.processMidtransNotification(payload);
  }

  /**
   * GET /payments/:orderNumber/status — status pembayaran dari database (source of truth).
   * Hanya pemilik order atau ADMIN. Endpoint ini juga melakukan recovery
   * (cek ke Midtrans) jika webhook terlambat dan DB masih PENDING.
   */
  @UseGuards(JwtAuthGuard)
  @Get(':orderNumber/status')
  status(
    @Request() req: any,
    @Param('orderNumber') orderNumber: string,
  ) {
    return this.paymentsService.getStatus(orderNumber, req.user.id, req.user.role);
  }
}
