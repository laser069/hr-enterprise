import { apiClient } from '../../../core/api/api-client';
import type {
  AttendanceMetrics,
  LeaveMetrics,
  PayrollMetrics,
  AttritionAnalysis,
  DepartmentAnalytics,
  TodayAttendanceSummary,
} from '../types';

export const analyticsApi = {
  getAttendanceMetrics: (params?: { startDate?: string; endDate?: string; departmentId?: string }): Promise<AttendanceMetrics> => {
    return apiClient.get<AttendanceMetrics>('/analytics/attendance/metrics', { params });
  },

  getLeaveMetrics: (params?: { year?: number; departmentId?: string }): Promise<LeaveMetrics> => {
    return apiClient.get<LeaveMetrics>('/analytics/leave/metrics', { params });
  },

  getPayrollMetrics: (params?: { year?: number }): Promise<PayrollMetrics> => {
    return apiClient.get<PayrollMetrics>('/analytics/payroll/metrics', { params });
  },

  getAttritionAnalysis: (): Promise<AttritionAnalysis> => {
    return apiClient.get<AttritionAnalysis>('/analytics/attrition');
  },

  getDepartmentAnalytics: (): Promise<DepartmentAnalytics[]> => {
    return apiClient.get<DepartmentAnalytics[]>('/analytics/departments');
  },

  getTodayAttendance: (): Promise<TodayAttendanceSummary> => {
    return apiClient.get<TodayAttendanceSummary>('/analytics/attendance/today');
  },

  getPerformanceMetrics: (params?: { year?: number; departmentId?: string }): Promise<any> => {
    return apiClient.get('/analytics/performance/metrics', { params });
  },

  getAttendanceReport: (params: { startDate: string; endDate: string; departmentId?: string }): Promise<any[]> => {
    return apiClient.get('/analytics/reports/attendance', { params });
  },

  getPayrollReport: (params: { year: number; month?: number }): Promise<any[]> => {
    return apiClient.get('/analytics/reports/payroll', { params });
  },
};
