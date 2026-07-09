import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Headers, BadRequestException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  /**
   * POST /api/services/admin
   * Tambah jasa dari dashboard admin.
   * mitraId dibaca dari header X-Mitra-Id yang dikirim oleh Next.js server action.
   * Header ini diisi dari cookie mh_mitra_id yang disimpan saat login.
   * Hasil: 1 INSERT saja, 0 query ekstra.
   */
  @Post('admin')
  createForAdmin(
    @Headers('x-mitra-id') mitraId: string,
    @Body() dto: CreateServiceDto,
  ) {
    if (!mitraId) {
      throw new BadRequestException('Header X-Mitra-Id wajib ada. Silakan login ulang.');
    }
    return this.servicesService.create(mitraId, dto);
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
