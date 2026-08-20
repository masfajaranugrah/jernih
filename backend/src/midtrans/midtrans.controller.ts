// midtrans/midtrans.controller.ts
// Endpoint legacy webhook Midtrans — mendelegasikan ke PaymentsService
// (endpoint resmi: POST /payments/midtrans/webhook).
import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { PaymentsService } from '../payments/payments.service';

@Controller('midtrans')
export class MidtransController {
  constructor(private readonly payments: PaymentsService) {}

  /**
   * POST /midtrans/notification — alias lama webhook Midtrans.
   * Delegate ke PaymentsService agar logika (signature, idempotency, transaction)
   * tetap satu sumber.
   */
  @Post('notification')
  @HttpCode(200)
  notification(@Body() payload: any) {
    return this.payments.processMidtransNotification(payload);
  }
}
