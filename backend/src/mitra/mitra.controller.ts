import {
  Controller, Get, Post, Patch, Param, Body,
  UseGuards, Request, Query, ForbiddenException,
} from '@nestjs/common';
import { MitraService } from './mitra.service';
import { CreateMitraDto } from './dto/create-mitra.dto';
import { UpdateMitraDto } from './dto/update-mitra.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('mitra')
export class MitraController {
  constructor(private mitraService: MitraService) {}

  /** POST /api/mitra — daftar sebagai mitra */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() dto: CreateMitraDto) {
    return this.mitraService.create(req.user.id, dto);
  }

  /** GET /api/mitra */
  @Get()
  findAll(@Query('city') city?: string) {
    return this.mitraService.findAll({ city });
  }

  /** GET /api/mitra/me — data mitra milik user yang login */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMe(@Request() req: any) {
    return this.mitraService.findByUser(req.user.id);
  }

  /** GET /api/mitra/:id */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mitraService.findOne(id);
  }

  /** PATCH /api/mitra/:id — hanya pemilik mitra atau ADMIN */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateMitraDto) {
    // Cek ownership: hanya pemilik mitra (userId) yang bisa update
    if (req.user.role !== 'ADMIN') {
      return this.mitraService.updateSafe(id, dto, req.user.id);
    }
    return this.mitraService.update(id, dto);
  }

  /** PATCH /api/mitra/:id/verify — Admin only */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/verify')
  verify(@Param('id') id: string) {
    return this.mitraService.verify(id);
  }
}
