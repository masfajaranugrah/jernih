import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export type JwtPayload = {
  sub: string;  // user id
  email: string;
  role: string;
  tokenVersion: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        tokenVersion: true,
        mitra: { select: { id: true } },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Token tidak valid atau akun tidak aktif');
    }

    // Cek tokenVersion — jika sudah di-increment (logout), token lama tidak valid
    if (payload.tokenVersion !== user.tokenVersion) {
      throw new UnauthorizedException('Sesi telah berakhir, silakan login ulang');
    }

    // Inject mitraId langsung ke req.user — 0 query tambahan di controller
    const { mitra, tokenVersion: _, ...rest } = user;
    return { ...rest, mitraId: mitra?.id ?? null }; // injected ke req.user
  }
}
