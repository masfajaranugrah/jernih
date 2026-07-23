import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ── Register ────────────────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    // Cek apakah email sudah terdaftar
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // Hash password (10 rounds — optimal: aman & cepat)
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        phone: dto.phone,
        role: 'CUSTOMER', // Wajib — ignore apapun yang dikirim client
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        tokenVersion: true,
      },
    });

    const token = await this.signToken(user.id, user.email, user.role, user.tokenVersion);

    return { user, access_token: token };
  }

  // ── Login ───────────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true, email: true, name: true, role: true, password: true,
        isActive: true, tokenVersion: true, createdAt: true,
        mitra: { select: { id: true, storeName: true, isVerified: true, logo: true } },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const token = await this.signToken(user.id, user.email, user.role, user.tokenVersion);

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, access_token: token };
  }

  // ── Me (get current user) ───────────────────────────────────────────────────
  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        mitra: {
          select: {
            id: true,
            storeName: true,
            isVerified: true,
            logo: true,
          },
        },
      },
    });
  }

  // ── Helper: sign JWT ────────────────────────────────────────────────────────
  private async signToken(userId: string, email: string, role: string, tokenVersion: number): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
      tokenVersion,
    };
    return this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN') ?? '7d',
    });
  }

  // ── Logout: increment tokenVersion — invalidate semua sesi sebelumnya ──────
  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
    return { message: 'Berhasil logout' };
  }

  // ── Refresh token: buat JWT baru dengan tokenVersion terbaru ─────────────
  async refreshToken(userId: string, email: string, role: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        tokenVersion: true,
        id: true, email: true, name: true, phone: true,
        role: true, createdAt: true,
        mitra: { select: { id: true, storeName: true, isVerified: true, logo: true } },
      },
    });

    if (!user) throw new UnauthorizedException('User tidak ditemukan');

    const token = await this.signToken(user.id, user.email, user.role, user.tokenVersion);
    const { tokenVersion: _, ...userWithoutVersion } = user;
    return { user: userWithoutVersion, access_token: token };
  }
}
