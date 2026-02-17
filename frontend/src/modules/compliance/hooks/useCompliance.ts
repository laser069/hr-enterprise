import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { complianceApi } from '../services/compliance.api';
import type { CreateFilingDto, FilingRecord, ComplianceDashboard } from '../types';

export const complianceKeys = {
  all: ['compliance'] as const,
  filings: () => [...complianceKeys.all, 'filings'] as const,
  upcoming: () => [...complianceKeys.all, 'upcoming'] as const,
  dashboard: () => [...complianceKeys.all, 'dashboard'] as const,
  acknowledgements: () => [...complianceKeys.all, 'acknowledgements'] as const,
};

export function useFilings() {
  return useQuery({
    queryKey: complianceKeys.filings(),
    queryFn: () => complianceApi.getFilings(),
  });
}

export function useComplianceDashboard() {
  return useQuery<ComplianceDashboard>({
    queryKey: complianceKeys.dashboard(),
    queryFn: () => complianceApi.getDashboard(),
  });
}

export function useComplianceStats() {
  const { data: dashboard, ...rest } = useComplianceDashboard();
  
  // Map dashboard data to what useComplianceStats expects
  // The backend returns { filings: { pending, filedThisMonth, upcoming }, policies: [...] }
  const stats = dashboard ? {
    totalFilings: (dashboard.filings?.filedThisMonth || 0) + (dashboard.filings?.pending || 0),
    pendingFilings: dashboard.filings?.pending || 0,
    filedFilings: dashboard.filings?.filedThisMonth || 0,
    overdueCount: dashboard.filings?.upcoming?.filter((f: FilingRecord) => f.dueDate && new Date(f.dueDate) < new Date()).length || 0,
  } : undefined;

  return { data: stats, ...rest };
}

export function useUpcomingFilings() {
  return useQuery({
    queryKey: complianceKeys.upcoming(),
    queryFn: () => complianceApi.getUpcomingFilings(),
  });
}

export function useAcknowledgements() {
  return useQuery({
    queryKey: complianceKeys.acknowledgements(),
    queryFn: () => complianceApi.getAcknowledgements(),
  });
}

export function useCreateFiling() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFilingDto) => complianceApi.createFiling(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.filings() });
      queryClient.invalidateQueries({ queryKey: complianceKeys.dashboard() });
    },
  });
}

export function useFileFiling() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { filedDate: string; referenceNumber: string } }) =>
      complianceApi.fileFiling(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.filings() });
      queryClient.invalidateQueries({ queryKey: complianceKeys.dashboard() });
    },
  });
}
