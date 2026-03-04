import { Module } from '@nestjs/common';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { BankingService } from './banking.service';
import { AuditModule } from '../shared/audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [PayrollController],
  providers: [PayrollService, BankingService],
  exports: [PayrollService, BankingService],
})
export class PayrollModule { }
