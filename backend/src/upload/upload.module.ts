import { Module } from '@nestjs/common';
import { UploadController, UploadsPublicController } from './upload.controller';

@Module({
  controllers: [UploadController, UploadsPublicController],
})
export class UploadModule {}

