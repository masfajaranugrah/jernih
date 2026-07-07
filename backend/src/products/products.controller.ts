import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards, Request,
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
   * Tambah produk dari dashboard admin — tanpa JWT, mitraId otomatis dari admin
   */
  @Post('admin')
  createFromAdmin(@Body() body: CreateProductDto & { mitraId?: string }) {
    return this.productsService.createFromAdmin(body);
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

  /** PATCH /api/products/:id — admin only, no JWT needed (protected by frontend middleware) */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  /** DELETE /api/products/:id — admin only, no JWT needed (protected by frontend middleware) */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
