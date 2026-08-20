// midtrans/midtrans.module.ts
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PaymentsModule } from '../payments/payments.module';
import { MidtransService } from './midtrans.service';
import { MidtransController } from './midtrans.controller';

@Module({
  imports: [DatabaseModule, PaymentsModule],
  controllers: [MidtransController],
  providers: [MidtransService],
  exports: [MidtransService],
})
export class MidtransModule {}
