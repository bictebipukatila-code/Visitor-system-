import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BlacklistService } from './blacklist.service';
import { CreateBlacklistDto } from './dto/create-blacklist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('blacklist')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class BlacklistController {
  constructor(private blacklistService: BlacklistService) {}

  @Post()
  create(@Body() dto: CreateBlacklistDto, @Req() req: any) {
    const blacklistedById = req.user.userId;
    return this.blacklistService.create(dto, blacklistedById);
  }

  @Get()
  findAll() {
    return this.blacklistService.findAll();
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.blacklistService.remove(id);
  }
}