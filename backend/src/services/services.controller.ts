import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  /**
   * POST /api/services/admin
   * Tambah jasa dari dashboard admin — tanpa JWT, mitraId otomatis dari admin
   */
  @Post('admin')
  createFromAdmin(@Body() body: CreateServiceDto & { mitraId?: string }) {
    return this.servicesService.createFromAdmin(body);
  }

  /** GET /api/services?search=&categoryId= */
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('mitraId') mitraId?: string,
  ) {
    return this.servicesService.findAll({ search, categoryId, mitraId });
  }

  /** GET /api/services/slug/:slug */
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.servicesService.findBySlug(slug);
  }

  /** GET /api/services/:id */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  /** PATCH /api/services/:id — admin only, protected by frontend middleware */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  /** DELETE /api/services/:id — admin only, protected by frontend middleware */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
