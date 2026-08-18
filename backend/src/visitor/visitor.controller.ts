import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VisitorService } from './visitor.service';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('visitor')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VisitorController {
  constructor(private visitorService: VisitorService) {}

  @Post()
  @Roles(Role.RECEPTIONIST)
  create(@Body() dto: CreateVisitorDto, @Req() req: any) {
    const registeredById = req.user.userId;
    return this.visitorService.create(dto, registeredById);
  }

  @Get()
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  findAll() {
    return this.visitorService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.visitorService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.RECEPTIONIST)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVisitorDto) {
    return this.visitorService.update(id, dto);
  }

  @Patch(':id/checkout')
  @Roles(Role.RECEPTIONIST)
  checkOut(@Param('id', ParseIntPipe) id: number) {
    return this.visitorService.checkOut(id);
  }
}