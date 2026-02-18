import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============ Approval Methods ============

  async createApproval(data: {
    entityType: string;
    entityId: string;
    requesterId: string;
    approverIds: string[];
    comments?: string;
  }) {
    // Check if approval already exists
    const existing = await this.prisma.approval.findUnique({
      where: {
        entityType_entityId: {
          entityType: data.entityType,
          entityId: data.entityId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Approval already exists for this entity');
    }

    // Validate approvers
    for (const approverId of data.approverIds) {
      const approver = await this.prisma.employee.findUnique({
        where: { id: approverId },
      });
      if (!approver) {
        throw new NotFoundException(`Approver with ID ${approverId} not found`);
      }
    }

    const approval = await this.prisma.approval.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        requesterId: data.requesterId,
        totalSteps: data.approverIds.length,
        comments: data.comments,
        status: 'pending',
        steps: {
          create: data.approverIds.map((approverId, index) => ({
            stepNumber: index + 1,
            approverId,
            status: 'pending',
          })),
        },
      },
      include: {
        steps: {
          include: {
            approver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeCode: true,
              },
            },
          },
        },
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    this.logger.log(`Approval created: ${approval.id} for ${data.entityType}:${data.entityId}`);
    return approval;
  }

  async findAllApprovals(params: {
    requesterId?: string;
    approverId?: string;
    status?: string;
    entityType?: string;
    skip?: number;
    take?: number;
  }) {
    const { requesterId, approverId, status, entityType, skip = 0, take = 20 } = params;

    const where: any = {};
    if (requesterId) where.requesterId = requesterId;
    if (status) where.status = status;
    if (entityType) where.entityType = entityType;

    if (approverId) {
      where.steps = {
        some: { approverId },
      };
    }

    const [approvals, total] = await Promise.all([
      this.prisma.approval.findMany({
        where,
        skip,
        take,
        include: {
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
          steps: {
            include: {
              approver: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  employeeCode: true,
                },
              },
            },
            orderBy: { stepNumber: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.approval.count({ where }),
    ]);

    return {
      data: approvals,
      meta: {
        page: Math.floor(skip / take) + 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findApprovalById(id: string) {
    const approval = await this.prisma.approval.findUnique({
      where: { id },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
        steps: {
          include: {
            approver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeCode: true,
                email: true,
              },
            },
          },
          orderBy: { stepNumber: 'asc' },
        },
      },
    });

    if (!approval) {
      throw new NotFoundException(`Approval with ID ${id} not found`);
    }

    return approval;
  }

  async approveStep(approvalId: string, approverId: string, comments?: string) {
    const approval = await this.prisma.approval.findUnique({
      where: { id: approvalId },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
      },
    });

    if (!approval) {
      throw new NotFoundException(`Approval with ID ${approvalId} not found`);
    }

    if (approval.status !== 'pending') {
      throw new BadRequestException('Approval is not in pending state');
    }

    // Find the current step
    const currentStep = approval.steps.find((s: { stepNumber: number }) => s.stepNumber === approval.currentStep);
    if (!currentStep) {
      throw new BadRequestException('No current step found');
    }

    // Verify the approver is the one assigned to this step
    if (currentStep.approverId !== approverId) {
      throw new ForbiddenException('You are not authorized to approve this step');
    }

    if (currentStep.status !== 'pending') {
      throw new BadRequestException('This step has already been processed');
    }

    // Update the step
    await this.prisma.approvalStep.update({
      where: { id: currentStep.id },
      data: {
        status: 'approved',
        comments,
        approvedAt: new Date(),
      },
    });

    // Check if all steps are approved
    if (approval.currentStep >= approval.totalSteps) {
      // All steps approved - mark approval as complete
      await this.prisma.approval.update({
        where: { id: approvalId },
        data: {
          status: 'approved',
          approverId,
          approvedAt: new Date(),
        },
      });

      this.logger.log(`Approval ${approvalId} fully approved`);
    } else {
      // Move to next step
      await this.prisma.approval.update({
        where: { id: approvalId },
        data: {
          currentStep: approval.currentStep + 1,
        },
      });

      this.logger.log(`Approval ${approvalId} step ${approval.currentStep} approved`);
    }

    return this.findApprovalById(approvalId);
  }

  async rejectApproval(approvalId: string, approverId: string, comments: string) {
    const approval = await this.prisma.approval.findUnique({
      where: { id: approvalId },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
      },
    });

    if (!approval) {
      throw new NotFoundException(`Approval with ID ${approvalId} not found`);
    }

    if (approval.status !== 'pending') {
      throw new BadRequestException('Approval is not in pending state');
    }

    // Find the current step
    const currentStep = approval.steps.find((s: { stepNumber: number }) => s.stepNumber === approval.currentStep);
    if (!currentStep) {
      throw new BadRequestException('No current step found');
    }

    // Verify the approver is the one assigned to this step
    if (currentStep.approverId !== approverId) {
      throw new ForbiddenException('You are not authorized to reject this step');
    }

    // Update the step
    await this.prisma.approvalStep.update({
      where: { id: currentStep.id },
      data: {
        status: 'rejected',
        comments,
        approvedAt: new Date(),
      },
    });

    // Mark approval as rejected
    await this.prisma.approval.update({
      where: { id: approvalId },
      data: {
        status: 'rejected',
        approverId,
        approvedAt: new Date(),
        comments,
      },
    });

    this.logger.log(`Approval ${approvalId} rejected by ${approverId}`);

    return this.findApprovalById(approvalId);
  }

  async getPendingApprovalsForUser(approverId: string) {
    if (!approverId) {
      this.logger.warn('getPendingApprovalsForUser called with null/empty approverId');
      return [];
    }
    const approvals = await this.prisma.approval.findMany({
      where: {
        status: 'pending',
        steps: {
          some: {
            approverId,
            status: 'pending',
          },
        },
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
        steps: {
          where: { approverId },
          select: {
            stepNumber: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return approvals;
  }

  async getApprovalHistory(entityType: string, entityId: string) {
    return this.prisma.approval.findUnique({
      where: {
        entityType_entityId: {
          entityType,
          entityId,
        },
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
        steps: {
          include: {
            approver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeCode: true,
              },
            },
          },
          orderBy: { stepNumber: 'asc' },
        },
      },
    });
  }

  async getApprovalStats(userId: string) {
    if (!userId) {
      this.logger.warn('getApprovalStats called with null/empty userId');
      return {
        pendingForMe: 0,
        myRequestsPending: 0,
        totalApproved: 0,
        totalRejected: 0,
        pendingTrend: { value: 0, isPositive: true },
        requestsTrend: { value: 0, isPositive: true },
        approvalRate: 0,
        rejectionRate: 0,
      };
    }
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Current period (last 7 days)
    const pendingForMe = await this.prisma.approval.count({
      where: {
        status: 'pending',
        steps: {
          some: {
            approverId: userId,
            status: 'pending',
          },
        },
      },
    });

    const myRequestsPending = await this.prisma.approval.count({
      where: {
        requesterId: userId,
        status: 'pending',
      },
    });

    const totalApproved = await this.prisma.approval.count({
      where: {
        status: 'approved',
      },
    });

    const totalRejected = await this.prisma.approval.count({
      where: {
        status: 'rejected',
      },
    });

    // Previous period (7-14 days ago) for trend calculation
    const previousPendingForMe = await this.prisma.approval.count({
      where: {
        status: 'pending',
        createdAt: {
          gte: fourteenDaysAgo,
          lt: sevenDaysAgo,
        },
        steps: {
          some: {
            approverId: userId,
            status: 'pending',
          },
        },
      },
    });

    const previousMyRequests = await this.prisma.approval.count({
      where: {
        requesterId: userId,
        status: 'pending',
        createdAt: {
          gte: fourteenDaysAgo,
          lt: sevenDaysAgo,
        },
      },
    });

    // Calculate trends
    const pendingTrend = this.calculateTrend(pendingForMe, previousPendingForMe);
    const requestsTrend = this.calculateTrend(myRequestsPending, previousMyRequests);

    // Calculate approval and rejection rates
    const totalProcessed = totalApproved + totalRejected;
    const approvalRate = totalProcessed > 0 ? Math.round((totalApproved / totalProcessed) * 100) : 0;
    const rejectionRate = totalProcessed > 0 ? Math.round((totalRejected / totalProcessed) * 100) : 0;

    return {
      pendingForMe,
      myRequestsPending,
      totalApproved,
      totalRejected,
      pendingTrend,
      requestsTrend,
      approvalRate,
      rejectionRate,
    };
  }

  private calculateTrend(current: number, previous: number): { value: number; isPositive: boolean } {
    if (previous === 0) {
      return { value: 0, isPositive: current >= 0 };
    }
    const percentChange = Math.round(((current - previous) / previous) * 100);
    return {
      value: Math.abs(percentChange),
      isPositive: percentChange >= 0,
    };
  }
}
