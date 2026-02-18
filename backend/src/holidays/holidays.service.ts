import {
    Injectable,
    NotFoundException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

@Injectable()
export class HolidaysService {
    private readonly logger = new Logger(HolidaysService.name);

    constructor(private readonly prisma: PrismaService) { }

    async create(createHolidayDto: CreateHolidayDto) {
        const { date, name } = createHolidayDto;

        // Check if holiday exists on this date with same name
        const existing = await this.prisma.holiday.findUnique({
            where: { date_name: { date: new Date(date), name } },
        });

        if (existing) {
            throw new ConflictException(`Holiday "${name}" on this date already exists`);
        }

        const holiday = await this.prisma.holiday.create({
            data: {
                name: createHolidayDto.name,
                date: new Date(createHolidayDto.date),
                description: createHolidayDto.description,
                isRecurring: createHolidayDto.isRecurring ?? false,
            },
        });

        this.logger.log(`Holiday created: ${name} on ${date}`);
        return holiday;
    }

    async findAll(year?: number) {
        const where: any = {};

        if (year) {
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31);
            where.date = {
                gte: startDate,
                lte: endDate,
            };
        }

        return this.prisma.holiday.findMany({
            where,
            orderBy: { date: 'asc' },
        });
    }

    async findOne(id: string) {
        const holiday = await this.prisma.holiday.findUnique({
            where: { id },
        });

        if (!holiday) {
            throw new NotFoundException(`Holiday with ID ${id} not found`);
        }

        return holiday;
    }

    async update(id: string, updateHolidayDto: UpdateHolidayDto) {
        const holiday = await this.prisma.holiday.findUnique({
            where: { id },
        });

        if (!holiday) {
            throw new NotFoundException(`Holiday with ID ${id} not found`);
        }

        const updatedHoliday = await this.prisma.holiday.update({
            where: { id },
            data: {
                ...updateHolidayDto,
                date: updateHolidayDto.date ? new Date(updateHolidayDto.date) : undefined,
            },
        });

        this.logger.log(`Holiday updated: ${id}`);
        return updatedHoliday;
    }

    async remove(id: string) {
        const holiday = await this.prisma.holiday.findUnique({
            where: { id },
        });

        if (!holiday) {
            throw new NotFoundException(`Holiday with ID ${id} not found`);
        }

        await this.prisma.holiday.delete({
            where: { id },
        });

        this.logger.log(`Holiday deleted: ${id}`);
        return { message: 'Holiday deleted successfully' };
    }

    async isHoliday(date: Date): Promise<boolean> {
        const holiday = await this.prisma.holiday.findFirst({
            where: {
                date: {
                    equals: date,
                },
            },
        });
        // TODO: Handle recurring holidays logic here if needed (ignoring year)
        return !!holiday;
    }
}
