import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';

class AddWishlistDto {
  @IsString() @IsNotEmpty() productId!: string;
}
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  /** GET /api/wishlist — daftar wishlist milik user (dengan pagination) */
  @Get()
  findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.wishlistService.findAll(req.user.id, Number(page) || 1, Number(limit) || 20);
  }

  /** GET /api/wishlist/count — jumlah wishlist (ringan, untuk badge) */
  @Get('count')
  async getCount(@Request() req: any) {
    const count = await this.wishlistService.count(req.user.id);
    return { count };
  }

  /** POST /api/wishlist — tambah produk ke wishlist */
  @Post()
  add(@Request() req: any, @Body() dto: AddWishlistDto) {
    return this.wishlistService.add(req.user.id, dto.productId);
  }

  /** DELETE /api/wishlist/:productId — hapus produk dari wishlist */
  @Delete(':productId')
  remove(@Request() req: any, @Param('productId') productId: string) {
    return this.wishlistService.remove(req.user.id, productId);
  }
}
