import { Module } from '@nestjs/common';
import { MitraController } from './mitra.controller';
import { MitraService } from './mitra.service';

@Module({
  controllers: [MitraController],
  providers: [MitraService],
  exports: [MitraService],
})
export class MitraModule {}
