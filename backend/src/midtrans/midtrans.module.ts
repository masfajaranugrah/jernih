// midtrans/midtrans.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MidtransService } from './midtrans.service';
import { MidtransController } from './midtrans.controller';

@Module({
  imports: [PrismaModule],
  controllers: [MidtransController],
  providers: [MidtransService],
  exports: [MidtransService],
})
export class MidtransModule {}
