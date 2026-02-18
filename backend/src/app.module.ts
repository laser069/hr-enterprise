import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonModule } from 'nest-winston';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { winstonConfig } from './config/winston.config';
import { PrismaModule } from './database/prisma.module';
import { AuditModule } from './shared/audit/audit.module';
import { EmailModule } from './shared/email/email.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RbacModule } from './rbac/rbac.module';
import { EmployeesModule } from './employees/employees.module';
import { DepartmentsModule } from './departments/departments.module';
import { AttendanceModule } from './attendance/attendance.module';
import { LeaveModule } from './leave/leave.module';
import { PayrollModule } from './payroll/payroll.module';
import { PerformanceModule } from './performance/performance.module';
import { RecruitmentModule } from './recruitment/recruitment.module';
import { ComplianceModule } from './compliance/compliance.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { WorkflowModule } from './workflow/workflow.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { UploadModule } from './modules/upload/upload.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthModule } from './modules/health/health.module';
import { ShiftsModule } from './shifts/shifts.module';
import { HolidaysModule } from './holidays/holidays.module';
import { HelpdeskModule } from './helpdesk/helpdesk.module';
import { JwtAuthGuard, RolesGuard, PermissionsGuard } from './common/guards';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    // Rate limiting
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 100,
        },
      ],
    }),
    // Background jobs
    ScheduleModule.forRoot(),
    // Logging
    WinstonModule.forRoot(winstonConfig),
    // Bull Queue
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    // Database
    PrismaModule,
    // Shared
    AuditModule,
    EmailModule,
    // Feature modules
    AuthModule,
    UsersModule,
    RbacModule,
    EmployeesModule,
    DepartmentsModule,
    AttendanceModule,
    LeaveModule,
    PayrollModule,
    PerformanceModule,
    RecruitmentModule,
    ComplianceModule,
    AnalyticsModule,
    WorkflowModule,
    SchedulerModule,
    // New modules
    UploadModule,
    NotificationsModule,
    HealthModule,
    ShiftsModule,
    HolidaysModule,
    HelpdeskModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global guards - enabled for security
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule { }
