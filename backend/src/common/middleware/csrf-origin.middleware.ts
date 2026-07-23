// Middleware anti-CSRF — validasi Origin/Referer header untuk state-changing requests
// Mencegah attack dari situs eksternal yang mencoba pakai cookie pengguna

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CsrfOriginMiddleware implements NestMiddleware {
  // Domain yang diizinkan (ambil dari env)
  private allowedOrigins: string[];

  constructor() {
    const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
    this.allowedOrigins = corsOrigin.split(',').map((o) => o.trim());
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Hanya cek state-changing methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const origin = req.headers['origin'] as string | undefined;
    const referer = req.headers['referer'] as string | undefined;
    const source = origin ?? referer;

    // Jika tidak ada Origin/Referer, izinkan (misal: direct API call dari server)
    if (!source) {
      return next();
    }

    // Cek apakah Origin/Referer berasal dari domain yang diizinkan
    const isAllowed = this.allowedOrigins.some((allowed) =>
      source.startsWith(allowed),
    );

    if (!isAllowed) {
      return res.status(403).json({
        message: 'Forbidden: invalid request origin',
      });
    }

    next();
  }
}
