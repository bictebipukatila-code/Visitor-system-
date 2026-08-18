import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get()
  getReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getVisitsByDateRange(startDate, endDate);
  }

  @Get('download')
  async downloadCsv(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const csv = await this.reportsService.generateCsv(startDate, endDate);
    const filename = 'visitor-report-' + startDate + '-to-' + endDate + '.csv';

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="' + filename + '"');
    res.send(csv);
  }
}