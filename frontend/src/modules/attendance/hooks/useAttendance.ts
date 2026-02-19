import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../services/attendance.api';
import type {
  Attendance,
  AttendanceListParams,
  CheckInDto,
  CheckOutDto,
} from '../types';

// Query keys
export const attendanceKeys = {
  all: ['attendance'] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  list: (params: AttendanceListParams) => [...attendanceKeys.lists(), params] as const,
  stats: () => [...attendanceKeys.all, 'stats'] as const,
  todayStats: () => [...attendanceKeys.all, 'today-stats'] as const,
  employeeAttendance: (employeeId: string) => [...attendanceKeys.all, 'employee', employeeId] as const,
  employeeSummary: (employeeId: string) => [...attendanceKeys.all, 'summary', employeeId] as const,
};

// List attendance hook
export function useAttendance(params: AttendanceListParams = {}) {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => attendanceApi.list(params),
  });
}

// Get attendance stats hook
export function useAttendanceStats() {
  return useQuery({
    queryKey: attendanceKeys.stats(),
    queryFn: () => attendanceApi.getStats(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Get today's stats hook
export function useTodayStats() {
  return useQuery({
    queryKey: attendanceKeys.todayStats(),
    queryFn: () => attendanceApi.getTodayStats(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

// Alias for backward compatibility
export const useTodayAttendanceStats = useTodayStats;


// Check in hook
export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckInDto) => attendanceApi.checkIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.todayStats() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.stats() });
    },
  });
}

// Check out hook
export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckOutDto) => attendanceApi.checkOut(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.todayStats() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.stats() });
    },
  });
}

// Get employee attendance hook
export function useEmployeeAttendance(employeeId: string, params?: AttendanceListParams) {
  return useQuery({
    queryKey: attendanceKeys.employeeAttendance(employeeId),
    queryFn: () => attendanceApi.getEmployeeAttendance(employeeId, params),
    enabled: !!employeeId,
  });
}

// Get employee summary hook
export function useEmployeeSummary(employeeId: string) {
  return useQuery({
    queryKey: attendanceKeys.employeeSummary(employeeId),
    queryFn: () => attendanceApi.getEmployeeSummary(employeeId),
    enabled: !!employeeId,
  });
}

// Delete attendance hook
export function useDeleteAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => attendanceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.stats() });
    },
  });
}

// Update attendance hook
export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Attendance> }) => attendanceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.todayStats() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.stats() });
    },
  });
}
