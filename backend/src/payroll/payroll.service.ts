import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { UpdateSalaryStructureDto } from './dto/update-salary-structure.dto';
import { CreatePayrollRunDto } from './dto/create-payroll-run.dto';
import { Decimal } from '@prisma/client-runtime-utils';
import * as puppeteer from 'puppeteer';
import * as XLSX from 'xlsx';

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);

  constructor(private readonly prisma: PrismaService) { }

  // ============ Salary Structure Methods ============

  async createSalaryStructure(createDto: CreateSalaryStructureDto) {
    const { name } = createDto;

    const existing = await this.prisma.salaryStructure.findUnique({
      where: { name },
    });

    if (existing) {
      throw new ConflictException(`Salary structure "${name}" already exists`);
    }

    const structure = await this.prisma.salaryStructure.create({
      data: {
        name: createDto.name,
        description: createDto.description,
        basic: new Decimal(createDto.basic),
        hra: new Decimal(createDto.hra),
        conveyance: new Decimal(createDto.conveyance ?? 0),
        medicalAllowance: new Decimal(createDto.medicalAllowance ?? 0),
        specialAllowance: new Decimal(createDto.specialAllowance ?? 0),
        professionalTax: new Decimal(createDto.professionalTax ?? 0),
        pf: new Decimal(createDto.pf ?? 0),
        esi: new Decimal(createDto.esi ?? 0),
        isActive: createDto.isActive ?? true,
      },
    });

    this.logger.log(`Salary structure created: ${name}`);
    return structure;
  }

  async findAllSalaryStructures() {
    return this.prisma.salaryStructure.findMany({
      include: {
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findSalaryStructureById(id: string) {
    const structure = await this.prisma.salaryStructure.findUnique({
      where: { id },
      include: {
        employees: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!structure) {
      throw new NotFoundException(`Salary structure with ID ${id} not found`);
    }

    return structure;
  }

  async updateSalaryStructure(id: string, updateDto: UpdateSalaryStructureDto) {
    const structure = await this.prisma.salaryStructure.findUnique({
      where: { id },
    });

    if (!structure) {
      throw new NotFoundException(`Salary structure with ID ${id} not found`);
    }

    if (updateDto.name && updateDto.name !== structure.name) {
      const existing = await this.prisma.salaryStructure.findUnique({
        where: { name: updateDto.name },
      });
      if (existing) {
        throw new ConflictException(`Salary structure "${updateDto.name}" already exists`);
      }
    }

    const updateData: any = {};
    if (updateDto.name !== undefined) updateData.name = updateDto.name;
    if (updateDto.description !== undefined) updateData.description = updateDto.description;
    if (updateDto.basic !== undefined) updateData.basic = new Decimal(updateDto.basic);
    if (updateDto.hra !== undefined) updateData.hra = new Decimal(updateDto.hra);
    if (updateDto.conveyance !== undefined) updateData.conveyance = new Decimal(updateDto.conveyance);
    if (updateDto.medicalAllowance !== undefined) updateData.medicalAllowance = new Decimal(updateDto.medicalAllowance);
    if (updateDto.specialAllowance !== undefined) updateData.specialAllowance = new Decimal(updateDto.specialAllowance);
    if (updateDto.professionalTax !== undefined) updateData.professionalTax = new Decimal(updateDto.professionalTax);
    if (updateDto.pf !== undefined) updateData.pf = new Decimal(updateDto.pf);
    if (updateDto.esi !== undefined) updateData.esi = new Decimal(updateDto.esi);
    if (updateDto.isActive !== undefined) updateData.isActive = updateDto.isActive;

    const updated = await this.prisma.salaryStructure.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Salary structure updated: ${id}`);
    return updated;
  }

  async deleteSalaryStructure(id: string) {
    const structure = await this.prisma.salaryStructure.findUnique({
      where: { id },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    if (!structure) {
      throw new NotFoundException(`Salary structure with ID ${id} not found`);
    }

    if (structure._count.employees > 0) {
      throw new BadRequestException(
        'Cannot delete salary structure with assigned employees. Please reassign employees first.',
      );
    }

    await this.prisma.salaryStructure.delete({
      where: { id },
    });

    this.logger.log(`Salary structure deleted: ${id}`);
    return { message: 'Salary structure deleted successfully' };
  }

  // ============ Payroll Run Methods ============

  async createPayrollRun(createDto: CreatePayrollRunDto) {
    const { month, year } = createDto;

    // Check if payroll run already exists for this month/year
    const existing = await this.prisma.payrollRun.findUnique({
      where: { month_year: { month, year } },
    });

    if (existing) {
      throw new ConflictException(
        `Payroll run already exists for ${month}/${year}`,
      );
    }

    const payrollRun = await this.prisma.payrollRun.create({
      data: {
        month,
        year,
        status: 'draft',
      },
    });

    this.logger.log(`Payroll run created: ${month}/${year}`);
    return payrollRun;
  }

  async findAllPayrollRuns() {
    return this.prisma.payrollRun.findMany({
      include: {
        approver: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: { entries: true },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findPayrollRunById(id: string) {
    const payrollRun = await this.prisma.payrollRun.findUnique({
      where: { id },
      include: {
        approver: {
          select: {
            id: true,
            email: true,
          },
        },
        entries: {
          include: {
            employee: {
              select: {
                id: true,
                employeeCode: true,
                firstName: true,
                lastName: true,
                email: true,
                department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!payrollRun) {
      throw new NotFoundException(`Payroll run with ID ${id} not found`);
    }

    return payrollRun;
  }

  // ============ Helper Methods ============

  private calculateDeductions(grossSalary: number, structure: any) {
    // 1. LOP Calculation is done separately based on days

    // 2. PF (EPF) Calculation
    // 12% of Basic
    const basic = Number(structure.basic);
    const pfDeduction = basic * 0.12;

    // 3. ESI Calculation
    // 0.75% of Gross if Gross <= 21,000
    let esiDeduction = 0;
    if (grossSalary <= 21000) {
      esiDeduction = grossSalary * 0.0075;
    }

    // 4. Professional Tax (PT) - Tamil Nadu
    let ptDeduction = 0;
    if (grossSalary > 75000) ptDeduction = 1095;
    else if (grossSalary > 60000) ptDeduction = 760;
    else if (grossSalary > 45000) ptDeduction = 510;
    else if (grossSalary > 30000) ptDeduction = 235;
    else if (grossSalary > 21000) ptDeduction = 100;

    // 5. TDS (Income Tax) - New Regime
    // Standard Deduction: 75,000
    // 0-3L: 0%
    // 3-7L: 5% (Rebate u/s 87A makes it 0 if taxable <= 7L)
    // 7-10L: 10%
    // 10-12L: 15%
    // 12-15L: 20%
    // >15L: 30%

    const annualIncome = grossSalary * 12;
    const standardDeduction = 75000;
    const taxableIncome = Math.max(0, annualIncome - standardDeduction);
    let tdsAnnual = 0;

    if (taxableIncome > 700000) { // Only tax if > 7L (due to 87A rebate)
      let remaining = taxableIncome;

      // 0-3L: 0%
      remaining -= 300000;

      if (remaining > 0) {
        // 3L-7L: 5%
        const slab = Math.min(remaining, 400000);
        tdsAnnual += slab * 0.05;
        remaining -= slab;
      }

      if (remaining > 0) {
        // 7L-10L: 10%
        const slab = Math.min(remaining, 300000);
        tdsAnnual += slab * 0.10;
        remaining -= slab;
      }

      if (remaining > 0) {
        // 10L-12L: 15%
        const slab = Math.min(remaining, 200000);
        tdsAnnual += slab * 0.15;
        remaining -= slab;
      }

      if (remaining > 0) {
        // 12L-15L: 20%
        const slab = Math.min(remaining, 300000);
        tdsAnnual += slab * 0.20;
        remaining -= slab;
      }

      if (remaining > 0) {
        // >15L: 30%
        tdsAnnual += remaining * 0.30;
      }
    }

    const tdsDeduction = tdsAnnual / 12;

    return {
      pf: pfDeduction,
      esi: esiDeduction,
      pt: ptDeduction,
      tds: tdsDeduction
    };
  }

  async calculatePayrollEntries(payrollRunId: string) {
    const payrollRun = await this.prisma.payrollRun.findUnique({
      where: { id: payrollRunId },
    });

    if (!payrollRun) {
      throw new NotFoundException(`Payroll run with ID ${payrollRunId} not found`);
    }

    if (payrollRun.status !== 'draft') {
      throw new BadRequestException('Can only calculate entries for draft payroll runs');
    }

    // Get all active employees with salary structures
    const employees = await this.prisma.employee.findMany({
      where: {
        employmentStatus: 'active',
        salaryStructureId: { not: null },
      },
      include: {
        salaryStructure: true,
      },
    });

    // Get LOP days for each employee for the month
    const startDate = new Date(payrollRun.year, payrollRun.month - 1, 1);
    const endDate = new Date(payrollRun.year, payrollRun.month, 0);

    const entries: {
      payrollRunId: string;
      employeeId: string;
      grossSalary: Decimal;
      lopDays: number;
      lopDeduction: Decimal;
      totalDeductions: Decimal;
      netSalary: Decimal;
      deductions: any;
    }[] = [];

    for (const employee of employees) {
      if (!employee.salaryStructure) continue;

      // Get attendance for the month
      const attendance = await this.prisma.attendance.findMany({
        where: {
          employeeId: employee.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
          status: 'absent',
        },
      });

      // Get approved leave requests for the month
      const approvedLeaves = await this.prisma.leaveRequest.findMany({
        where: {
          employeeId: employee.id,
          status: 'approved',
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
      });

      // Calculate LOP days (absent days not covered by approved leave)
      const leaveDays = approvedLeaves.reduce((total, leave) => {
        const leaveStart = new Date(leave.startDate);
        const leaveEnd = new Date(leave.endDate);
        const effectiveStart = new Date(Math.max(leaveStart.getTime(), startDate.getTime()));
        const effectiveEnd = new Date(Math.min(leaveEnd.getTime(), endDate.getTime()));
        return total + Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }, 0);

      const lopDays = Math.max(0, attendance.length - leaveDays);

      // Calculate Components
      const structure = employee.salaryStructure;
      const basic = Number(structure.basic);
      const grossSalary = basic + Number(structure.hra) +
        Number(structure.conveyance) + Number(structure.medicalAllowance) +
        Number(structure.specialAllowance);

      // 1. LOP Calculation
      const perDaySalary = grossSalary / 30;
      const lopDeduction = perDaySalary * lopDays;

      // Calculate dynamic deductions
      const { pf, esi, pt, tds } = this.calculateDeductions(grossSalary, structure);

      // Total Deductions
      const totalDeductions = lopDeduction + pf + esi + pt + tds;
      const netSalary = grossSalary - totalDeductions;

      entries.push({
        payrollRunId,
        employeeId: employee.id,
        grossSalary: new Decimal(grossSalary.toFixed(2)),
        lopDays,
        lopDeduction: new Decimal(lopDeduction.toFixed(2)),
        totalDeductions: new Decimal(totalDeductions.toFixed(2)),
        netSalary: new Decimal(netSalary.toFixed(2)),
        deductions: {
          lop: Number(lopDeduction.toFixed(2)),
          pf: Number(pf.toFixed(2)),
          esi: Number(esi.toFixed(2)),
          pt: Number(pt.toFixed(2)),
          tds: Number(tds.toFixed(2))
        },
      });
    }

    // Delete existing entries and create new ones
    await this.prisma.$transaction(async (tx) => {
      await tx.payrollEntry.deleteMany({
        where: { payrollRunId },
      });

      await tx.payrollEntry.createMany({
        data: entries,
      });
    });

    this.logger.log(`Payroll entries calculated for run ${payrollRunId}: ${entries.length} entries`);
    return { message: `Calculated ${entries.length} payroll entries`, count: entries.length };
  }

  async approvePayrollRun(id: string, userId: string) {
    const payrollRun = await this.prisma.payrollRun.findUnique({
      where: { id },
      include: {
        _count: {
          select: { entries: true },
        },
      },
    });

    if (!payrollRun) {
      throw new NotFoundException(`Payroll run with ID ${id} not found`);
    }

    if (payrollRun.status !== 'draft') {
      throw new BadRequestException('Can only approve draft payroll runs');
    }

    if (payrollRun._count.entries === 0) {
      throw new BadRequestException('Cannot approve payroll run with no entries');
    }

    const updated = await this.prisma.payrollRun.update({
      where: { id },
      data: {
        status: 'approved',
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });

    this.logger.log(`Payroll run approved: ${id}`);
    return updated;
  }

  async processPayrollRun(id: string) {
    const payrollRun = await this.prisma.payrollRun.findUnique({
      where: { id },
    });

    if (!payrollRun) {
      throw new NotFoundException(`Payroll run with ID ${id} not found`);
    }

    if (payrollRun.status !== 'approved') {
      throw new BadRequestException('Can only process approved payroll runs');
    }

    const updated = await this.prisma.payrollRun.update({
      where: { id },
      data: {
        status: 'processed',
        processedAt: new Date(),
      },
    });

    this.logger.log(`Payroll run processed: ${id}`);
    return updated;
  }

  async deletePayrollRun(id: string) {
    const payrollRun = await this.prisma.payrollRun.findUnique({
      where: { id },
    });

    if (!payrollRun) {
      throw new NotFoundException(`Payroll run with ID ${id} not found`);
    }

    if (payrollRun.status === 'processed') {
      throw new ForbiddenException('Cannot delete processed payroll runs');
    }

    await this.prisma.payrollRun.delete({
      where: { id },
    });

    this.logger.log(`Payroll run deleted: ${id}`);
    return { message: 'Payroll run deleted successfully' };
  }

  // ============ Payroll Entry Methods ============

  async findPayrollEntryById(id: string) {
    const entry = await this.prisma.payrollEntry.findUnique({
      where: { id },
      include: {
        payrollRun: true,
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException(`Payroll entry with ID ${id} not found`);
    }

    return entry;
  }

  async updatePayrollEntry(id: string, data: { lopDays?: number; notes?: string }) {
    const entry = await this.prisma.payrollEntry.findUnique({
      where: { id },
      include: { payrollRun: true },
    });

    if (!entry) {
      throw new NotFoundException(`Payroll entry with ID ${id} not found`);
    }

    if (entry.payrollRun.status !== 'draft') {
      throw new BadRequestException('Can only update entries in draft payroll runs');
    }

    const grossSalary = Number(entry.grossSalary);
    const perDaySalary = grossSalary / 30;
    const lopDays = data.lopDays ?? entry.lopDays;
    const lopDeduction = perDaySalary * lopDays;

    // Get employee's salary structure for deductions
    const employee = await this.prisma.employee.findUnique({
      where: { id: entry.employeeId },
      include: { salaryStructure: true },
    });

    const structure = employee?.salaryStructure;
    // Fix: Recalculate dynamic deductions instead of using fixed structure values
    let fixedDeductions = 0;
    if (structure) {
      const { pf, esi, pt, tds } = this.calculateDeductions(grossSalary, structure);
      fixedDeductions = pf + esi + pt + tds;
    }

    const totalDeductions = lopDeduction + fixedDeductions;
    const netSalary = grossSalary - totalDeductions;

    // Update deductions JSON
    let deductions: any = (entry as any).deductions || {};
    if (structure) {
      const { pf, esi, pt, tds } = this.calculateDeductions(grossSalary, structure);
      deductions = {
        ...deductions,
        lop: Number(lopDeduction.toFixed(2)),
        pf: Number(pf.toFixed(2)),
        esi: Number(esi.toFixed(2)),
        pt: Number(pt.toFixed(2)),
        tds: Number(tds.toFixed(2))
      };
    }

    const updated = await this.prisma.payrollEntry.update({
      where: { id },
      data: {
        lopDays,
        lopDeduction: new Decimal(lopDeduction.toFixed(2)),
        totalDeductions: new Decimal(totalDeductions.toFixed(2)),
        netSalary: new Decimal(netSalary.toFixed(2)),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        deductions: deductions,
      },
    });

    this.logger.log(`Payroll entry updated: ${id}`);
    return updated;
  }

  // ============ Reports ============

  async getPayrollSummary(payrollRunId: string) {
    const payrollRun = await this.prisma.payrollRun.findUnique({
      where: { id: payrollRunId },
      include: {
        entries: {
          include: {
            employee: {
              select: {
                department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!payrollRun) {
      throw new NotFoundException(`Payroll run with ID ${payrollRunId} not found`);
    }

    const totalGross = payrollRun.entries.reduce((sum, e) => sum + Number(e.grossSalary), 0);
    const totalDeductions = payrollRun.entries.reduce((sum, e) => sum + Number(e.totalDeductions), 0);
    const totalNet = payrollRun.entries.reduce((sum, e) => sum + Number(e.netSalary), 0);

    // Group by department
    const byDepartment = payrollRun.entries.reduce((acc, e) => {
      const deptName = e.employee.department?.name || 'Unassigned';
      if (!acc[deptName]) {
        acc[deptName] = { count: 0, gross: 0, deductions: 0, net: 0 };
      }
      acc[deptName].count++;
      acc[deptName].gross += Number(e.grossSalary);
      acc[deptName].deductions += Number(e.totalDeductions);
      acc[deptName].net += Number(e.netSalary);
      return acc;
    }, {} as Record<string, { count: number; gross: number; deductions: number; net: number }>);

    return {
      payrollRun: {
        id: payrollRun.id,
        month: payrollRun.month,
        year: payrollRun.year,
        status: payrollRun.status,
      },
      summary: {
        totalEmployees: payrollRun.entries.length,
        totalGrossSalary: totalGross.toFixed(2),
        totalDeductions: totalDeductions.toFixed(2),
        totalNetSalary: totalNet.toFixed(2),
      },
      byDepartment: Object.entries(byDepartment).map(([dept, data]) => ({
        department: dept,
        employeeCount: data.count,
        grossSalary: data.gross.toFixed(2),
        deductions: data.deductions.toFixed(2),
        netSalary: data.net.toFixed(2),
      })),
    };
  }

  async getEmployeePayslips(employeeId: string) {
    if (!employeeId) {
        return [];
    }
    return this.prisma.payrollEntry.findMany({
      where: { employeeId },
      include: {
        payrollRun: true,
      },
      orderBy: {
        payrollRun: {
          year: 'desc',
        },
      },
    });
  }

  async generatePayslip(payrollEntryId: string): Promise<Buffer> {
    const entry = await this.prisma.payrollEntry.findUnique({
      where: { id: payrollEntryId },
      include: {
        employee: {
          include: {
            department: true,
            salaryStructure: true,
          }
        },
        payrollRun: true,
      },
    });

    if (!entry) {
      throw new NotFoundException('Payroll entry not found');
    }

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .label { font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Payslip</h1>
            <h3>${entry.payrollRun.month} / ${entry.payrollRun.year}</h3>
          </div>
          
          <div class="section">
            <div class="row">
              <span class="label">Employee Name:</span>
              <span>${entry.employee.firstName} ${entry.employee.lastName}</span>
            </div>
            <div class="row">
              <span class="label">Employee Code:</span>
              <span>${entry.employee.employeeCode}</span>
            </div>
            <div class="row">
              <span class="label">Department:</span>
              <span>${entry.employee.department?.name || 'N/A'}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Earnings</th>
                <th>Amount</th>
                <th>Deductions</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic</td>
                <td>${entry.employee.salaryStructure?.basic || 0}</td>
                <td>PF</td>
                <td>${((entry as any).deductions as any)?.pf?.toFixed(2) || 0}</td>
              </tr>
              <tr>
                <td>HRA</td>
                <td>${entry.employee.salaryStructure?.hra || 0}</td>
                <td>ESI</td>
                <td>${((entry as any).deductions as any)?.esi?.toFixed(2) || 0}</td>
              </tr>
              <tr>
                <td>Allowances</td>
                <td>${(Number(entry.employee.salaryStructure?.medicalAllowance || 0) + Number(entry.employee.salaryStructure?.specialAllowance || 0)).toFixed(2)}</td>
                <td>TDS</td>
                <td>${((entry as any).deductions as any)?.tds?.toFixed(2) || 0}</td>
              </tr>
               <tr>
                <td></td>
                <td></td>
                <td>LOP</td>
                <td>${Number(entry.lopDeduction).toFixed(2)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th>Total Earnings</th>
                <th>${Number(entry.grossSalary).toFixed(2)}</th>
                <th>Total Deductions</th>
                <th>${Number(entry.totalDeductions).toFixed(2)}</th>
              </tr>
            </tfoot>
          </table>

          <div class="section" style="margin-top: 30px; text-align: right;">
            <h3>Net Pay: ${Number(entry.netSalary).toFixed(2)}</h3>
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent);
      const pdf = await page.pdf({ format: 'A4' });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  async generateBankTransferFile(payrollRunId: string): Promise<Buffer> {
    const payrollRun = await this.prisma.payrollRun.findUnique({
      where: { id: payrollRunId },
      include: {
        entries: {
          include: {
            employee: true,
          },
        },
      },
    });

    if (!payrollRun) {
      throw new NotFoundException(`Payroll run with ID ${payrollRunId} not found`);
    }

    // Prepare data for Excel
    const data = payrollRun.entries.map((entry) => ({
      'Employee Code': entry.employee.employeeCode,
      'Employee Name': `${entry.employee.firstName} ${entry.employee.lastName}`,
      'Bank Account': (entry.employee as any).bankAccountNumber || 'N/A',
      'IFSC Code': (entry.employee as any).ifscCode || 'N/A',
      'Bank Name': (entry.employee as any).bankName || 'N/A',
      'Net Salary': Number(entry.netSalary),
      'Month': payrollRun.month,
      'Year': payrollRun.year,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bank Transfer');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }
}
