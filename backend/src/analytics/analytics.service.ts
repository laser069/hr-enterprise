import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) { }

  // ============ Executive Summary ============

  async getExecutiveSummary() {
    const [
      totalEmployees,
      activeEmployees,
      totalDepartments,
      pendingLeaveRequests,
      todayAttendance,
      openJobs,
      pendingPayroll,
      departmentBreakdown,
    ] = await Promise.all([
      this.prisma.employee.count(),
      this.prisma.employee.count({ where: { employmentStatus: 'active' } }),
      this.prisma.department.count(),
      this.prisma.leaveRequest.count({ where: { status: 'pending' } }),
      this.getTodayAttendanceSummary(),
      this.prisma.job.count({ where: { status: 'open' } }),
      this.prisma.payrollRun.count({ where: { status: 'draft' } }),
      this.prisma.department.findMany({
        include: { _count: { select: { employees: true } } },
      }),
    ]);

    return {
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: totalEmployees - activeEmployees,
      },
      departments: totalDepartments,
      leave: {
        pendingRequests: pendingLeaveRequests,
      },
      attendance: todayAttendance,
      recruitment: {
        openPositions: openJobs,
      },
      payroll: {
        pendingRuns: pendingPayroll,
      },
      departmentBreakdown: departmentBreakdown.map((d) => ({
        department: d.name,
        count: d._count.employees,
      })),
    };
  }

  // ============ Attendance Analytics ============

  async getTodayAttendanceSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeEmployees = await this.prisma.employee.count({
      where: { employmentStatus: 'active' },
    });

    const todayRecords = await this.prisma.attendance.findMany({
      where: {
        date: today,
      },
    });

    const present = todayRecords.filter((a) => a.status !== 'absent').length;
    const absent = todayRecords.filter((a) => a.status === 'absent').length;
    const late = todayRecords.filter((a) => a.status === 'late').length;
    const onLeave = todayRecords.filter((a) => a.status === 'on-leave').length;

    return {
      date: today.toISOString().split('T')[0],
      totalEmployees: activeEmployees,
      present,
      absent,
      late,
      onLeave,
      notMarked: activeEmployees - todayRecords.length,
      attendanceRate: activeEmployees > 0 ? ((present / activeEmployees) * 100).toFixed(2) : 0,
    };
  }

  async getPerformanceMetrics(params: { departmentId?: string; year?: number }) {
    const year = params.year || new Date().getFullYear();
    const where: any = {};
    if (params.departmentId) {
      where.employee = { departmentId: params.departmentId };
    }

    const [reviews, goals] = await Promise.all([
      this.prisma.performanceReview.findMany({
        where: {
          ...where,
          createdAt: {
            gte: new Date(year, 0, 1),
            lte: new Date(year, 11, 31),
          },
        },
        select: { rating: true, employee: { select: { departmentId: true } } },
      }),
      this.prisma.goal.findMany({
        where: {
          ...where,
          startDate: { gte: new Date(year, 0, 1) },
          endDate: { lte: new Date(year, 11, 31) },
        },
        select: { status: true, targetValue: true, achievedValue: true },
      }),
    ]);

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
      : 0;

    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const goalCompletionRate = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;

    return {
      year,
      averageRating: avgRating.toFixed(2),
      totalReviews: reviews.length,
      goalCompletionRate: goalCompletionRate.toFixed(2),
      totalGoals: goals.length,
    };
  }

  async getAttendanceMetrics(params: { startDate: Date; endDate: Date; departmentId?: string }) {
    const { startDate, endDate, departmentId } = params;

    const employeeWhere: any = {};
    if (departmentId) employeeWhere.departmentId = departmentId;

    const employees = await this.prisma.employee.findMany({
      where: employeeWhere,
      select: { id: true },
    });

    const employeeIds = employees.map((e) => e.id);

    const attendance = await this.prisma.attendance.findMany({
      where: {
        employeeId: { in: employeeIds },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalDays = attendance.length;
    const presentDays = attendance.filter((a) => a.status === 'present').length;
    const lateDays = attendance.filter((a) => a.status === 'late').length;
    const absentDays = attendance.filter((a) => a.status === 'absent').length;
    const halfDays = attendance.filter((a) => a.status === 'half-day').length;
    const onLeaveDays = attendance.filter((a) => a.status === 'on-leave').length;

    const totalWorkMinutes = attendance.reduce((sum, a) => sum + (a.workMinutes || 0), 0);
    const totalOvertimeMinutes = attendance.reduce((sum, a) => sum + a.overtimeMinutes, 0);

    return {
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      summary: {
        totalRecords: totalDays,
        present: presentDays,
        late: lateDays,
        absent: absentDays,
        halfDay: halfDays,
        onLeave: onLeaveDays,
      },
      workHours: {
        totalMinutes: totalWorkMinutes,
        totalHours: (totalWorkMinutes / 60).toFixed(2),
        averagePerDay: totalDays > 0 ? (totalWorkMinutes / totalDays / 60).toFixed(2) : 0,
      },
      overtime: {
        totalMinutes: totalOvertimeMinutes,
        totalHours: (totalOvertimeMinutes / 60).toFixed(2),
      },
      attendanceRate: totalDays > 0 ? (((presentDays + lateDays) / totalDays) * 100).toFixed(2) : 0,
    };
  }

  async getDetailedAttendanceReport(params: { startDate: Date; endDate: Date; departmentId?: string }) {
    const { startDate, endDate, departmentId } = params;

    const where: any = {
      date: { gte: startDate, lte: endDate },
    };
    if (departmentId) {
      where.employee = { departmentId };
    }

    const records = await this.prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return records.map(r => ({
      date: r.date.toISOString().split('T')[0],
      employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
      employeeCode: r.employee.employeeCode,
      department: r.employee.department?.name || 'N/A',
      checkIn: r.checkIn?.toISOString() || null,
      checkOut: r.checkOut?.toISOString() || null,
      status: r.status,
      workMinutes: r.workMinutes || 0,
      lateMinutes: r.lateMinutes || 0,
    }));
  }

  // ============ Leave Analytics ============

  async getLeaveMetrics(params: { year?: number; departmentId?: string }) {
    let year = Number(params.year);
    if (isNaN(year) || year < 2000) {
      year = new Date().getFullYear();
    }
    const { departmentId } = params;

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const employeeWhere: any = {};
    if (departmentId) employeeWhere.departmentId = departmentId;

    const employees = await this.prisma.employee.findMany({
      where: employeeWhere,
      select: { id: true },
    });

    const employeeIds = employees.map((e) => e.id);

    const leaveRequests = await this.prisma.leaveRequest.findMany({
      where: {
        employeeId: { in: employeeIds },
        startDate: { gte: startDate },
        endDate: { lte: endDate },
      },
    });

    const byStatus = {
      pending: leaveRequests.filter((l) => l.status === 'pending').length,
      approved: leaveRequests.filter((l) => l.status === 'approved').length,
      rejected: leaveRequests.filter((l) => l.status === 'rejected').length,
      cancelled: leaveRequests.filter((l) => l.status === 'cancelled').length,
    };

    const totalDaysRequested = leaveRequests.reduce((sum, l) => sum + l.days, 0);
    const approvedDays = leaveRequests
      .filter((l) => l.status === 'approved')
      .reduce((sum, l) => sum + l.days, 0);

    const byLeaveType = await this.prisma.leaveType.findMany({
      include: {
        requests: {
          where: {
            employeeId: { in: employeeIds },
            status: 'approved',
          },
        },
      },
    });

    return {
      year,
      totalRequests: leaveRequests.length,
      byStatus,
      totalDaysRequested,
      approvedDays,
      byLeaveType: byLeaveType.map((lt) => ({
        name: lt.name,
        totalRequests: lt.requests.length,
        totalDays: lt.requests.reduce((sum, r) => sum + r.days, 0),
      })),
    };
  }

  // ============ Payroll Analytics ============

  async getPayrollMetrics(params: { year?: number }) {
    let year = Number(params.year);
    if (isNaN(year) || year < 2000) {
      year = new Date().getFullYear();
    }

    const payrollRuns = await this.prisma.payrollRun.findMany({
      where: {
        year,
      },
      include: {
        entries: true,
      },
    });

    const byMonth: Record<number, { count: number; gross: number; net: number }> = {};

    for (const run of payrollRuns) {
      byMonth[run.month] = {
        count: run.entries.length,
        gross: run.entries.reduce((sum, e) => sum + Number(e.grossSalary), 0),
        net: run.entries.reduce((sum, e) => sum + Number(e.netSalary), 0),
      };
    }

    const totalGross = Object.values(byMonth).reduce((sum, m) => sum + m.gross, 0);
    const totalNet = Object.values(byMonth).reduce((sum, m) => sum + m.net, 0);

    return {
      year,
      totalPayrollRuns: payrollRuns.length,
      processed: payrollRuns.filter((r) => r.status === 'processed').length,
      pending: payrollRuns.filter((r) => r.status !== 'processed').length,
      totalGrossSalary: totalGross.toFixed(2),
      totalNetSalary: totalNet.toFixed(2),
      totalDeductions: (totalGross - totalNet).toFixed(2),
      byMonth: Object.entries(byMonth).map(([month, data]) => ({
        month: parseInt(month),
        employeeCount: data.count,
        grossSalary: data.gross.toFixed(2),
        netSalary: data.net.toFixed(2),
      })),
    };
  }

  async getDetailedPayrollReport(params: { year: number; month?: number }) {
    const where: any = { year: params.year };
    if (params.month) where.month = params.month;

    const runs = await this.prisma.payrollRun.findMany({
      where,
      include: {
        entries: {
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true,
                employeeCode: true,
                department: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    const report = [];
    for (const run of runs) {
      for (const entry of run.entries) {
        report.push({
          period: `${run.year}-${String(run.month).padStart(2, '0')}`,
          employeeName: `${entry.employee.firstName} ${entry.employee.lastName}`,
          employeeCode: entry.employee.employeeCode,
          department: entry.employee.department?.name || 'N/A',
          grossSalary: Number(entry.grossSalary),
          netSalary: Number(entry.netSalary),
          deductions: Number(entry.totalDeductions),
          status: run.status,
        });
      }
    }
    return report;
  }

  // ============ Attrition Analytics ============

  async getAttritionRate(params: { year?: number }) {
    let year = Number(params.year);
    if (isNaN(year) || year < 2000) {
      year = new Date().getFullYear();
    }

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);

    // Employees at start of year
    const employeesAtStart = await this.prisma.employee.count({
      where: {
        dateOfJoining: { lt: startOfYear },
        employmentStatus: 'active',
      },
    });

    // New joiners
    const newJoiners = await this.prisma.employee.count({
      where: {
        dateOfJoining: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
    });

    // Employees who left
    const leftEmployees = await this.prisma.employee.count({
      where: {
        employmentStatus: { in: ['inactive', 'terminated'] },
        updatedAt: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
    });

    const averageEmployees = employeesAtStart + newJoiners / 2;
    const attritionRate = averageEmployees > 0 ? (leftEmployees / averageEmployees) * 100 : 0;

    // Monthly data calculation (Real distribution)
    const monthlyData = await Promise.all(
      Array.from({ length: 12 }, async (_, i) => {
        const monthStart = new Date(year, i, 1);
        const monthEnd = new Date(year, i + 1, 0);

        const [hires, exits] = await Promise.all([
          this.prisma.employee.count({
            where: {
              dateOfJoining: { gte: monthStart, lte: monthEnd },
            },
          }),
          this.prisma.employee.count({
            where: {
              employmentStatus: { in: ['inactive', 'terminated'] },
              updatedAt: { gte: monthStart, lte: monthEnd },
            },
          }),
        ]);

        return {
          month: i + 1,
          hires,
          exits,
          netChange: hires - exits,
        };
      }),
    );

    return {
      startingHeadcount: employeesAtStart,
      newHires: newJoiners,
      terminations: leftEmployees,
      attritionRate: Number(attritionRate.toFixed(2)),
      voluntaryExits: Math.round(leftEmployees * 0.7), // Estimated breakdown
      involuntaryExits: Math.round(leftEmployees * 0.3),
      endingHeadcount: employeesAtStart + newJoiners - leftEmployees,
      monthlyData,
      byDepartment: [], // Stubbed for now
      trend: attritionRate > 5 ? 'up' : 'stable',
    };
  }

  // ============ Department Analytics ============

  async getDepartmentMetrics() {
    const departments = await this.prisma.department.findMany({
      include: {
        employees: {
          where: { employmentStatus: 'active' },
          select: {
            id: true,
            dateOfJoining: true,
          },
        },
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    return departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      employeeCount: dept._count.employees,
      activeEmployees: dept.employees.length,
      averageTenure: dept.employees.length > 0
        ? dept.employees.reduce((sum, e) => {
          const tenure = (Date.now() - e.dateOfJoining.getTime()) / (1000 * 60 * 60 * 24 * 365);
          return sum + tenure;
        }, 0) / dept.employees.length
        : 0,
    }));
  }
}
