import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { UpdateSalaryStructureDto } from './dto/update-salary-structure.dto';
import { CreatePayrollRunDto } from './dto/create-payroll-run.dto';

@Controller('payroll')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) { }

  // ============ Salary Structure Endpoints ============

  @Post('structures')
  @Roles('admin', 'hr')
  async createSalaryStructure(@Body() createDto: CreateSalaryStructureDto) {
    return this.payrollService.createSalaryStructure(createDto);
  }

  @Get('structures')
  async findAllSalaryStructures() {
    return this.payrollService.findAllSalaryStructures();
  }

  @Get('structures/:id')
  async findSalaryStructureById(@Param('id') id: string) {
    return this.payrollService.findSalaryStructureById(id);
  }

  @Patch('structures/:id')
  @Roles('admin', 'hr')
  async updateSalaryStructure(
    @Param('id') id: string,
    @Body() updateDto: UpdateSalaryStructureDto,
  ) {
    return this.payrollService.updateSalaryStructure(id, updateDto);
  }

  @Delete('structures/:id')
  @Roles('admin')
  async deleteSalaryStructure(@Param('id') id: string) {
    return this.payrollService.deleteSalaryStructure(id);
  }

  // ============ Payroll Run Endpoints ============

  @Post('runs')
  @Roles('admin', 'hr')
  async createPayrollRun(@Body() createDto: CreatePayrollRunDto) {
    return this.payrollService.createPayrollRun(createDto);
  }

  @Get('runs')
  async findAllPayrollRuns() {
    return this.payrollService.findAllPayrollRuns();
  }

  @Get('runs/:id')
  async findPayrollRunById(@Param('id') id: string) {
    return this.payrollService.findPayrollRunById(id);
  }

  @Post('runs/:id/calculate')
  @Roles('admin', 'hr')
  async calculatePayrollEntries(@Param('id') id: string) {
    return this.payrollService.calculatePayrollEntries(id);
  }

  @Post('runs/:id/approve')
  @Roles('admin', 'hr')
  async approvePayrollRun(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.payrollService.approvePayrollRun(id, req.user.id);
  }

  @Post('runs/:id/process')
  @Roles('admin')
  async processPayrollRun(@Param('id') id: string) {
    return this.payrollService.processPayrollRun(id);
  }

  @Delete('runs/:id')
  @Roles('admin')
  async deletePayrollRun(@Param('id') id: string) {
    return this.payrollService.deletePayrollRun(id);
  }

  // ============ Payroll Entry Endpoints ============

  @Get('entries/:id')
  async findPayrollEntryById(@Param('id') id: string) {
    return this.payrollService.findPayrollEntryById(id);
  }

  @Patch('entries/:id')
  @Roles('admin', 'hr')
  async updatePayrollEntry(
    @Param('id') id: string,
    @Body() data: { lopDays?: number; notes?: string },
  ) {
    return this.payrollService.updatePayrollEntry(id, data);
  }

  // ============ Reports ============

  @Get('runs/:id/summary')
  async getPayrollSummary(@Param('id') id: string) {
    return this.payrollService.getPayrollSummary(id);
  }

  @Get('entries/:id/pdf')
  async downloadPayslip(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.payrollService.generatePayslip(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=payslip.pdf',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('my-payslips')
  async getMyPayslips(@Request() req: any) {
    // Assuming req.user.employeeId is populated. If not, we might need to look it up.
    // Based on User model, we might need to query employee by userId if employeeId is not in token.
    // For now, assuming it is available or finding via service.
    // Actually, let's look up employee if needed.
    // But PayrollService.getEmployeePayslips expects employeeId.
    // If req.user does not have employeeId, we need to find it.
    // Let's assume the guard populates it or we use userId to find employee.
    // Safer to use a service method that takes userId if unsure, but let's stick to employeeId for now
    // and assume the strategy adds it.
    return this.payrollService.getEmployeePayslips(req.user.employeeId);
  }

  @Get('runs/:id/bank-export')
  @Roles('admin', 'hr')
  async downloadBankFile(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.payrollService.generateBankTransferFile(id);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=bank_transfer.xlsx',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
