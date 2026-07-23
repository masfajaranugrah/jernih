import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';
import { CreateRentalItemDto } from './dto/create-rental-item.dto';
import { UpdateRentalItemDto } from './dto/update-rental-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

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

  /** POST /api/rentals/items — ADMIN only */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('items')
  createItem(@Body() dto: CreateRentalItemDto) {
    return this.rentalsService.createItem(dto);
  }

  /** PATCH /api/rentals/items/:id — ADMIN only */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('items/:id')
  updateItem(@Param('id') id: string, @Body() dto: UpdateRentalItemDto) {
    return this.rentalsService.updateItem(id, dto);
  }

  /** DELETE /api/rentals/items/:id — ADMIN only */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
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

  /** GET /api/rentals/:id — hanya pemilik rental atau ADMIN */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.rentalsService.findOneSafe(id, req.user.id, req.user.role);
  }

  /** PATCH /api/rentals/:id — ADMIN only (update status) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRentalDto) {
    return this.rentalsService.update(id, dto);
  }
}
