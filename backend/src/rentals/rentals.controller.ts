import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('rentals')
export class RentalsController {
  constructor(private rentalsService: RentalsService) {}

  /** GET /api/rentals/items — daftar semua item yang bisa disewa */
  @Get('items')
  findAllItems(@Query('search') search?: string) {
    return this.rentalsService.findAllItems({ search });
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
