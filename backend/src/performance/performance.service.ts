import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { CreatePerformanceReviewDto } from './dto/create-performance-review.dto';
import { Decimal } from '@prisma/client-runtime-utils';

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);

  constructor(private readonly prisma: PrismaService) { }

  // ============ Goal Methods ============

  async createGoal(createDto: CreateGoalDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: createDto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${createDto.employeeId} not found`);
    }

    const goal = await this.prisma.goal.create({
      data: {
        employeeId: createDto.employeeId,
        title: createDto.title,
        description: createDto.description,
        targetValue: new Decimal(createDto.targetValue),
        achievedValue: new Decimal(createDto.achievedValue ?? 0),
        weightage: createDto.weightage ?? 1,
        status: 'pending',
        startDate: new Date(createDto.startDate),
        endDate: new Date(createDto.endDate),
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    this.logger.log(`Goal created: ${goal.id} for employee ${createDto.employeeId}`);
    return goal;
  }

  async findAllGoals(params: {
    employeeId?: string;
    status?: string;
    skip?: number;
    take?: number;
  }) {
    const { employeeId, status, skip = 0, take = 20 } = params;

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const [goals, total] = await Promise.all([
      this.prisma.goal.findMany({
        where,
        skip,
        take,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.goal.count({ where }),
    ]);

    return {
      data: goals,
      meta: {
        page: Math.floor(skip / take) + 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findGoalById(id: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
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

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    return goal;
  }

  async updateGoalProgress(id: string, achievedValue: number) {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    // Determine status based on progress
    let status = goal.status;
    const progress = (achievedValue / Number(goal.targetValue)) * 100;

    if (goal.status === 'pending' && achievedValue > 0) {
      status = 'in-progress';
    }
    if (progress >= 100) {
      status = 'completed';
    }

    const updated = await this.prisma.goal.update({
      where: { id },
      data: {
        achievedValue: new Decimal(achievedValue),
        status,
      },
    });

    this.logger.log(`Goal progress updated: ${id} - ${achievedValue}/${goal.targetValue}`);
    return updated;
  }

  async updateGoalStatus(id: string, status: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Valid statuses are: ${validStatuses.join(', ')}`);
    }

    const updated = await this.prisma.goal.update({
      where: { id },
      data: { status },
    });

    this.logger.log(`Goal status updated: ${id} - ${status}`);
    return updated;
  }

  async deleteGoal(id: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    await this.prisma.goal.delete({
      where: { id },
    });

    this.logger.log(`Goal deleted: ${id}`);
    return { message: 'Goal deleted successfully' };
  }

  // ============ Performance Review Methods ============

  async createPerformanceReview(createDto: CreatePerformanceReviewDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: createDto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${createDto.employeeId} not found`);
    }

    const reviewer = await this.prisma.employee.findUnique({
      where: { id: createDto.reviewerId },
    });

    if (!reviewer) {
      throw new NotFoundException(`Reviewer with ID ${createDto.reviewerId} not found`);
    }

    // Check if review already exists for this period
    const existing = await this.prisma.performanceReview.findUnique({
      where: {
        employeeId_reviewPeriod: {
          employeeId: createDto.employeeId,
          reviewPeriod: createDto.reviewPeriod,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Performance review already exists for employee ${createDto.employeeId} for period ${createDto.reviewPeriod}`,
      );
    }

    const review = await this.prisma.performanceReview.create({
      data: {
        employeeId: createDto.employeeId,
        reviewerId: createDto.reviewerId,
        reviewPeriod: createDto.reviewPeriod,
        rating: new Decimal(createDto.rating),
        comments: createDto.comments,
        strengths: createDto.strengths,
        improvements: createDto.improvements,
        status: 'draft',
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    this.logger.log(`Performance review created: ${review.id}`);
    return review;
  }

  async findAllPerformanceReviews(params: {
    employeeId?: string;
    reviewerId?: string;
    status?: string;
    skip?: number;
    take?: number;
  }) {
    const { employeeId, reviewerId, status, skip = 0, take = 20 } = params;

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (reviewerId) where.reviewerId = reviewerId;
    if (status) where.status = status;

    const [reviews, total] = await Promise.all([
      this.prisma.performanceReview.findMany({
        where,
        skip,
        take,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.performanceReview.count({ where }),
    ]);

    return {
      data: reviews,
      meta: {
        page: Math.floor(skip / take) + 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findPerformanceReviewById(id: string) {
    const review = await this.prisma.performanceReview.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            email: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            email: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException(`Performance review with ID ${id} not found`);
    }

    return review;
  }

  async submitPerformanceReview(id: string) {
    const review = await this.prisma.performanceReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Performance review with ID ${id} not found`);
    }

    if (review.status !== 'draft') {
      throw new BadRequestException('Can only submit draft reviews');
    }

    const updated = await this.prisma.performanceReview.update({
      where: { id },
      data: {
        status: 'submitted',
        reviewDate: new Date(),
      },
    });

    this.logger.log(`Performance review submitted: ${id}`);
    return updated;
  }

  async acknowledgePerformanceReview(id: string) {
    const review = await this.prisma.performanceReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Performance review with ID ${id} not found`);
    }

    if (review.status !== 'submitted') {
      throw new BadRequestException('Can only acknowledge submitted reviews');
    }

    const updated = await this.prisma.performanceReview.update({
      where: { id },
      data: { status: 'acknowledged' },
    });

    this.logger.log(`Performance review acknowledged: ${id}`);
    return updated;
  }

  // ============ Performance Summary ============

  async getEmployeePerformanceSummary(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    // Get goals summary
    const goals = await this.prisma.goal.findMany({
      where: { employeeId },
    });

    const goalsSummary = {
      total: goals.length,
      completed: goals.filter((g) => g.status === 'completed').length,
      inProgress: goals.filter((g) => g.status === 'in-progress').length,
      pending: goals.filter((g) => g.status === 'pending').length,
      cancelled: goals.filter((g) => g.status === 'cancelled').length,
      averageProgress: goals.length > 0
        ? goals.reduce((sum, g) => sum + (Number(g.achievedValue) / Number(g.targetValue)) * 100, 0) / goals.length
        : 0,
    };

    // Get reviews summary
    const reviews = await this.prisma.performanceReview.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const reviewsSummary = {
      total: await this.prisma.performanceReview.count({ where: { employeeId } }),
      averageRating: reviews.length > 0
        ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
        : 0,
      latestReviews: reviews,
    };

    return {
      employee: {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        employeeCode: employee.employeeCode,
      },
      goals: goalsSummary,
      reviews: reviewsSummary,
    };
  }

  // ============ 360 Feedback Methods ============

  async createFeedbackRequest(createDto: any) {
    const request = await this.prisma.feedbackRequest.create({
      data: {
        employeeId: createDto.employeeId,
        requesterId: createDto.requesterId,
        reviewerId: createDto.reviewerId,
        message: createDto.message,
        status: 'pending',
      },
      include: {
        reviewer: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });
    return request;
  }

  async submitFeedback(id: string, submitDto: any) {
    return this.prisma.feedbackRequest.update({
      where: { id },
      data: {
        rating: submitDto.rating,
        comments: submitDto.comments,
        status: 'completed',
      },
    });
  }

  async findAllFeedback(params: { employeeId?: string; reviewerId?: string }) {
    return this.prisma.feedbackRequest.findMany({
      where: {
        ...(params.employeeId && { employeeId: params.employeeId }),
        ...(params.reviewerId && { reviewerId: params.reviewerId }),
      },
      include: {
        employee: { select: { firstName: true, lastName: true } },
        reviewer: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============ Promotion & Increment Methods ============

  async createPromotion(createDto: any) {
    const promotion = await this.prisma.promotionHistory.create({
      data: {
        employeeId: createDto.employeeId,
        oldDesignation: createDto.oldDesignation,
        newDesignation: createDto.newDesignation,
        oldSalary: createDto.oldSalary,
        newSalary: createDto.newSalary,
        effectiveDate: new Date(createDto.effectiveDate),
        notes: createDto.notes,
      },
    });

    // Update employee designation and salary structure if provided
    await this.prisma.employee.update({
      where: { id: createDto.employeeId },
      data: {
        designation: createDto.newDesignation,
      },
    });

    return promotion;
  }

  async findAllPromotions(employeeId: string) {
    return this.prisma.promotionHistory.findMany({
      where: { employeeId },
      orderBy: { effectiveDate: 'desc' },
    });
  }
}
