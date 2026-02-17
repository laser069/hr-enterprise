import { apiClient } from '../../../core/api/api-client';
import type {
  PayrollRun,
  PayrollEntry,
  SalaryStructure,
  CreatePayrollRunDto,
  CreateSalaryStructureDto,
} from '../types';

export const payrollApi = {
  // Payroll Runs
  getPayrollRuns: (): Promise<PayrollRun[]> => {
    return apiClient.get<PayrollRun[]>('/payroll/runs');
  },

  getPayrollRun: (id: string): Promise<PayrollRun> => {
    return apiClient.get<PayrollRun>(`/payroll/runs/${id}`);
  },

  createPayrollRun: (data: CreatePayrollRunDto): Promise<PayrollRun> => {
    return apiClient.post<PayrollRun>('/payroll/runs', data);
  },

  calculatePayroll: (id: string): Promise<PayrollRun> => {
    return apiClient.post<PayrollRun>(`/payroll/runs/${id}/calculate`);
  },

  approvePayroll: (id: string): Promise<PayrollRun> => {
    return apiClient.post<PayrollRun>(`/payroll/runs/${id}/approve`);
  },

  processPayroll: (id: string): Promise<PayrollRun> => {
    return apiClient.post<PayrollRun>(`/payroll/runs/${id}/process`);
  },

  getPayrollEntries: (runId: string): Promise<PayrollEntry[]> => {
    return apiClient.get<PayrollEntry[]>(`/payroll/runs/${runId}/entries`);
  },

  // Salary Structures
  getSalaryStructures: (): Promise<SalaryStructure[]> => {
    return apiClient.get<SalaryStructure[]>('/payroll/structures');
  },

  getSalaryStructure: (id: string): Promise<SalaryStructure> => {
    return apiClient.get<SalaryStructure>(`/payroll/structures/${id}`);
  },

  createSalaryStructure: (data: CreateSalaryStructureDto): Promise<SalaryStructure> => {
    return apiClient.post<SalaryStructure>('/payroll/structures', data);
  },

  updateSalaryStructure: (id: string, data: Partial<CreateSalaryStructureDto>): Promise<SalaryStructure> => {
    return apiClient.patch<SalaryStructure>(`/payroll/structures/${id}`, data);
  },

  deletePayrollRun: (id: string): Promise<void> => {
    return apiClient.delete(`/payroll/runs/${id}`);
  },

  getPayrollSummary: (id: string): Promise<Record<string, unknown>> => {
    return apiClient.get(`/payroll/runs/${id}/summary`);
  },
};
