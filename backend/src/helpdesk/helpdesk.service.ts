import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket.dto';
import { AddCommentDto } from './dto/add-comment.dto';

@Injectable()
export class HelpdeskService {
  private readonly logger = new Logger(HelpdeskService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createTicketDto: CreateTicketDto) {
    const ticket = await this.prisma.ticket.create({
      data: {
        ...createTicketDto,
        requesterId: userId,
        status: 'open',
      },
    });
    this.logger.log(`Ticket created: ${ticket.id} by user ${userId}`);
    return ticket;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    status?: string;
    priority?: string;
    category?: string;
    requesterId?: string;
    assignedTo?: string;
  }) {
    const { skip = 0, take = 10, status, priority, category, requesterId, assignedTo } = params;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (requesterId) where.requesterId = requesterId;
    if (assignedTo) where.assignedTo = assignedTo;

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take,
        include: {
          requester: {
            select: {
              id: true,
              email: true,
              employee: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          assignee: {
            select: {
              id: true,
              email: true,
              employee: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data: tickets,
      meta: {
        page: Math.floor(skip / take) + 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        requester: {
          select: {
            id: true,
            email: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                employee: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async updateStatus(id: string, updateTicketStatusDto: UpdateTicketStatusDto) {
    const ticket = await this.findOne(id);
    return this.prisma.ticket.update({
      where: { id },
      data: { status: updateTicketStatusDto.status },
    });
  }

  async assignTicket(id: string, assignedTo: string) {
    const ticket = await this.findOne(id);
    return this.prisma.ticket.update({
      where: { id },
      data: { assignedTo },
    });
  }

  async addComment(ticketId: string, userId: string, addCommentDto: AddCommentDto) {
    const ticket = await this.findOne(ticketId);
    const comment = await this.prisma.ticketComment.create({
      data: {
        ticketId,
        userId,
        content: addCommentDto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
    this.logger.log(`Comment added to ticket ${ticketId} by user ${userId}`);
    return comment;
  }

  async getStats() {
    const [open, inProgress, resolved, closed] = await Promise.all([
      this.prisma.ticket.count({ where: { status: 'open' } }),
      this.prisma.ticket.count({ where: { status: 'in_progress' } }),
      this.prisma.ticket.count({ where: { status: 'resolved' } }),
      this.prisma.ticket.count({ where: { status: 'closed' } }),
    ]);

    return {
      open,
      inProgress,
      resolved,
      closed,
      total: open + inProgress + resolved + closed,
    };
  }
}
