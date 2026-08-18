import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';

@Injectable()
export class VisitorService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVisitorDto, registeredById: number) {
    const blacklisted = await this.prisma.blacklist.findFirst({
      where: {
        isActive: true,
        OR: [
          { nationalId: dto.nationalId },
          { phone: dto.phone },
        ],
      },
    });

    if (blacklisted) {
      throw new BadRequestException('Access Denied: This visitor has been blacklisted.');
    }

    let visitor = await this.prisma.visitor.findUnique({
      where: { nationalId: dto.nationalId },
    });

    if (visitor) {
      const activeVisit = await this.prisma.visit.findFirst({
        where: { visitorId: visitor.id, visitStatus: 'CHECKED_IN' },
      });

      if (activeVisit) {
        throw new BadRequestException('This visitor is already checked in');
      }

      // Refresh their profile info in case anything changed
      visitor = await this.prisma.visitor.update({
        where: { id: visitor.id },
        data: {
          fullName: dto.fullName,
          phone: dto.phone,
          email: dto.email,
          address: dto.address,
          gender: dto.gender,
          companyName: dto.companyName,
        },
      });
    } else {
      visitor = await this.prisma.visitor.create({
        data: {
          fullName: dto.fullName,
          phone: dto.phone,
          email: dto.email,
          address: dto.address,
          gender: dto.gender,
          nationalId: dto.nationalId,
          companyName: dto.companyName,
        },
      });
    }

    return this.prisma.visit.create({
      data: {
        visitorId: visitor.id,
        purposeOfVisit: dto.purposeOfVisit,
        department: dto.department,
        personToVisit: dto.personToVisit,
        remarks: dto.remarks,
        registeredById,
      },
      include: { visitor: true },
    });
  }

  async findAll() {
    return this.prisma.visit.findMany({
      orderBy: { checkInTime: 'desc' },
      include: { visitor: true },
    });
  }

  async findOne(id: number) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: { visitor: true },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    return visit;
  }

  async update(id: number, dto: UpdateVisitorDto) {
    await this.findOne(id);

    return this.prisma.visit.update({
      where: { id },
      data: {
        purposeOfVisit: dto.purposeOfVisit,
        department: dto.department,
        personToVisit: dto.personToVisit,
        remarks: dto.remarks,
      },
      include: { visitor: true },
    });
  }

  async checkOut(id: number) {
    const visit = await this.findOne(id);

    if (visit.visitStatus === 'CHECKED_OUT') {
      throw new BadRequestException('This visitor has already checked out');
    }

    return this.prisma.visit.update({
      where: { id },
      data: {
        checkOutTime: new Date(),
        visitStatus: 'CHECKED_OUT',
      },
      include: { visitor: true },
    });
  }
}