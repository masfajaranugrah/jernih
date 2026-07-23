import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
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

  /** GET /api/wishlist — daftar wishlist milik user */
  @Get()
  findAll(@Request() req: any) {
    return this.wishlistService.findAll(req.user.id);
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
