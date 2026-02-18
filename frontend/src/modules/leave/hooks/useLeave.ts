import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '../services/leave.api';
import type { CreateLeaveRequestDto, LeaveListParams } from '../types';

// Query keys
export const leaveKeys = {
  all: ['leave'] as const,
  types: () => [...leaveKeys.all, 'types'] as const,
  requests: () => [...leaveKeys.all, 'requests'] as const,
  request: (id: string) => [...leaveKeys.requests(), id] as const,
  myRequests: () => [...leaveKeys.all, 'my-requests'] as const,
  pendingApprovals: () => [...leaveKeys.all, 'pending-approvals'] as const,
  balances: (year: number) => [...leaveKeys.all, 'balances', year] as const,
  summary: (year: number) => [...leaveKeys.all, 'summary', year] as const,
};

// Leave Types hooks
export function useLeaveTypes() {
  return useQuery({
    queryKey: leaveKeys.types(),
    queryFn: () => leaveApi.getLeaveTypes(),
  });
}

// Leave Requests hooks
export function useLeaveRequests(params?: LeaveListParams) {
  return useQuery({
    queryKey: [...leaveKeys.requests(), params],
    queryFn: () => leaveApi.getLeaveRequests(params),
  });
}

export function useLeaveRequest(id: string) {
  return useQuery({
    queryKey: leaveKeys.request(id),
    queryFn: () => leaveApi.getLeaveRequest(id),
    enabled: !!id,
  });
}

export function useMyLeaveRequests() {
  return useQuery({
    queryKey: leaveKeys.myRequests(),
    queryFn: () => leaveApi.getMyLeaveRequests(),
  });
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: leaveKeys.pendingApprovals(),
    queryFn: () => leaveApi.getPendingApprovals(),
  });
}

// Leave Balances hook
export function useLeaveBalance(year: number) {
  return useQuery({
    queryKey: leaveKeys.balances(year),
    queryFn: () => leaveApi.getLeaveBalance(year),
  });
}

// Leave Summary hook
export function useLeaveSummary(year: number) {
  return useQuery({
    queryKey: leaveKeys.summary(year),
    queryFn: () => leaveApi.getLeaveSummary(year),
  });
}

// Mutations
export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeaveRequestDto) => leaveApi.createLeaveRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.myRequests() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.balances(new Date().getFullYear()) });
      queryClient.invalidateQueries({ queryKey: leaveKeys.summary(new Date().getFullYear()) });
    },
  });
}

export function useApproveLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      leaveApi.approveLeaveRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.pendingApprovals() });
    },
  });
}

export function useRejectLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason: string }) =>
      leaveApi.rejectLeaveRequest(id, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.pendingApprovals() });
    },
  });
}

export function useCancelLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leaveApi.cancelLeaveRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.myRequests() });
    },
  });
}
