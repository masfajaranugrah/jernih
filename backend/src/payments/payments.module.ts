// payments/payments.module.ts
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ChatModule } from '../chat/chat.module';
import { MidtransService } from '../midtrans/midtrans.service';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [DatabaseModule, ChatModule],
  controllers: [PaymentsController],
  providers: [MidtransService, PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
