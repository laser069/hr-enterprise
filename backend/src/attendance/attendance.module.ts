import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { BiometricController } from './biometric.controller';
import { AttendanceCronService } from './attendance-cron.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AttendanceController, BiometricController],
  providers: [AttendanceService, AttendanceCronService],
  exports: [AttendanceService],
})
export class AttendanceModule { }
