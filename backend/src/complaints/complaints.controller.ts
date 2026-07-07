import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('complaints')
export class ComplaintsController {
  constructor(private complaintsService: ComplaintsService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateComplaintDto) {
    return this.complaintsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req: any) {
    const isAdmin = req.user.role === 'ADMIN';
    return this.complaintsService.findAll(isAdmin ? undefined : req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.complaintsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateComplaintDto) {
    return this.complaintsService.update(id, dto);
  }
}
