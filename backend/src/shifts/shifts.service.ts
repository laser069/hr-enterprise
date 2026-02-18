import {
    Injectable,
    NotFoundException,
    ConflictException,
    Logger,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Injectable()
export class ShiftsService {
    private readonly logger = new Logger(ShiftsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async create(createShiftDto: CreateShiftDto) {
        const { name } = createShiftDto;

        const existing = await this.prisma.shift.findUnique({
            where: { name },
        });

        if (existing) {
            throw new ConflictException(`Shift with name "${name}" already exists`);
        }

        // Validate time format (though DTO handles it, validation logic could go here)
        // Validate end time > start time if needed (though overnight shifts exist)

        const shift = await this.prisma.shift.create({
            data: {
                name: createShiftDto.name,
                startTime: createShiftDto.startTime,
                endTime: createShiftDto.endTime,
                breakDuration: createShiftDto.breakDuration ?? 60,
                workDays: createShiftDto.workDays,
                isActive: createShiftDto.isActive ?? true,
            },
        });

        this.logger.log(`Shift created: ${shift.name}`);
        return shift;
    }

    async findAll(params: { isActive?: boolean } = {}) {
        const where: any = {};
        if (params.isActive !== undefined) {
            where.isActive = params.isActive;
        }

        return this.prisma.shift.findMany({
            where,
            include: {
                _count: {
                    select: { employees: true },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        const shift = await this.prisma.shift.findUnique({
            where: { id },
            include: {
                employees: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeCode: true,
                    },
                },
            },
        });

        if (!shift) {
            throw new NotFoundException(`Shift with ID ${id} not found`);
        }

        return shift;
    }

    async update(id: string, updateShiftDto: UpdateShiftDto) {
        const shift = await this.prisma.shift.findUnique({
            where: { id },
        });

        if (!shift) {
            throw new NotFoundException(`Shift with ID ${id} not found`);
        }

        if (updateShiftDto.name && updateShiftDto.name !== shift.name) {
            const existing = await this.prisma.shift.findUnique({
                where: { name: updateShiftDto.name },
            });
            if (existing) {
                throw new ConflictException(`Shift with name "${updateShiftDto.name}" already exists`);
            }
        }

        const updatedShift = await this.prisma.shift.update({
            where: { id },
            data: updateShiftDto,
        });

        this.logger.log(`Shift updated: ${id}`);
        return updatedShift;
    }

    async remove(id: string) {
        const shift = await this.prisma.shift.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { employees: true },
                },
            },
        });

        if (!shift) {
            throw new NotFoundException(`Shift with ID ${id} not found`);
        }

        if (shift._count.employees > 0) {
            throw new BadRequestException('Cannot delete shift assigned to employees. Reassign them first.');
        }

        await this.prisma.shift.delete({
            where: { id },
        });

        this.logger.log(`Shift deleted: ${id}`);
        return { message: 'Shift deleted successfully' };
    }
}
