// shipping/../orders/voucher.exception.ts
// Error voucher terstruktur sesuai promt.md: { success: false, code, message }
import { HttpException, HttpStatus } from '@nestjs/common';

export class VoucherException extends HttpException {
  constructor(code: string, message: string) {
    super({ success: false, code, message }, HttpStatus.BAD_REQUEST);
  }
}