import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { SendTicketMessageDto } from './dto/send-ticket-message.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  /** POST /api/tickets — pelanggan buat tiket bantuan */
  @Post()
  create(@Request() req: any, @Body() dto: CreateTicketDto) {
    return this.ticketsService.create(req.user.id, dto);
  }

  /** GET /api/tickets/mine — daftar tiket milik pelanggan */
  @Get('mine')
  mine(@Request() req: any) {
    return this.ticketsService.findMine(req.user.id);
  }

  /** GET /api/tickets/admin — semua tiket, urut nomor (khusus admin) */
  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  all(@Request() req: any) {
    return this.ticketsService.findAllAdmin(req.user.id);
  }

  /** GET /api/tickets/:id — detail tiket + pesan */
  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.ticketsService.findOne(id, req.user.id, req.user.role);
  }

  /** POST /api/tickets/:id/messages — kirim pesan di tiket */
  @Post(':id/messages')
  addMessage(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: SendTicketMessageDto,
  ) {
    return this.ticketsService.addMessage(id, req.user.id, req.user.role, dto);
  }

  /** PATCH /api/tickets/:id/read — tandai pesan sudah dibaca */
  @Patch(':id/read')
  markRead(@Request() req: any, @Param('id') id: string) {
    return this.ticketsService.markRead(id, req.user.id, req.user.role);
  }

  /** PATCH /api/tickets/:id — ubah status/prioritas (khusus admin) */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.ticketsService.update(id, dto);
  }
}
