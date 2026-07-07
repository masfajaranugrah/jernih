import { Controller, Get, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { HeroService } from './hero.service';
import { UpdateHeroBannerDto } from './dto/update-hero-banner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('hero')
export class HeroController {
  constructor(private heroService: HeroService) {}

  /** GET /api/hero — publik, untuk frontend */
  @Get()
  findAll() {
    return this.heroService.findAll();
  }

  /** PUT /api/hero/:position — Admin only */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':position')
  upsert(
    @Param('position', ParseIntPipe) position: number,
    @Body() dto: UpdateHeroBannerDto,
  ) {
    return this.heroService.upsert(position, dto);
  }

  /** DELETE /api/hero/reset — Admin only */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('reset')
  reset() {
    return this.heroService.resetAll();
  }
}
