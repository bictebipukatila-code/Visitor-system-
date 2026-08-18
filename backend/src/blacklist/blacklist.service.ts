import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlacklistDto } from './dto/create-blacklist.dto';

@Injectable()
export class BlacklistService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBlacklistDto, blacklistedById: number) {
    const existing = await this.prisma.blacklist.findFirst({
      where: {
        isActive: true,
        OR: [
          { nationalId: dto.nationalId },
          { phone: dto.phone },
        ],
      },
    });

    if (existing) {
      throw new ConflictException('This person is already on the blacklist');
    }

    return this.prisma.blacklist.create({
      data: {
        fullName: dto.fullName,
        nationalId: dto.nationalId,
        phone: dto.phone,
        reason: dto.reason,
        blacklistedById,
      },
    });
  }

  async findAll() {
    return this.prisma.blacklist.findMany({
      where: { isActive: true },
      orderBy: { blacklistedDate: 'desc' },
    });
  }

  async remove(id: number) {
    const entry = await this.prisma.blacklist.findUnique({ where: { id } });

    if (!entry) {
      throw new NotFoundException('Blacklist entry not found');
    }

    return this.prisma.blacklist.update({
      where: { id },
      data: { isActive: false },
    });
  }
}