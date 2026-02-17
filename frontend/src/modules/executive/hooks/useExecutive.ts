import { useQuery } from '@tanstack/react-query';
import { executiveApi } from '../services/executive.api';

// Query keys
export const executiveKeys = {
  all: ['executive'] as const,
  summary: () => [...executiveKeys.all, 'summary'] as const,
};

// Get executive summary hook
export function useExecutiveSummary() {
  return useQuery({
    queryKey: executiveKeys.summary(),
    queryFn: () => executiveApi.getExecutiveSummary(),
    staleTime: 2 * 60 * 1000, // 2 minutes - dashboard data should be relatively fresh
  });
}