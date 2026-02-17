import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';

@Injectable()
export class LeaveService {
  private readonly logger = new Logger(LeaveService.name);

  constructor(private readonly prisma: PrismaService) { }

  // ============ Leave Type Methods ============

  async createLeaveType(createLeaveTypeDto: CreateLeaveTypeDto) {
    const { name } = createLeaveTypeDto;

    // Check if leave type exists
    const existing = await this.prisma.leaveType.findUnique({
      where: { name },
    });

    if (existing) {
      throw new ConflictException(`Leave type "${name}" already exists`);
    }

    const leaveType = await this.prisma.leaveType.create({
      data: createLeaveTypeDto,
    });

    this.logger.log(`Leave type created: ${name}`);

    return leaveType;
  }

  async findAllLeaveTypes() {
    return this.prisma.leaveType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findLeaveTypeById(id: string) {
    const leaveType = await this.prisma.leaveType.findUnique({
      where: { id },
    });

    if (!leaveType) {
      throw new NotFoundException(`Leave type with ID ${id} not found`);
    }

    return leaveType;
  }

  async updateLeaveType(id: string, updateLeaveTypeDto: UpdateLeaveTypeDto) {
    const leaveType = await this.prisma.leaveType.findUnique({
      where: { id },
    });

    if (!leaveType) {
      throw new NotFoundException(`Leave type with ID ${id} not found`);
    }

    // Check name uniqueness if updating
    if (updateLeaveTypeDto.name && updateLeaveTypeDto.name !== leaveType.name) {
      const existing = await this.prisma.leaveType.findUnique({
        where: { name: updateLeaveTypeDto.name },
      });
      if (existing) {
        throw new ConflictException(
          `Leave type "${updateLeaveTypeDto.name}" already exists`,
        );
      }
    }

    const updated = await this.prisma.leaveType.update({
      where: { id },
      data: updateLeaveTypeDto,
    });

    this.logger.log(`Leave type updated: ${id}`);

    return updated;
  }

  async deleteLeaveType(id: string) {
    const leaveType = await this.prisma.leaveType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            balances: true,
            requests: true,
          },
        },
      },
    });

    if (!leaveType) {
      throw new NotFoundException(`Leave type with ID ${id} not found`);
    }

    if (leaveType._count.balances > 0 || leaveType._count.requests > 0) {
      throw new BadRequestException(
        'Cannot delete leave type with existing balances or requests',
      );
    }

    await this.prisma.leaveType.delete({
      where: { id },
    });

    this.logger.log(`Leave type deleted: ${id}`);

    return { message: 'Leave type deleted successfully' };
  }

  // ============ Leave Request Methods ============

  private calculateLeaveDays(startDate: Date, endDate: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.floor(diffTime / oneDay) + 1;
  }

  async createLeaveRequest(
    employeeId: string,
    createLeaveRequestDto: CreateLeaveRequestDto,
  ) {
    const { leaveTypeId, startDate, endDate, reason } = createLeaveRequestDto;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (start > end) {
      throw new BadRequestException('Start date must be before end date');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      throw new BadRequestException('Cannot apply leave for past dates');
    }

    // Validate employee
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    // Validate leave type
    const leaveType = await this.prisma.leaveType.findUnique({
      where: { id: leaveTypeId },
    });

    if (!leaveType) {
      throw new NotFoundException(`Leave type with ID ${leaveTypeId} not found`);
    }

    if (!leaveType.isActive) {
      throw new BadRequestException('This leave type is not active');
    }

    // Calculate days
    const days = this.calculateLeaveDays(start, end);

    // Check for overlapping leave requests
    const overlapping = await this.prisma.leaveRequest.findFirst({
      where: {
        employeeId,
        status: { not: 'cancelled' },
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start },
          },
        ],
      },
    });

    if (overlapping) {
      throw new ConflictException(
        'You have an overlapping leave request for these dates',
      );
    }

    // Check leave balance
    const year = start.getFullYear();
    const balance = await this.getOrCreateBalance(employeeId, leaveTypeId, year);

    if (balance.remainingDays < days) {
      throw new BadRequestException(
        `Insufficient leave balance. Available: ${balance.remainingDays} days, Requested: ${days} days`,
      );
    }

    // Create leave request
    const leaveRequest = await this.prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveTypeId,
        startDate: start,
        endDate: end,
        days,
        reason,
        status: 'pending',
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
        leaveType: {
          select: {
            name: true,
          },
        },
      },
    });

    // Update pending days in balance
    await this.prisma.leaveBalance.update({
      where: { id: balance.id },
      data: {
        pendingDays: { increment: days },
      },
    });

    this.logger.log(`Leave request created for employee ${employeeId}`);

    return leaveRequest;
  }

  async findAllLeaveRequests(
    params: {
      skip?: number;
      take?: number;
      employeeId?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    },
    user?: any,
  ) {
    const { skip = 0, take = 10, employeeId, status, startDate, endDate } = params;

    const where: any = {};

    // Role-based visibility enforcement
    if (user) {
      if (user.roleName === 'employee') {
        // Employees can only see their own leave requests
        where.employeeId = user.employeeId;
      } else if (user.roleName === 'manager') {
        // Managers can see their own requests AND their team's requests
        where.OR = [
          { employeeId: user.employeeId },
          { employee: { managerId: user.employeeId } },
        ];
      }
      // Admin / HR Manager -> No extra filters
    }

    // Merge role-based `where` with query params `where`
    if (user?.roleName === 'employee') {
      where.employeeId = user.employeeId;
    } else if (user?.roleName === 'manager') {
      if (employeeId) {
        where.employeeId = employeeId;
        where.OR = [
          { employeeId: user.employeeId },
          { employee: { managerId: user.employeeId } },
        ];
      }
    } else {
      // Admin/HR
      if (employeeId) where.employeeId = employeeId;
    }

    if (status) where.status = status;
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = startDate;
      if (endDate) where.startDate.lte = endDate;
    }

    const [requests, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({
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
          leaveType: {
            select: {
              name: true,
            },
          },
          approver: {
            select: {
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.leaveRequest.count({ where }),
    ]);

    return {
      data: requests,
      meta: {
        page: Math.floor(skip / take) + 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findLeaveRequestById(id: string) {
    const request = await this.prisma.leaveRequest.findUnique({
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
        leaveType: true,
        approver: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }

    return request;
  }

  async approveLeaveRequest(
    requestId: string,
    approverId: string,
    rejectionReason?: string,
  ) {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException(`Leave request with ID ${requestId} not found`);
    }

    if (request.status !== 'pending') {
      throw new BadRequestException(
        `Leave request is already ${request.status}`,
      );
    }

    // Prevent self-approval
    if (request.employeeId === approverId) {
      throw new ForbiddenException('You cannot approve your own leave request');
    }

    const isApproval = !rejectionReason;
    const year = request.startDate.getFullYear();

    const updated = await this.prisma.$transaction(async (prisma) => {
      // Update leave request
      const updated = await prisma.leaveRequest.update({
        where: { id: requestId },
        data: {
          status: isApproval ? 'approved' : 'rejected',
          approvedBy: approverId,
          approvedAt: new Date(),
          rejectedReason: rejectionReason || null,
        },
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
          leaveType: {
            select: {
              name: true,
            },
          },
        },
      });

      // Update balance
      const balance = await prisma.leaveBalance.findFirst({
        where: {
          employeeId: request.employeeId,
          leaveTypeId: request.leaveTypeId,
          year,
        },
      });

      if (balance) {
        if (isApproval) {
          // Deduct from remaining and pending
          await prisma.leaveBalance.update({
            where: { id: balance.id },
            data: {
              remainingDays: { decrement: request.days },
              usedDays: { increment: request.days },
              pendingDays: { decrement: request.days },
            },
          });
        } else {
          // Just reduce pending
          await prisma.leaveBalance.update({
            where: { id: balance.id },
            data: {
              pendingDays: { decrement: request.days },
            },
          });
        }
      }

      return updated;
    });

    this.logger.log(
      `Leave request ${requestId} ${isApproval ? 'approved' : 'rejected'} by ${approverId}`,
    );

    return updated;
  }

  async cancelLeaveRequest(requestId: string, employeeId: string) {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException(`Leave request with ID ${requestId} not found`);
    }

    if (request.employeeId !== employeeId) {
      throw new ForbiddenException('You can only cancel your own leave requests');
    }

    if (request.status === 'cancelled') {
      throw new BadRequestException('Leave request is already cancelled');
    }

    const year = request.startDate.getFullYear();

    const updated = await this.prisma.$transaction(async (prisma) => {
      const updated = await prisma.leaveRequest.update({
        where: { id: requestId },
        data: {
          status: 'cancelled',
        },
      });

      // Restore balance if not already processed
      if (request.status === 'pending') {
        const balance = await prisma.leaveBalance.findFirst({
          where: {
            employeeId: request.employeeId,
            leaveTypeId: request.leaveTypeId,
            year,
          },
        });

        if (balance) {
          await prisma.leaveBalance.update({
            where: { id: balance.id },
            data: {
              pendingDays: { decrement: request.days },
            },
          });
        }
      }

      return updated;
    });

    this.logger.log(`Leave request ${requestId} cancelled`);

    return updated;
  }

  // ============ Leave Balance Methods ============

  private async getOrCreateBalance(
    employeeId: string,
    leaveTypeId: string,
    year: number,
  ) {
    let balance = await this.prisma.leaveBalance.findFirst({
      where: {
        employeeId,
        leaveTypeId,
        year,
      },
    });

    if (!balance) {
      const leaveType = await this.prisma.leaveType.findUnique({
        where: { id: leaveTypeId },
      });

      if (!leaveType) {
        throw new NotFoundException(`Leave type with ID ${leaveTypeId} not found`);
      }

      balance = await this.prisma.leaveBalance.create({
        data: {
          employeeId,
          leaveTypeId,
          year,
          totalDays: leaveType.annualLimit,
          remainingDays: leaveType.annualLimit,
          usedDays: 0,
          pendingDays: 0,
          carriedForward: 0,
        },
      });
    }

    return balance;
  }

  async getLeaveBalance(employeeId: string, year?: number) {
    const targetYear = year || new Date().getFullYear();

    const balances = await this.prisma.leaveBalance.findMany({
      where: {
        employeeId,
        year: targetYear,
      },
      include: {
        leaveType: {
          select: {
            name: true,
            description: true,
            annualLimit: true,
          },
        },
      },
    });

    return {
      employeeId,
      year: targetYear,
      balances,
    };
  }

  async getLeaveSummary(employeeId: string, year?: number) {
    const targetYear = year || new Date().getFullYear();

    const [requests, stats] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        where: {
          employeeId,
          startDate: {
            gte: new Date(targetYear, 0, 1),
            lte: new Date(targetYear, 11, 31),
          },
        },
        include: {
          leaveType: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { startDate: 'desc' },
      }),
      this.prisma.leaveRequest.groupBy({
        by: ['status'],
        where: {
          employeeId,
          startDate: {
            gte: new Date(targetYear, 0, 1),
            lte: new Date(targetYear, 11, 31),
          },
        },
        _sum: {
          days: true,
        },
      }),
    ]);

    return {
      employeeId,
      year: targetYear,
      requests,
      summary: stats.reduce((acc, s) => {
        acc[s.status] = s._sum.days || 0;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
