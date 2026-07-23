import { Controller, Get, Patch, Delete, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  /** GET /api/users — Admin only */
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /** GET /api/users/me — ambil data diri sendiri */
  @Get('me')
  getMe(@Request() req: any) {
    return this.usersService.findOne(req.user.id);
  }

  /** GET /api/users/:id — hanya admin atau user yang bersangkutan */
  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Anda tidak memiliki akses ke user ini');
    }
    return this.usersService.findOne(id);
  }

  /** PATCH /api/users/me */
  @Patch('me')
  updateMe(@Request() req: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.id, dto);
  }

  /** DELETE /api/users/:id — Admin only */
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
