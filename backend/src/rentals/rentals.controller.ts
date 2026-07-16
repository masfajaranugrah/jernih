import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';
import { CreateRentalItemDto } from './dto/create-rental-item.dto';
import { UpdateRentalItemDto } from './dto/update-rental-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('rentals')
export class RentalsController {
  constructor(private rentalsService: RentalsService) {}

  /** GET /api/rentals/items — daftar semua item yang bisa disewa */
  @Get('items')
  findAllItems(@Query('search') search?: string, @Query('all') all?: string) {
    return this.rentalsService.findAllItems({ search, all: all === 'true' });
  }

  /** GET /api/rentals/items/:id */
  @Get('items/:id')
  findItemById(@Param('id') id: string) {
    return this.rentalsService.findItemById(id);
  }

  /** GET /api/rentals/items/slug/:slug */
  @Get('items/slug/:slug')
  findItemBySlug(@Param('slug') slug: string) {
    return this.rentalsService.findItemBySlug(slug);
  }

  /** POST /api/rentals/items — tambah item sewa (admin) */
  @UseGuards(JwtAuthGuard)
  @Post('items')
  createItem(@Request() req: any, @Body() dto: CreateRentalItemDto) {
    return this.rentalsService.createItem(dto);
  }

  /** PATCH /api/rentals/items/:id — admin only */
  @UseGuards(JwtAuthGuard)
  @Patch('items/:id')
  updateItem(@Param('id') id: string, @Body() dto: UpdateRentalItemDto) {
    return this.rentalsService.updateItem(id, dto);
  }

  /** DELETE /api/rentals/items/:id — admin only */
  @UseGuards(JwtAuthGuard)
  @Delete('items/:id')
  removeItem(@Param('id') id: string) {
    return this.rentalsService.removeItem(id);
  }

  /** POST /api/rentals — buat booking sewa baru */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() dto: CreateRentalDto) {
    return this.rentalsService.create(req.user.id, dto);
  }

  /** GET /api/rentals — list sewa milik user */
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req: any, @Query('mitraId') mitraId?: string) {
    const isAdmin = req.user.role === 'ADMIN';
    return this.rentalsService.findAll(
      isAdmin ? undefined : req.user.id,
      mitraId,
    );
  }

  /** GET /api/rentals/:id */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rentalsService.findOne(id);
  }

  /** PATCH /api/rentals/:id — update status */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRentalDto) {
    return this.rentalsService.update(id, dto);
  }
}
