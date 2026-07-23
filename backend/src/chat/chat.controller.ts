import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  /** POST /api/chat — kirim pesan */
  @Post()
  send(@Request() req: any, @Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(req.user.id, dto);
  }

  /** POST /api/chat/system-message — kirim pesan sistem (dari order) — ADMIN only */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('system-message')
  systemMessage(@Request() req: any, @Body() body: { message: string; type?: string; orderNumber?: string; receiverId?: string }) {
    return this.chatService.sendSystemMessage(req.user.id, body);
  }

  /** GET /api/chat/inbox — daftar percakapan */
  @Get('inbox')
  inbox(@Request() req: any) {
    return this.chatService.getInbox(req.user.id);
  }

  /** GET /api/chat/admin-id — admin tujuan chat pelanggan */
  @Get('admin-id')
  adminId() {
    return this.chatService.getAdminId();
  }

  /** DELETE /api/chat/message/:id — hapus pesan untuk semua */
  @Delete('message/:id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.chatService.deleteMessage(req.user.id, id);
  }

  /** GET /api/chat/:partnerId — riwayat percakapan */
  @Get(':partnerId')
  conversation(@Request() req: any, @Param('partnerId') partnerId: string) {
    return this.chatService.getConversation(req.user.id, partnerId);
  }

  /** PATCH /api/chat/:senderId/read — tandai sudah dibaca */
  @Patch(':senderId/read')
  markRead(@Request() req: any, @Param('senderId') senderId: string) {
    return this.chatService.markAsRead(req.user.id, senderId);
  }
}
