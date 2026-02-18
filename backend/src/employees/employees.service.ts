import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(private readonly prisma: PrismaService) { }

  async create(createEmployeeDto: CreateEmployeeDto) {
    const {
      employeeCode,
      email,
      departmentId,
      managerId,
      dateOfJoining,
      ...rest
    } = createEmployeeDto;

    // Check if employee code exists
    const existingCode = await this.prisma.employee.findUnique({
      where: { employeeCode },
    });
    if (existingCode) {
      throw new ConflictException(
        `Employee with code ${employeeCode} already exists`,
      );
    }

    // Check if email exists
    const existingEmail = await this.prisma.employee.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException(`Employee with email ${email} already exists`);
    }

    // Validate department if provided
    if (departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: departmentId },
      });
      if (!department) {
        throw new BadRequestException('Invalid department ID');
      }
    }

    // Validate manager if provided
    if (managerId) {
      const manager = await this.prisma.employee.findUnique({
        where: { id: managerId },
      });
      if (!manager) {
        throw new BadRequestException('Invalid manager ID');
      }
    }

    const employee = await this.prisma.employee.create({
      data: {
        employeeCode,
        email,
        departmentId,
        managerId,
        dateOfJoining: new Date(dateOfJoining),
        ...rest,
      },
      include: {
        department: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    this.logger.log(`Employee created: ${employeeCode}`);

    return employee;
  }

  async findAll(
    params: {
      skip?: number;
      take?: number;
      departmentId?: string;
      managerId?: string;
      employmentStatus?: string;
      search?: string;
    },
    user?: any,
  ) {
    const { skip = 0, take = 10, departmentId, managerId, employmentStatus, search } = params;

    const where: any = {};

    // Role-based visibility enforcement
    if (user) {
      if (user.roleName === 'employee') {
        // Employees can only see themselves
        // Note: For a directory view, this might be too restrictive. 
        // If the requirement is "Data Visibility" in terms of "Management", this is correct.
        // If it's a "Company Directory", then employees should see basic info of everyone.
        // Based on "RBAC data visibility", usually implies restricted access to sensitive data or operations.
        // However, standard employees usually need to see their colleagues. 
        // Let's assume strict visibility for now as per "respective roles" request.
        // Actually, usually employees *can* see the directory. 
        // But the prompt said "implement data visibility to the respective roles" and specifically mentioned limitations.
        // Let's stick to the plan: Employee -> Self only.
        where.id = user.employeeId;
      } else if (user.roleName === 'manager') {
        // Managers can see their department/team
        const manager = await this.prisma.employee.findUnique({
          where: { id: user.employeeId },
          select: { departmentId: true },
        });

        if (manager?.departmentId) {
          where.departmentId = manager.departmentId;
        } else {
          // Fallback to direct reports if no department assigned
          where.OR = [
            { managerId: user.employeeId },
            { id: user.employeeId }
          ];
        }
      }
      // Admin / HR Manager -> No extra filters (can see all)
    }

    if (departmentId) where.departmentId = departmentId;
    if (managerId) where.managerId = managerId;
    if (employmentStatus) where.employmentStatus = employmentStatus;
    if (search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { employeeCode: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take,
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              isActive: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      data: employees,
      meta: {
        page: Math.floor(skip / take) + 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            email: true,
          },
        },
        subordinates: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async findByEmployeeCode(employeeCode: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { employeeCode },
      include: {
        department: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee with code ${employeeCode} not found`,
      );
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    // Check email uniqueness if updating
    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const existingEmail = await this.prisma.employee.findUnique({
        where: { email: updateEmployeeDto.email },
      });
      if (existingEmail) {
        throw new ConflictException(
          `Employee with email ${updateEmployeeDto.email} already exists`,
        );
      }
    }

    // Validate department if provided
    if (updateEmployeeDto.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: updateEmployeeDto.departmentId },
      });
      if (!department) {
        throw new BadRequestException('Invalid department ID');
      }
    }

    // Validate manager if provided
    if (updateEmployeeDto.managerId) {
      if (updateEmployeeDto.managerId === id) {
        throw new BadRequestException('Employee cannot be their own manager');
      }

      const manager = await this.prisma.employee.findUnique({
        where: { id: updateEmployeeDto.managerId },
      });
      if (!manager) {
        throw new BadRequestException('Invalid manager ID');
      }
    }

    const updatedEmployee = await this.prisma.employee.update({
      where: { id },
      data: {
        ...updateEmployeeDto,
        dateOfJoining: updateEmployeeDto.dateOfJoining
          ? new Date(updateEmployeeDto.dateOfJoining)
          : undefined,
      },
      include: {
        department: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    this.logger.log(`Employee updated: ${id}`);

    return updatedEmployee;
  }

  async remove(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            leaveRequests: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    // Check if employee has related records
    // Note: In a production system, you might want to check payroll records too

    // Soft delete by updating status
    await this.prisma.employee.update({
      where: { id },
      data: {
        employmentStatus: 'terminated',
      },
    });

    // Deactivate associated user account
    if (employee.user) {
      await this.prisma.user.update({
        where: { employeeId: id },
        data: { isActive: false },
      });
    }

    this.logger.log(`Employee terminated: ${id}`);

    return { message: 'Employee terminated successfully' };
  }

  async assignManager(employeeId: string, managerId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    if (employeeId === managerId) {
      throw new BadRequestException('Employee cannot be their own manager');
    }

    const manager = await this.prisma.employee.findUnique({
      where: { id: managerId },
    });

    if (!manager) {
      throw new NotFoundException(`Manager with ID ${managerId} not found`);
    }

    const updatedEmployee = await this.prisma.employee.update({
      where: { id: employeeId },
      data: { managerId },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    this.logger.log(`Manager ${managerId} assigned to employee ${employeeId}`);

    return updatedEmployee;
  }

  async getHierarchy(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        manager: {
          include: {
            manager: {
              include: {
                manager: true,
              },
            },
          },
        },
        subordinates: {
          include: {
            subordinates: {
              include: {
                subordinates: true,
              },
            },
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    return employee;
  }

  async getTeamMembers(managerId: string) {
    const manager = await this.prisma.employee.findUnique({
      where: { id: managerId },
    });

    if (!manager) {
      throw new NotFoundException(`Manager with ID ${managerId} not found`);
    }

    const teamMembers = await this.prisma.employee.findMany({
      where: { managerId },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      manager: {
        id: manager.id,
        firstName: manager.firstName,
        lastName: manager.lastName,
        employeeCode: manager.employeeCode,
      },
      teamMembers,
      totalMembers: teamMembers.length,
    };
  }

  async getStatistics() {
    const [
      totalEmployees,
      activeEmployees,
      byDepartment,
      byStatus,
    ] = await Promise.all([
      this.prisma.employee.count(),
      this.prisma.employee.count({
        where: { employmentStatus: 'active' },
      }),
      this.prisma.employee.groupBy({
        by: ['departmentId'],
        _count: { id: true },
      }),
      this.prisma.employee.groupBy({
        by: ['employmentStatus'],
        _count: { id: true },
      }),
    ]);

    return {
      total: totalEmployees,
      active: activeEmployees,
      inactive: totalEmployees - activeEmployees,
      byDepartment,
      byStatus,
    };
  }
}
