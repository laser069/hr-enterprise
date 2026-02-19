// Payroll Types

export type PayrollRunStatus = 'draft' | 'approved' | 'processed';

export interface SalaryComponent {
  id?: string;
  name: string;
  amount: number;
  type?: 'allowance' | 'deduction';
  isTaxable?: boolean;
}

export interface SalaryStructure {
  id: string;
  name: string;
  description?: string;
  basic: number;
  da?: number;
  baseSalary: number; // Alias for UI compatibility
  hra: number;
  conveyance?: number;
  medicalAllowance?: number;
  specialAllowance?: number;
  professionalTax?: number;
  pf?: number;
  esi?: number;
  overtimeRate?: number;
  isActive?: boolean;
  allowances?: SalaryComponent[];
  deductions?: SalaryComponent[];
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
  lopDays: number;
  lopDeduction: number;
  totalDeductions: number;
  netSalary: number;
  additions?: Record<string, number>;
  deductions?: Record<string, number>;
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
  payrollRun?: {
    id: string;
    month: number;
    year: number;
    status: string;
    paidDate?: string;
  };
}

export interface CreatePayrollRunDto {
  month: number;
  year: number;
}

export interface CreateSalaryStructureDto {
  name: string;
  description?: string;
  basic: number;
  da?: number;
  hra: number;
  conveyance?: number;
  medicalAllowance?: number;
  specialAllowance?: number;
  professionalTax?: number;
  pf?: number;
  esi?: number;
  overtimeRate?: number;
}
