import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Gzip/Brotli compression — kurangi ukuran response JSON hingga 70%
  app.use(compression({ level: 6, threshold: 1024 }));

  // Serve static files dari public/ — pakai process.cwd() agar konsisten
  app.useStaticAssets(join(process.cwd(), 'public'));

  // Global prefix untuk semua route
  app.setGlobalPrefix('api');

  // Validasi DTO otomatis via class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS — izinkan Next.js frontend
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Backend berjalan di http://localhost:${port}/api`);
}

bootstrap();
