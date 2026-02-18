import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { Decimal } from '@prisma/client-runtime-utils';
import * as puppeteer from 'puppeteer';

@Injectable()
export class RecruitmentService {
  private readonly logger = new Logger(RecruitmentService.name);

  constructor(private readonly prisma: PrismaService) { }

  // ============ Job Methods ============

  async createJob(createDto: CreateJobDto) {
    if (createDto.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: createDto.departmentId },
      });
      if (!department) {
        throw new BadRequestException('Invalid department ID');
      }
    }

    const job = await this.prisma.job.create({
      data: {
        title: createDto.title,
        description: createDto.description,
        departmentId: createDto.departmentId,
        requirements: createDto.requirements,
        location: createDto.location,
        employmentType: createDto.employmentType,
        minSalary: createDto.minSalary ? new Decimal(createDto.minSalary) : null,
        maxSalary: createDto.maxSalary ? new Decimal(createDto.maxSalary) : null,
        openings: createDto.openings ?? 1,
        status: 'draft',
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    this.logger.log(`Job created: ${job.id} - ${job.title}`);
    return job;
  }

  async findAllJobs(params: { status?: string; departmentId?: string }) {
    const { status, departmentId } = params;

    const where: any = {};
    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;

    return this.prisma.job.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { candidates: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findJobById(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        candidates: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            stage: true,
            appliedAt: true,
          },
          orderBy: { appliedAt: 'desc' },
        },
        _count: {
          select: { candidates: true },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return job;
  }

  async publishJob(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    if (job.status !== 'draft') {
      throw new BadRequestException('Can only publish draft jobs');
    }

    const updated = await this.prisma.job.update({
      where: { id },
      data: {
        status: 'open',
        postedAt: new Date(),
      },
    });

    this.logger.log(`Job published: ${id}`);
    return updated;
  }

  async closeJob(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    if (job.status !== 'open') {
      throw new BadRequestException('Can only close open jobs');
    }

    const updated = await this.prisma.job.update({
      where: { id },
      data: {
        status: 'closed',
        closedAt: new Date(),
      },
    });

    this.logger.log(`Job closed: ${id}`);
    return updated;
  }

  async deleteJob(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        _count: {
          select: { candidates: true },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    if (job._count.candidates > 0) {
      throw new BadRequestException('Cannot delete job with candidates');
    }

    await this.prisma.job.delete({
      where: { id },
    });

    this.logger.log(`Job deleted: ${id}`);
    return { message: 'Job deleted successfully' };
  }

  // ============ Candidate Methods ============

  async createCandidate(createDto: CreateCandidateDto) {
    const job = await this.prisma.job.findUnique({
      where: { id: createDto.jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${createDto.jobId} not found`);
    }

    if (job.status !== 'open') {
      throw new BadRequestException('Can only apply to open jobs');
    }

    // Check if candidate already applied
    const existing = await this.prisma.candidate.findFirst({
      where: {
        jobId: createDto.jobId,
        email: createDto.email,
      },
    });

    if (existing) {
      throw new ConflictException('You have already applied for this job');
    }

    const candidate = await this.prisma.candidate.create({
      data: {
        jobId: createDto.jobId,
        firstName: createDto.firstName,
        lastName: createDto.lastName,
        email: createDto.email,
        phone: createDto.phone,
        resumeUrl: createDto.resumeUrl,
        coverLetter: createDto.coverLetter,
        source: createDto.source,
        notes: createDto.notes,
        stage: 'applied',
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    this.logger.log(`Candidate created: ${candidate.id} for job ${createDto.jobId}`);
    return candidate;
  }

  async findAllCandidates(params: {
    jobId?: string;
    stage?: string;
    skip?: number;
    take?: number;
  }) {
    const { jobId, stage, skip = 0, take = 20 } = params;

    const where: any = {};
    if (jobId) where.jobId = jobId;
    if (stage) where.stage = stage;

    const [candidates, total] = await Promise.all([
      this.prisma.candidate.findMany({
        where,
        skip,
        take,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
      }),
      this.prisma.candidate.count({ where }),
    ]);

    return {
      data: candidates,
      meta: {
        page: Math.floor(skip / take) + 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findCandidateById(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
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

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }

    return candidate;
  }

  async moveCandidateStage(id: string, stage: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }

    const validStages = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];
    if (!validStages.includes(stage)) {
      throw new BadRequestException(`Invalid stage. Valid stages are: ${validStages.join(', ')}`);
    }

    const updated = await this.prisma.candidate.update({
      where: { id },
      data: { stage },
    });

    this.logger.log(`Candidate ${id} moved to stage: ${stage}`);
    return updated;
  }

  async convertToEmployee(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }

    if (candidate.stage !== 'offer') {
      throw new BadRequestException('Can only convert candidates with offer stage to employees');
    }

    // Generate employee code
    const employeeCount = await this.prisma.employee.count();
    const employeeCode = `EMP${String(employeeCount + 1).padStart(5, '0')}`;

    // Create employee
    const employee = await this.prisma.employee.create({
      data: {
        employeeCode,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone,
        departmentId: candidate.job.departmentId,
        designation: candidate.job.title,
        dateOfJoining: new Date(),
        employmentStatus: 'active',
      },
    });

    // Update candidate stage
    await this.prisma.candidate.update({
      where: { id },
      data: { stage: 'hired' },
    });

    this.logger.log(`Candidate ${id} converted to employee ${employee.id}`);
    return employee;
  }

  async deleteCandidate(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }

    await this.prisma.candidate.delete({
      where: { id },
    });

    this.logger.log(`Candidate deleted: ${id}`);
    return { message: 'Candidate deleted successfully' };
  }

  // ============ Recruitment Analytics ============

  async getRecruitmentSummary() {
    const totalJobs = await this.prisma.job.count();
    const openJobs = await this.prisma.job.count({ where: { status: 'open' } });
    const totalCandidates = await this.prisma.candidate.count();

    const candidatesByStage = await this.prisma.candidate.groupBy({
      by: ['stage'],
      _count: true,
    });

    const hiredThisMonth = await this.prisma.candidate.count({
      where: {
        stage: 'hired',
        appliedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    return {
      totalJobs,
      openJobs,
      totalCandidates,
      candidatesByStage: candidatesByStage.reduce((acc: Record<string, number>, item: { stage: string; _count: number }) => {
        acc[item.stage] = item._count;
        return acc;
      }, {} as Record<string, number>),
      hiredThisMonth,


    };
  }

  // ============ Interview Methods ============

  async scheduleInterview(data: { candidateId: string; interviewerId: string; scheduledAt: string; type: string }) {
    console.log('Service: Scheduling interview...', data); // DEBUG
    const candidate = await this.prisma.candidate.findUnique({ where: { id: data.candidateId } });
    if (!candidate) {
      console.error('Service: Candidate not found', data.candidateId); // DEBUG
      throw new NotFoundException('Candidate not found');
    }

    const interviewer = await this.prisma.employee.findUnique({ where: { id: data.interviewerId } });
    if (!interviewer) {
      console.error('Service: Interviewer not found', data.interviewerId); // DEBUG
      throw new NotFoundException('Interviewer not found');
    }

    const interview = await this.prisma.interview.create({
      data: {
        candidateId: data.candidateId,
        interviewerId: data.interviewerId,
        scheduledAt: new Date(data.scheduledAt),
        type: data.type,
      },
      include: {
        candidate: true,
        interviewer: true,
      },
    });

    // Move candidate to interview stage
    await this.prisma.candidate.update({
      where: { id: data.candidateId },
      data: { stage: 'interview' },
    });

    this.logger.log(`Interview scheduled for candidate ${data.candidateId} with ${data.interviewerId}`);
    return interview;
  }

  async updateInterview(id: string, data: { status?: string; feedback?: string; score?: number }) {
    const interview = await this.prisma.interview.findUnique({ where: { id } });
    if (!interview) throw new NotFoundException('Interview not found');

    const updated = await this.prisma.interview.update({
      where: { id },
      data: {
        status: data.status,
        feedback: data.feedback,
        score: data.score,
      },
    });

    return updated;
  }

  async getInterviews(candidateId?: string) {
    return this.prisma.interview.findMany({
      where: candidateId ? { candidateId } : undefined,
      include: {
        candidate: true,
        interviewer: true,
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  // ============ Offer Letter ============

  async generateOfferLetter(candidateId: string): Promise<Buffer> {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        job: {
          include: { department: true }
        }
      },
    });

    if (!candidate) throw new NotFoundException('Candidate not found');

    // Simple Offer Letter Template
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 40px; line-height: 1.6;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1>OFFER LETTER</h1>
            <h3>Akkurate</h3>
          </div>
          
          <p>Date: ${new Date().toLocaleDateString()}</p>
          <br/>
          <p>Dear <strong>${candidate.firstName} ${candidate.lastName}</strong>,</p>
          
          <p>We are pleased to offer you the position of <strong>${candidate.job.title}</strong> at Akkurate.</p>
          
          <p>Based on your interviews and experience, we believe you will be a valuable asset to our team.
          Your starting date will be communicated shortly upon acceptance of this offer.</p>
          
          <p><strong>Offer Details:</strong></p>
          <ul>
            <li><strong>Position:</strong> ${candidate.job.title}</li>
            <li><strong>Department:</strong> ${candidate.job.department?.name || 'General'}</li>
            <li><strong>Employment Type:</strong> ${candidate.job.employmentType || 'Full-time'}</li>
          </ul>

          <p>We look forward to welcoming you to the team!</p>
          
          <br/>
          <p>Sincerely,</p>
          <p>HR Department<br/>Akkurate</p>
        </body>
      </html>
    `;

    try {
      console.log('Service: Launching Puppeteer...'); // DEBUG
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
    } catch (error: any) {
      console.error('Service: Error generating offer letter', error); // DEBUG
      throw new Error('Failed to generate offer letter: ' + error.message);
    }
  }
}
