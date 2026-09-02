import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { DatabaseService, genId } from '../database/database.service';
import { users } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly database: DatabaseService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ── Register ────────────────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    // Cek apakah email sudah terdaftar
    const existing = await this.database.db.select().from(users).where(eq(users.email, dto.email));

    if (existing.length) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // Hash password (10 rounds — optimal: aman & cepat)
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const [user] = await this.database.db
      .insert(users)
      .values({
        id: genId('usr'),
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        phone: dto.phone ?? null,
        role: 'CUSTOMER', // Wajib — ignore apapun yang dikirim client
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        role: users.role,
        createdAt: users.createdAt,
        tokenVersion: users.tokenVersion,
      });

    const token = await this.signToken(user.id, user.name, user.email, user.role, user.tokenVersion);

    return { user, access_token: token };
  }

  // Hash dummy untuk timing-safe comparison — cegah user enumeration via timing attack.
  // bcrypt.compare dengan hash invalid memakan waktu ~sama dengan hash valid.
  private static readonly DUMMY_HASH =
    '$2b$10$invalidhashfortimingprotectionnnnnnnnnnnnnnnnnnnn';

  // ── Login ───────────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.database.db.query.users.findFirst({
      where: eq(users.email, dto.email),
      columns: {
        id: true, email: true, name: true, role: true, password: true,
        isActive: true, tokenVersion: true, createdAt: true,
      },
      with: {
        mitra: { columns: { id: true, storeName: true, isVerified: true, logo: true } },
      },
    });

    // Selalu jalankan bcrypt.compare meski user tidak ditemukan — cegah timing attack
    // (perbedaan waktu respons bisa membocorkan apakah email terdaftar atau tidak)
    const hashToCompare = user?.password ?? AuthService.DUMMY_HASH;
    const passwordMatch = await bcrypt.compare(dto.password, hashToCompare);

    if (!user || !user.isActive || !passwordMatch) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const token = await this.signToken(user.id, user.name, user.email, user.role, user.tokenVersion);

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, access_token: token };
  }

  // ── Me (get current user) ───────────────────────────────────────────────────
  async getMe(userId: string) {
    return this.database.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
      with: {
        mitra: {
          columns: {
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
  private async signToken(userId: string, name: string, email: string, role: string, tokenVersion: number): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      name,
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
    await this.database.db
      .update(users)
      .set({ tokenVersion: sql`${users.tokenVersion} + 1` })
      .where(eq(users.id, userId));
    return { message: 'Berhasil logout' };
  }

  // ── Refresh token: buat JWT baru dengan tokenVersion terbaru ─────────────
  async refreshToken(userId: string, email: string, role: string) {
    const user = await this.database.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        tokenVersion: true,
        id: true, email: true, name: true, phone: true,
        role: true, createdAt: true,
      },
      with: {
        mitra: { columns: { id: true, storeName: true, isVerified: true, logo: true } },
      },
    });

    if (!user) throw new UnauthorizedException('User tidak ditemukan');

    const token = await this.signToken(user.id, user.name, user.email, user.role, user.tokenVersion);
    const { tokenVersion: _, ...userWithoutVersion } = user;
    return { user: userWithoutVersion, access_token: token };
  }
}