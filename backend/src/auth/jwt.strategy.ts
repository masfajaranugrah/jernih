import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

export type JwtPayload = {
  sub: string;  // user id
  name: string;
  email: string;
  role: string;
  tokenVersion: number;
};

// ── Ringan: cache 5 detik untuk user yang sudah divalidasi ─────────────────
type CachedUser = {
  id: string; email: string; name: string; role: string;
  isActive: boolean; tokenVersion: number; mitraId: string | null;
};
const userCache = new Map<string, { user: CachedUser; expiry: number }>();
const CACHE_TTL = 5_000; // 5 detik — tidak perlu realtime untuk data user
const CACHE_MAX_SIZE = 5_000; // Batas maksimum entri — cegah memory leak

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly database: DatabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // Cek cache — hindari DB query jika user masih valid
    const cached = userCache.get(payload.sub);
    if (cached && cached.expiry > Date.now()) {
      if (payload.tokenVersion !== cached.user.tokenVersion) {
        throw new UnauthorizedException('Sesi telah berakhir, silakan login ulang');
      }
      if (!cached.user.isActive) {
        throw new UnauthorizedException('Akun tidak aktif');
      }
      const { isActive, tokenVersion: _, ...rest } = cached.user;
      return { ...rest, mitraId: cached.user.mitraId };
    }

    // Cache miss — query DB
    const user = await this.database.db.query.users.findFirst({
      where: eq(users.id, payload.sub),
      columns: {
        id: true, email: true, name: true, role: true,
        isActive: true, tokenVersion: true,
      },
      with: { mitra: { columns: { id: true } } },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Token tidak valid atau akun tidak aktif');
    }

    // Cek tokenVersion — jika sudah di-increment (logout), token lama tidak valid
    if (payload.tokenVersion !== user.tokenVersion) {
      throw new UnauthorizedException('Sesi telah berakhir, silakan login ulang');
    }

    // Simpan ke cache untuk request berikutnya
    // Jika cache sudah penuh, hapus entri terlama (LRU sederhana)
    if (userCache.size >= CACHE_MAX_SIZE) {
      const firstKey = userCache.keys().next().value;
      if (firstKey !== undefined) userCache.delete(firstKey);
    }
    userCache.set(payload.sub, {
      user: {
        id: user.id, email: user.email, name: user.name, role: user.role,
        isActive: user.isActive, tokenVersion: user.tokenVersion,
        mitraId: user.mitra?.id ?? null,
      },
      expiry: Date.now() + CACHE_TTL,
    });

    const { mitra, tokenVersion: _, ...rest } = user;
    return { ...rest, mitraId: mitra?.id ?? null };
  }
}

// Bersihkan cache periodik — jaga memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of userCache) {
    if (val.expiry <= now) userCache.delete(key);
  }
}, 30_000);