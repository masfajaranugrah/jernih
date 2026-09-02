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
   * POST /payments/midtrans/webhook — endpoint lama (DEPRECATED).
   * Dikembalikan 410 Gone agar konfigurasi lama diperbarui ke /notification.
   * Jika Anda masih menggunakan URL ini di dashboard Midtrans, perbarui ke:
   *   POST /payments/midtrans/notification
   */
  @Post('midtrans/webhook')
  @HttpCode(410)
  webhook() {
    return {
      message: 'Endpoint ini sudah tidak aktif. Gunakan /payments/midtrans/notification',
      status_code: 410,
    };
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
