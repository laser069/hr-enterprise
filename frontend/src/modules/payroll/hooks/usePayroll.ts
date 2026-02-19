import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollApi } from '../services/payroll.api';
import type { CreatePayrollRunDto, CreateSalaryStructureDto } from '../types';

// Query keys
export const payrollKeys = {
  all: ['payroll'] as const,
  runs: () => [...payrollKeys.all, 'runs'] as const,
  run: (id: string) => [...payrollKeys.runs(), id] as const,
  entries: (runId: string) => [...payrollKeys.all, 'entries', runId] as const,
  structures: () => [...payrollKeys.all, 'structures'] as const,
  structure: (id: string) => [...payrollKeys.structures(), id] as const,
  summary: (id: string) => [...payrollKeys.all, 'summary', id] as const,
};

// Payroll Runs hooks
export function usePayrollRuns() {
  return useQuery({
    queryKey: payrollKeys.runs(),
    queryFn: () => payrollApi.getPayrollRuns(),
  });
}

export function usePayrollRun(id: string) {
  return useQuery({
    queryKey: payrollKeys.run(id),
    queryFn: () => payrollApi.getPayrollRun(id),
    enabled: !!id,
  });
}

export function usePayrollEntries(runId: string) {
  return useQuery({
    queryKey: payrollKeys.entries(runId),
    queryFn: () => payrollApi.getPayrollEntries(runId),
    enabled: !!runId,
  });
}

export function usePayrollSummary(runId: string) {
  return useQuery({
    queryKey: payrollKeys.summary(runId),
    queryFn: () => payrollApi.getPayrollSummary(runId),
    enabled: !!runId,
  });
}

// Salary Structures hooks
export function useSalaryStructures() {
  return useQuery({
    queryKey: payrollKeys.structures(),
    queryFn: () => payrollApi.getSalaryStructures(),
  });
}

export function useSalaryStructure(id: string) {
  return useQuery({
    queryKey: payrollKeys.structure(id),
    queryFn: () => payrollApi.getSalaryStructure(id),
    enabled: !!id,
  });
}

// Mutations
export function useCreatePayrollRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePayrollRunDto) => payrollApi.createPayrollRun(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.runs() });
    },
  });
}

export function useCalculatePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => payrollApi.calculatePayroll(id),
    onSuccess: (_: unknown, id: string) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.run(id) });
      queryClient.invalidateQueries({ queryKey: payrollKeys.entries(id) });
      queryClient.invalidateQueries({ queryKey: payrollKeys.summary(id) });
    },
  });
}

export function useApprovePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => payrollApi.approvePayroll(id),
    onSuccess: (_: unknown, id: string) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.run(id) });
    },
  });
}

export function useProcessPayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => payrollApi.processPayroll(id),
    onSuccess: (_: unknown, id: string) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.run(id) });
    },
  });
}

export function useCreateSalaryStructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalaryStructureDto) => payrollApi.createSalaryStructure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.structures() });
    },
  });
}

// Aliases for backward compatibility with existing page components
export const usePayrollStats = () => {
  return useQuery({
    queryKey: ['payroll', 'stats'],
    queryFn: () => Promise.resolve({
      monthlyPayrollAmount: 0,
      totalPayrolls: 0,
      totalProcessed: 0,
      totalPending: 0,
    }),
    enabled: false,
  });
};
export function useDeletePayrollRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => payrollApi.deletePayrollRun(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.runs() });
    },
  });
}

export function useDownloadBankExport() {
  return useMutation({
    mutationFn: (id: string) => payrollApi.downloadBankExport(id),
  });
}
