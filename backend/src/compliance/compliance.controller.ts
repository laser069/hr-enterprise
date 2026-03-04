import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permissions as PermissionsDecorator } from '../common/decorators/permissions.decorator';
import { CreateFilingRecordDto } from './dto/create-filing-record.dto';
import { CreatePolicyAcknowledgementDto } from './dto/create-policy-acknowledgement.dto';

@Controller('compliance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) { }

  // ============ Filing Record Endpoints ============

  @Post('filings')
  @Roles('admin', 'hr')
  async createFilingRecord(@Body() createDto: CreateFilingRecordDto) {
    return this.complianceService.createFilingRecord(createDto);
  }

  @Get('filings')
  async findAllFilingRecords(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.complianceService.findAllFilingRecords({
      type,
      status,
      skip: skip ? parseInt(skip, 10) : 0,
      take: take ? parseInt(take, 10) : 20,
    });
  }

  @Get('filings/upcoming')
  @PermissionsDecorator('compliance:read')
  async getUpcomingFilings() {
    return this.complianceService.getUpcomingFilings();
  }

  @Get('reports/statutory')
  @PermissionsDecorator('compliance:read')
  async getStatutoryReport(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.complianceService.getStatutoryComplianceReport(
      parseInt(year, 10),
      parseInt(month, 10),
    );
  }

  @Get('reports/labor-law')
  @PermissionsDecorator('compliance:read')
  async checkLaborLaw(@Query('departmentId') departmentId?: string) {
    return this.complianceService.checkLaborLawCompliance(departmentId);
  }

  @Post('filings/generate')
  @PermissionsDecorator('compliance:write')
  async generateFilings(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.complianceService.generateMonthlyFilings(
      parseInt(year, 10),
      parseInt(month, 10),
    );
  }

  @Get('filings/:id')
  async findFilingRecordById(@Param('id') id: string) {
    return this.complianceService.findFilingRecordById(id);
  }

  @Post('filings/:id/file')
  @Roles('admin', 'hr')
  async fileFilingRecord(
    @Param('id') id: string,
    @Request() req: any,
    @Body('receiptNo') receiptNo?: string,
  ) {
    return this.complianceService.fileFilingRecord(id, req.user.id, receiptNo);
  }

  @Post('filings/:id/acknowledge')
  @Roles('admin')
  async acknowledgeFilingRecord(@Param('id') id: string) {
    return this.complianceService.acknowledgeFilingRecord(id);
  }

  // ============ Policy Acknowledgement Endpoints ============

  @Post('policies/acknowledge')
  async createPolicyAcknowledgement(@Body() createDto: CreatePolicyAcknowledgementDto) {
    return this.complianceService.createPolicyAcknowledgement(createDto);
  }

  @Get('policies/acknowledgements')
  async findAllPolicyAcknowledgements(
    @Query('employeeId') employeeId?: string,
    @Query('policyName') policyName?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.complianceService.findAllPolicyAcknowledgements({
      employeeId,
      policyName,
      skip: skip ? parseInt(skip, 10) : 0,
      take: take ? parseInt(take, 10) : 20,
    });
  }

  @Get('policies/:policyName/report')
  @Roles('admin', 'hr')
  async getPolicyComplianceReport(@Param('policyName') policyName: string) {
    return this.complianceService.getPolicyComplianceReport(policyName);
  }

  // ============ Dashboard ============

  @Get('dashboard')
  async getComplianceDashboard() {
    return this.complianceService.getComplianceDashboard();
  }
}
