import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  /** POST /api/chat — kirim pesan */
  @Post()
  send(@Request() req: any, @Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(req.user.id, dto);
  }

  /** GET /api/chat/inbox — daftar percakapan */
  @Get('inbox')
  inbox(@Request() req: any) {
    return this.chatService.getInbox(req.user.id);
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
