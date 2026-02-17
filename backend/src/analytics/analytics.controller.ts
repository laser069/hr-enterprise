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
  constructor(private readonly analyticsService: AnalyticsService) {}

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
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.analyticsService.getAttendanceMetrics({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      departmentId,
    });
  }

  @Get('leave/metrics')
  @Permissions('analytics:read')
  async getLeaveMetrics(
    @Query('year') year: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.analyticsService.getLeaveMetrics({
      year: parseInt(year, 10),
      departmentId,
    });
  }

  @Get('payroll/metrics')
  @Permissions('analytics:read')
  async getPayrollMetrics(@Query('year') year: string) {
    return this.analyticsService.getPayrollMetrics({
      year: parseInt(year, 10),
    });
  }

  @Get('attrition')
  @Permissions('analytics:read')
  async getAttritionRate(@Query('year') year: string) {
    return this.analyticsService.getAttritionRate({
      year: parseInt(year, 10),
    });
  }

  @Get('departments')
  @Permissions('analytics:read')
  async getDepartmentMetrics() {
    return this.analyticsService.getDepartmentMetrics();
  }
}
