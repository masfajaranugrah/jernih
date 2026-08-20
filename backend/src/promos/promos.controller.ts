import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { PromosService } from './promos.service';
import { CreatePromoDto } from './dto/create-promo.dto';
import { UpdatePromoDto } from './dto/update-promo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('promos')
export class PromosController {
  constructor(private promosService: PromosService) {}

  /** GET /api/promos?status=&search=&sort=&page=&limit= */
  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.promosService.findAll({
      status: (status as any) || 'all',
      search,
      sort: (sort as any) || 'newest',
      page,
      limit,
    });
  }

  /** GET /api/promos/banner — promo untuk banner homepage */
  @Get('banner')
  findBanner() {
    return this.promosService.findBanner();
  }

  /** GET /api/promos/:id */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promosService.findOne(id);
  }

  /** POST /api/promos — ADMIN only */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreatePromoDto) {
    return this.promosService.create(dto);
  }

  /** PATCH /api/promos/:id — ADMIN only */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePromoDto) {
    return this.promosService.update(id, dto);
  }

  /** DELETE /api/promos/:id — ADMIN only */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promosService.remove(id);
  }
}