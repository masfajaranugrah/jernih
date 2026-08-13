import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
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

  /** POST /api/hero — Admin only */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: UpdateHeroBannerDto) {
    return this.heroService.create(dto);
  }

  /** PUT /api/hero/:id — Admin only */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHeroBannerDto,
  ) {
    return this.heroService.update(id, dto);
  }

  /** DELETE /api/hero/reset — Admin only */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('reset')
  reset() {
    return this.heroService.resetAll();
  }

  /** DELETE /api/hero/:id — Admin only */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.heroService.delete(id);
  }
}
