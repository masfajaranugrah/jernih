import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards, Request, Headers, BadRequestException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  /**
   * POST /api/products/admin
   * Tambah produk dari dashboard admin.
   * mitraId dibaca dari header X-Mitra-Id yang dikirim oleh Next.js server action.
   * Header ini diisi dari cookie mh_mitra_id yang disimpan saat login.
   * Hasil: 1 INSERT saja, 0 query ekstra.
   */
  @Post('admin')
  createForAdmin(
    @Headers('x-mitra-id') mitraId: string,
    @Body() dto: CreateProductDto,
  ) {
    if (!mitraId) {
      throw new BadRequestException('Header X-Mitra-Id wajib ada. Silakan login ulang.');
    }
    return this.productsService.create(mitraId, dto);
  }

  /** POST /api/products (butuh JWT + mitraId dari token) */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() dto: CreateProductDto) {
    return this.productsService.create(req.user.mitraId ?? req.body.mitraId, dto);
  }

  /** GET /api/products?search=&categoryId=&page=&limit= */
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('mitraId') mitraId?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.findAll({
      search, categoryId, mitraId, minPrice, maxPrice, page, limit,
    });
  }

  /** GET /api/products/slug/:slug */
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  /** GET /api/products/:id */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  /** PATCH /api/products/:id */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  /** DELETE /api/products/:id */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
