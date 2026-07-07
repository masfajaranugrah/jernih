import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('vouchers')
export class VouchersController {
  constructor(private vouchersService: VouchersService) {}

  /** POST /api/vouchers — Admin only */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateVoucherDto) {
    return this.vouchersService.create(dto);
  }

  /** GET /api/vouchers */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.vouchersService.findAll();
  }

  /** POST /api/vouchers/validate — validasi kode voucher */
  @UseGuards(JwtAuthGuard)
  @Post('validate')
  validate(
    @Request() req: any,
    @Body() body: { code: string; subtotal: number },
  ) {
    return this.vouchersService.validate(body.code, req.user.id, body.subtotal);
  }

  /** DELETE /api/vouchers/:id */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vouchersService.remove(id);
  }
}
