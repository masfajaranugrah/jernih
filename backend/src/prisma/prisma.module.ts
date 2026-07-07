import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // PrismaService tersedia di seluruh modul tanpa import ulang
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
