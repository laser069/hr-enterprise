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

  getPayrollEntries: async (runId: string): Promise<PayrollEntry[]> => {
    const run = await apiClient.get<PayrollRun>(`/payroll/runs/${runId}`);
    return run.entries || [];
  },

  getMyPayslips: (): Promise<PayrollEntry[]> => {
    return apiClient.get<PayrollEntry[]>('/payroll/my-payslips');
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

  deleteSalaryStructure: (id: string): Promise<void> => {
    return apiClient.delete(`/payroll/structures/${id}`);
  },

  deletePayrollRun: (id: string): Promise<void> => {
    return apiClient.delete(`/payroll/runs/${id}`);
  },

  updatePayrollEntry: (id: string, data: { lopDays?: number; notes?: string }): Promise<PayrollEntry> => {
    return apiClient.patch<PayrollEntry>(`/payroll/entries/${id}`, data);
  },

  getPayrollSummary: (id: string): Promise<Record<string, unknown>> => {
    return apiClient.get(`/payroll/runs/${id}/summary`);
  },

  downloadPayslip: async (entryId: string): Promise<void> => {
    const blob = await apiClient.getBlob(`/payroll/entries/${entryId}/pdf`);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payslip-${entryId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  downloadBankExport: async (runId: string): Promise<void> => {
    const blob = await apiClient.getBlob(`/payroll/runs/${runId}/bank-export`);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bank-export-${runId}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
