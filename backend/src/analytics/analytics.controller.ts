import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Get('executive-summary')
  @Permissions('analytics:read')
  async getExecutiveSummary() {
    return this.analyticsService.getExecutiveSummary();
  }

  @Get('attendance/today')
  @Permissions('attendance:read')
  async getTodayAttendance() {
    return this.analyticsService.getTodayAttendanceSummary();
  }

  @Get('attendance/metrics')
  @Permissions('analytics:read')
  async getAttendanceMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) {
      start.setMonth(start.getMonth() - 1); // Default to last 30 days
    }

    return this.analyticsService.getAttendanceMetrics({
      startDate: isNaN(start.getTime()) ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : start,
      endDate: isNaN(end.getTime()) ? new Date() : end,
      departmentId,
    });
  }

  @Get('leave/metrics')
  @Permissions('analytics:read')
  async getLeaveMetrics(
    @Query('year') year?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.analyticsService.getLeaveMetrics({
      year: year ? parseInt(year, 10) : undefined,
      departmentId,
    });
  }

  @Get('payroll/metrics')
  @Permissions('analytics:read')
  async getPayrollMetrics(@Query('year') year?: string) {
    return this.analyticsService.getPayrollMetrics({
      year: year ? parseInt(year, 10) : undefined,
    });
  }

  @Get('performance/metrics')
  @Permissions('analytics:read')
  async getPerformanceMetrics(
    @Query('year') year?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.analyticsService.getPerformanceMetrics({
      year: year ? parseInt(year, 10) : undefined,
      departmentId,
    });
  }

  @Get('reports/attendance')
  @Permissions('analytics:read')
  async getAttendanceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.analyticsService.getDetailedAttendanceReport({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      departmentId,
    });
  }

  @Get('reports/payroll')
  @Permissions('analytics:read')
  async getPayrollReport(
    @Query('year') year: string,
    @Query('month') month?: string,
  ) {
    return this.analyticsService.getDetailedPayrollReport({
      year: parseInt(year, 10),
      month: month ? parseInt(month, 10) : undefined,
    });
  }

  @Get('attrition')
  @Permissions('analytics:read')
  async getAttritionRate(@Query('year') year?: string) {
    return this.analyticsService.getAttritionRate({
      year: year ? parseInt(year, 10) : undefined,
    });
  }

  @Get('departments')
  @Permissions('analytics:read')
  async getDepartmentMetrics() {
    return this.analyticsService.getDepartmentMetrics();
  }
}
