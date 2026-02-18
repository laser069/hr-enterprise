import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  // IST is UTC+5:30
  private readonly IST_OFFSET = 5.5 * 60 * 60 * 1000;
  // Late threshold: 9:15 AM IST
  private readonly LATE_THRESHOLD_HOUR = 9;
  private readonly LATE_THRESHOLD_MINUTE = 15;
  // Standard work hours: 8 hours
  private readonly STANDARD_WORK_MINUTES = 8 * 60;
  // Half-day threshold: 4 hours
  private readonly HALF_DAY_MINUTES = 4 * 60;

  constructor(private readonly prisma: PrismaService) { }

  private toIST(date: Date): Date {
    return new Date(date.getTime() + this.IST_OFFSET);
  }

  private getDateString(date: Date): string {
    const ist = this.toIST(date);
    return ist.toISOString().split('T')[0];
  }

  private calculateLateMinutes(checkIn: Date, shift?: { startTime: string } | null): number {
    const ist = this.toIST(checkIn);
    const hour = ist.getUTCHours();
    const minute = ist.getUTCMinutes();

    let thresholdHour = this.LATE_THRESHOLD_HOUR;
    let thresholdMinute = this.LATE_THRESHOLD_MINUTE;

    if (shift) {
      const [sh, sm] = shift.startTime.split(':').map(Number);
      thresholdHour = sh;
      thresholdMinute = sm + 15; // 15 mins grace
      if (thresholdMinute >= 60) {
        thresholdHour += Math.floor(thresholdMinute / 60);
        thresholdMinute %= 60;
      }
    }

    const lateThresholdMinutes = thresholdHour * 60 + thresholdMinute;
    const actualMinutes = hour * 60 + minute;

    if (actualMinutes <= lateThresholdMinutes) {
      return 0;
    }

    return actualMinutes - lateThresholdMinutes;
  }

  private calculateWorkMinutes(checkIn: Date, checkOut: Date): number {
    return Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60));
  }

  private calculateOvertimeMinutes(workMinutes: number): number {
    return Math.max(0, workMinutes - this.STANDARD_WORK_MINUTES);
  }

  private determineStatus(
    checkIn: Date | null,
    checkOut: Date | null,
    workMinutes: number,
    shift?: { startTime: string } | null,
  ): string {
    if (!checkIn) {
      return 'absent';
    }

    if (!checkOut) {
      return 'present';
    }

    const lateMinutes = this.calculateLateMinutes(checkIn, shift);

    if (lateMinutes > 0 && workMinutes < this.HALF_DAY_MINUTES) {
      return 'half-day';
    }

    if (lateMinutes > 0) {
      return 'late';
    }

    return 'present';
  }

  async checkIn(checkInDto: CheckInDto) {
    const { employeeId, timestamp, notes } = checkInDto;

    // Validate employee
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      // @ts-ignore
      include: { shift: true },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const now = timestamp ? new Date(timestamp) : new Date();
    const date = this.getDateString(now);

    // Check if already checked in
    const existingAttendance = await this.prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: new Date(date),
        },
      },
    });

    if (existingAttendance?.checkIn) {
      throw new ConflictException('Already checked in for today');
    }

    // Create or update attendance record
    const lateMinutes = this.calculateLateMinutes(now, (employee as any).shift);
    const status = this.determineStatus(now, null, 0, (employee as any).shift);

    const attendance = await this.prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: new Date(date),
        },
      },
      update: {
        checkIn: now,
        lateMinutes,
        status,
        notes: notes || existingAttendance?.notes,
      },
      create: {
        employeeId,
        date: new Date(date),
        checkIn: now,
        lateMinutes,
        status,
        notes,
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    this.logger.log(`Employee ${employeeId} checked in at ${now.toISOString()}`);

    return attendance;
  }

  async checkOut(checkOutDto: CheckOutDto) {
    const { employeeId, timestamp, notes } = checkOutDto;

    // Validate employee
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      // @ts-ignore
      include: { shift: true },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const now = timestamp ? new Date(timestamp) : new Date();
    const date = this.getDateString(now);

    // Get existing attendance
    const attendance = await this.prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: new Date(date),
        },
      },
    });

    if (!attendance || !attendance.checkIn) {
      throw new BadRequestException('Must check in before checking out');
    }

    if (attendance.checkOut) {
      throw new ConflictException('Already checked out for today');
    }

    // Calculate work and overtime
    const workMinutes = this.calculateWorkMinutes(attendance.checkIn, now);
    const overtimeMinutes = this.calculateOvertimeMinutes(workMinutes);
    const status = this.determineStatus(
      attendance.checkIn,
      now,
      workMinutes,
      (employee as any).shift,
    );

    const updatedAttendance = await this.prisma.attendance.update({
      where: {
        employeeId_date: {
          employeeId,
          date: new Date(date),
        },
      },
      data: {
        checkOut: now,
        workMinutes,
        overtimeMinutes,
        status,
        notes: notes || attendance.notes,
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    this.logger.log(`Employee ${employeeId} checked out at ${now.toISOString()}`);

    return updatedAttendance;
  }

  async create(createAttendanceDto: CreateAttendanceDto) {
    const { employeeId, date, checkIn, checkOut, status, notes, isManualEntry } =
      createAttendanceDto;

    // Validate employee
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      // @ts-ignore
      include: { shift: true },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const dateObj = new Date(date);

    // Check if attendance record exists
    const existing = await this.prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: dateObj,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Attendance record already exists for employee ${employeeId} on ${date}`,
      );
    }

    // Calculate metrics
    let lateMinutes = 0;
    let workMinutes: number | undefined;
    let overtimeMinutes = 0;
    let finalStatus = status;

    if (checkIn) {
      const checkInDate = new Date(checkIn);
      lateMinutes = this.calculateLateMinutes(checkInDate, (employee as any).shift);

      if (checkOut) {
        const checkOutDate = new Date(checkOut);
        workMinutes = this.calculateWorkMinutes(checkInDate, checkOutDate);
        overtimeMinutes = this.calculateOvertimeMinutes(workMinutes);
      }

      if (!finalStatus) {
        finalStatus = this.determineStatus(
          checkInDate,
          checkOut ? new Date(checkOut) : null,
          workMinutes || 0,
          (employee as any).shift,
        );
      }
    }

    const attendance = await this.prisma.attendance.create({
      data: {
        employeeId,
        date: dateObj,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        status: finalStatus || 'absent',
        lateMinutes,
        workMinutes,
        overtimeMinutes,
        isManualEntry: isManualEntry ?? true,
        notes,
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    this.logger.log(`Manual attendance created for employee ${employeeId}`);

    return attendance;
  }

  async findAll(
    params: {
      skip?: number;
      take?: number;
      employeeId?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
    },
    user?: any,
  ) {
    const { skip = 0, take = 10, employeeId, startDate, endDate, status } = params;

    const where: any = {};

    // Role-based visibility enforcement
    if (user) {
      if (user.roleName === 'employee') {
        // Employees can only see their own attendance
        where.employeeId = user.employeeId;
      } else if (user.roleName === 'manager') {
        // Managers can see their own attendance AND their team's attendance
        // Logic: (employeeId = user.employeeId) OR (employee.managerId = user.employeeId)
        where.OR = [
          { employeeId: user.employeeId },
          { employee: { managerId: user.employeeId } },
        ];
      }
      // Admin / HR Manager -> No extra filters (can see all)
    }

    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    // Merge role-based `where` with query params `where`
    // If role enforced `where.employeeId`, ensure query param `employeeId` doesn't override it permissively
    // Actually, simply adding properties to `where` object merges them with AND logic implicitly for separate keys.
    // BUT: `where.employeeId` set by role logic will be overwritten by `if (employeeId) where.employeeId = employeeId;`
    // We must ensure user cannot request someone else's data if restricted.

    // Correct logic:
    if (user?.roleName === 'employee') {
      // Force employeeId to be current user's, ignoring query param
      where.employeeId = user.employeeId;
    } else if (user?.roleName === 'manager') {
      // If manager requests specific employee, ensure it's in their scope
      if (employeeId) {
        // We need to ensure this employeeId is either self OR in team. 
        // Ideally we'd add this check. 
        // Simple way: Add explicit AND condition.
        where.employeeId = employeeId;
        where.OR = [
          { employeeId: user.employeeId },
          { employee: { managerId: user.employeeId } },
        ];
        // Note: Prisma 7 might struggle with complex AND/OR overrides on same field.
        // But here we are setting `employeeId` property AND an `OR` condition.
        // Wait, if we set `where.employeeId`, the OR condition might conflict if not careful.
        // Actually, `where` object structure:
        // { employeeId: 'X', OR: [...] } -> implies EmployeeId must be X AND (condition in OR).
        // This works perfectly check: Is X (Self) OR Is X (Team member)? 
      } else {
        // No specific employee requested, just show all allowed
        // where.OR is already set above
      }
    } else {
      // Admin/HR
      if (employeeId) where.employeeId = employeeId;
    }

    const [attendance, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take,
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return {
      data: attendance,
      meta: {
        page: Math.floor(skip / take) + 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    return attendance;
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: {
        employee: {
          // @ts-ignore
          include: { shift: true },
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    const { checkIn, checkOut, status, notes } = updateAttendanceDto;

    // Recalculate metrics if times changed
    let lateMinutes = attendance.lateMinutes;
    let workMinutes = attendance.workMinutes;
    let overtimeMinutes = attendance.overtimeMinutes;
    let finalStatus = status || attendance.status;

    const newCheckIn = checkIn ? new Date(checkIn) : attendance.checkIn;
    const newCheckOut = checkOut ? new Date(checkOut) : attendance.checkOut;

    if (newCheckIn) {
      lateMinutes = this.calculateLateMinutes(newCheckIn, ((attendance as any).employee as any).shift);

      if (newCheckOut) {
        workMinutes = this.calculateWorkMinutes(newCheckIn, newCheckOut);
        overtimeMinutes = this.calculateOvertimeMinutes(workMinutes);
      }

      if (!status) {
        finalStatus = this.determineStatus(
          newCheckIn,
          newCheckOut,
          workMinutes || 0,
          ((attendance as any).employee as any).shift,
        );
      }
    }

    const updated = await this.prisma.attendance.update({
      where: { id },
      data: {
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        status: finalStatus,
        lateMinutes,
        workMinutes,
        overtimeMinutes,
        notes: notes || attendance.notes,
        isManualEntry: true,
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    this.logger.log(`Attendance record ${id} updated`);

    return updated;
  }

  async remove(id: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    await this.prisma.attendance.delete({
      where: { id },
    });

    this.logger.log(`Attendance record ${id} deleted`);

    return { message: 'Attendance record deleted successfully' };
  }

  async getSummary(employeeId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const [attendanceRecords, stats] = await Promise.all([
      this.prisma.attendance.findMany({
        where: {
          employeeId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: 'asc' },
      }),
      this.prisma.attendance.groupBy({
        by: ['status'],
        where: {
          employeeId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: {
          status: true,
        },
      }),
    ]);

    const totalWorkingDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(
      (a) => a.status === 'present' || a.status === 'late',
    ).length;
    const absentDays = attendanceRecords.filter((a) => a.status === 'absent').length;
    const lateDays = attendanceRecords.filter((a) => a.status === 'late').length;
    const halfDays = attendanceRecords.filter((a) => a.status === 'half-day').length;

    const totalLateMinutes = attendanceRecords.reduce(
      (sum, a) => sum + a.lateMinutes,
      0,
    );
    const totalOvertimeMinutes = attendanceRecords.reduce(
      (sum, a) => sum + a.overtimeMinutes,
      0,
    );
    const totalWorkMinutes = attendanceRecords.reduce(
      (sum, a) => sum + (a.workMinutes || 0),
      0,
    );

    return {
      employeeId,
      month,
      year,
      summary: {
        totalWorkingDays,
        presentDays,
        absentDays,
        lateDays,
        halfDays,
        attendancePercentage:
          totalWorkingDays > 0
            ? ((presentDays + lateDays) / totalWorkingDays) * 100
            : 0,
      },
      timeStats: {
        totalLateMinutes,
        totalOvertimeMinutes,
        totalWorkMinutes,
        averageWorkMinutes:
          attendanceRecords.length > 0
            ? totalWorkMinutes / attendanceRecords.length
            : 0,
      },
      byStatus: stats.reduce((acc, s) => {
        acc[s.status] = s._count.status;
        return acc;
      }, {} as Record<string, number>),
      records: attendanceRecords,
    };
  }

  async markAbsentees(date: Date = new Date()): Promise<number> {
    const dateString = this.getDateString(date);
    const dateObj = new Date(dateString);

    // Get all active employees
    const activeEmployees = await this.prisma.employee.findMany({
      where: {
        employmentStatus: 'active',
      },
      select: {
        id: true,
      },
    });

    // Get employees who already have attendance records
    const existingAttendance = await this.prisma.attendance.findMany({
      where: {
        date: dateObj,
      },
      select: {
        employeeId: true,
      },
    });

    const existingEmployeeIds = new Set(existingAttendance.map((a) => a.employeeId));

    // Create absent records for employees without attendance
    const absentEmployees = activeEmployees.filter(
      (e) => !existingEmployeeIds.has(e.id),
    );

    if (absentEmployees.length > 0) {
      await this.prisma.attendance.createMany({
        data: absentEmployees.map((e) => ({
          employeeId: e.id,
          date: dateObj,
          status: 'absent',
        })),
        skipDuplicates: true,
      });

      this.logger.log(
        `Marked ${absentEmployees.length} employees as absent for ${dateString}`,
      );
    }

    return absentEmployees.length;
  }

  async getTodayStats() {
    const today = this.getDateString(new Date());
    const todayDate = new Date(today);

    // First mark absentees for today
    await this.markAbsentees();

    const stats = await this.prisma.attendance.groupBy({
      by: ['status'],
      where: {
        date: todayDate,
      },
      _count: {
        status: true,
      },
    });

    const presentToday = stats.find((s) => s.status === 'present')?._count.status || 0;
    const absentToday = stats.find((s) => s.status === 'absent')?._count.status || 0;
    const lateToday = stats.find((s) => s.status === 'late')?._count.status || 0;
    const halfDayToday = stats.find((s) => s.status === 'half-day')?._count.status || 0;

    // Calculate on leave (employees with approved leave for today)
    const onLeaveToday = await this.prisma.leaveRequest.count({
      where: {
        status: 'approved',
        startDate: {
          lte: todayDate,
        },
        endDate: {
          gte: todayDate,
        },
      },
    });

    const result = {
      presentToday,
      absentToday,
      lateToday,
      halfDayToday,
      onLeaveToday,
      date: today,
    };

    this.logger.log(`Today stats: ${JSON.stringify(result)}`);
    return result;
  }

  async getMyAttendance(userId: string, startDate?: string, endDate?: string) {
    // Get employee ID from user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user?.employee) {
      throw new NotFoundException('Employee not found for this user');
    }

    const where: any = {
      employeeId: user.employee.id,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const attendance = await this.prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    return attendance;
  }
}
