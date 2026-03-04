import { Controller, Post, Body, UseGuards, Logger, NotFoundException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { EnrollFaceDto } from './dto/enroll-face.dto';
import { PrismaService } from '../database/prisma.service';
import { JwtAuthGuard, PermissionsGuard } from '../common/guards';
import { Permissions } from '../common/decorators';

@Controller('biometric')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BiometricController {
    private readonly logger = new Logger(BiometricController.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly attendanceService: AttendanceService,
    ) { }

    @Post('enroll')
    @Permissions('employee:update')
    async enrollFace(@Body() enrollFaceDto: EnrollFaceDto) {
        const { employeeId, faceDescriptor } = enrollFaceDto;

        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
        });

        if (!employee) {
            throw new NotFoundException(`Employee with ID ${employeeId} not found`);
        }

        const updatedEmployee = await this.prisma.employee.update({
            where: { id: employeeId },
            data: {
                faceDescriptor: faceDescriptor as any,
            },
        });

        this.logger.log(`Face descriptor enrolled for employee ${employeeId}`);

        return {
            message: 'Face descriptor enrolled successfully',
            employeeId: updatedEmployee.id,
        };
    }
}
