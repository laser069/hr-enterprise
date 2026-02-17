import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '../services/workflow.api';
import type { Approval } from '../types';

export const workflowKeys = {
  all: ['workflow'] as const,
  approvals: (params?: Record<string, unknown>) => [...workflowKeys.all, 'approvals', params] as const,
  pendingApprovals: () => [...workflowKeys.all, 'pending-approvals'] as const,
};

export function useApprovals(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: workflowKeys.approvals(params),
    queryFn: () => workflowApi.getApprovals(), // Note: backend getApprovals might not take params yet
    enabled: params !== undefined,
  });
}

export function usePendingApprovals() {
  return useQuery<Approval[]>({
    queryKey: workflowKeys.pendingApprovals(),
    queryFn: () => workflowApi.getPendingApprovals(),
  });
}

export function useApproveStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      workflowApi.approveStep(id, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.approvals() });
      queryClient.invalidateQueries({ queryKey: workflowKeys.pendingApprovals() });
    },
  });
}

export function useRejectStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments: string }) =>
      workflowApi.rejectStep(id, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.approvals() });
      queryClient.invalidateQueries({ queryKey: workflowKeys.pendingApprovals() });
    },
  });
}

// Alias for backward compatibility
export const useRejectApproval = useRejectStep;

// Stats hook for dashboard
export const useApprovalStats = () => {
  return useQuery({
    queryKey: ['workflow', 'stats'],
    queryFn: () => Promise.resolve({
      pendingForMe: 0,
      myRequestsPending: 0,
      totalApproved: 0,
      totalRejected: 0,
    }),
    enabled: true,
  });
};
