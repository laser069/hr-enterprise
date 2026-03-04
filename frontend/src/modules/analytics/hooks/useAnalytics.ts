import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../services/analytics.api';
import type { AttritionAnalysis } from '../types';

export const analyticsKeys = {
  all: ['analytics'] as const,
  attendance: () => [...analyticsKeys.all, 'attendance'] as const,
  leave: () => [...analyticsKeys.all, 'leave'] as const,
  payroll: () => [...analyticsKeys.all, 'payroll'] as const,
  attrition: () => [...analyticsKeys.all, 'attrition'] as const,
  departments: () => [...analyticsKeys.all, 'departments'] as const,
};

export function useAttendanceMetrics() {
  return useQuery({
    queryKey: analyticsKeys.attendance(),
    queryFn: () => analyticsApi.getAttendanceMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLeaveMetrics() {
  return useQuery({
    queryKey: analyticsKeys.leave(),
    queryFn: () => analyticsApi.getLeaveMetrics(),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePayrollMetrics() {
  return useQuery({
    queryKey: analyticsKeys.payroll(),
    queryFn: () => analyticsApi.getPayrollMetrics(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAttritionAnalysis(year?: number) {
  return useQuery<AttritionAnalysis>({
    queryKey: [...analyticsKeys.attrition(), year],
    queryFn: () => analyticsApi.getAttritionAnalysis(), // Backend might need year param
    staleTime: 5 * 60 * 1000,
  });
}

export function useDepartmentAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.departments(),
    queryFn: () => analyticsApi.getDepartmentAnalytics(),
    staleTime: 5 * 60 * 1000,
  });
}

// Aliases for backward compatibility with existing page components
export const useDepartmentMetrics = useDepartmentAnalytics;
export const useAttritionData = useAttritionAnalysis;

export const useTodayAttendance = () => {
  return useQuery({
    queryKey: ['analytics', 'today-attendance'],
    queryFn: () => analyticsApi.getTodayAttendance(),
    staleTime: 60 * 1000, // 1 minute
  });
};

export function usePerformanceMetrics(year?: number, departmentId?: string) {
  return useQuery({
    queryKey: [...analyticsKeys.all, 'performance-metrics', year, departmentId],
    queryFn: () => analyticsApi.getPerformanceMetrics({ year, departmentId }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAttendanceReport(startDate: string, endDate: string, departmentId?: string) {
  return useQuery({
    queryKey: [...analyticsKeys.all, 'report-attendance', startDate, endDate, departmentId],
    queryFn: () => analyticsApi.getAttendanceReport({ startDate, endDate, departmentId }),
    enabled: !!startDate && !!endDate,
  });
}

export function usePayrollReport(year: number, month?: number) {
  return useQuery({
    queryKey: [...analyticsKeys.all, 'report-payroll', year, month],
    queryFn: () => analyticsApi.getPayrollReport({ year, month }),
    enabled: !!year,
  });
}
