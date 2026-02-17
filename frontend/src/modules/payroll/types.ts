// Payroll Types

export type PayrollRunStatus = 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'PROCESSED';

export interface SalaryStructure {
  id: string;
  employeeId: string;
  basic: number;
  hra: number;
  conveyance: number;
  medicalAllowance: number;
  specialAllowance: number;
  professionalTax: number;
  pf: number;
  esi: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  effectiveFrom: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollRun {
  id: string;
  month: number;
  year: number;
  status: PayrollRunStatus;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  processedAt?: string;
  processedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  approvedByUser?: {
    firstName: string;
    lastName: string;
  };
  entries?: PayrollEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface PayrollEntry {
  id: string;
  payrollRunId: string;
  employeeId: string;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  lopDays: number;
  lopAmount: number;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    employeeCode: string;
    profilePicture?: string;
    department?: {
      name: string;
    };
  };
}

export interface CreatePayrollRunDto {
  month: number;
  year: number;
}

export interface CreateSalaryStructureDto {
  employeeId: string;
  basic: number;
  hra: number;
  conveyance: number;
  medicalAllowance: number;
  specialAllowance: number;
  professionalTax: number;
  pf: number;
  esi: number;
}
