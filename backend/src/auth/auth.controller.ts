import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /** POST /api/auth/register — max 5 registrasi per jam */
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /** POST /api/auth/login — max 10 percobaan per menit (cegah brute force) */
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /** GET /api/auth/me — butuh JWT, tidak perlu throttle */
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: any) {
    return this.authService.getMe(req.user.id);
  }

  /** POST /api/auth/logout — increment tokenVersion, invalidate semua sesi */
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Request() req: any) {
    return this.authService.logout(req.user.id);
  }

  /** POST /api/auth/refresh — perpanjang JWT tanpa login ulang */
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  refresh(@Request() req: any) {
    return this.authService.refreshToken(
      req.user.id,
      req.user.email,
      req.user.role,
    );
  }
}
