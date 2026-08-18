import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getVisitsByDateRange(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD.');
    }

    end.setHours(23, 59, 59, 999);

    const visits = await this.prisma.visit.findMany({
      where: {
        checkInTime: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { checkInTime: 'desc' },
      include: { visitor: true },
    });

    return {
      startDate,
      endDate,
      totalVisits: visits.length,
      visits,
    };
  }

  async generateCsv(startDate: string, endDate: string) {
    const { visits } = await this.getVisitsByDateRange(startDate, endDate);

    const headers = [
      'Visit ID',
      'Full Name',
      'Phone',
      'Email',
      'National ID',
      'Company',
      'Purpose',
      'Department',
      'Person to Visit',
      'Check-In Time',
      'Check-Out Time',
      'Status',
    ];

    const rows = visits.map((visit) => [
      visit.id,
      visit.visitor.fullName,
      visit.visitor.phone,
      visit.visitor.email,
      visit.visitor.nationalId,
      visit.visitor.companyName,
      visit.purposeOfVisit,
      visit.department,
      visit.personToVisit,
      visit.checkInTime.toISOString(),
      visit.checkOutTime ? visit.checkOutTime.toISOString() : '',
      visit.visitStatus,
    ]);

    const escapeCsvValue = (value: any) => {
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvLines = [
      headers.map(escapeCsvValue).join(','),
      ...rows.map((row) => row.map(escapeCsvValue).join(',')),
    ];

    return csvLines.join('\n');
  }
}