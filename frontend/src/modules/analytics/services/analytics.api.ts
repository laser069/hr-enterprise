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
  getAttendanceMetrics: (): Promise<AttendanceMetrics> => {
    return apiClient.get<AttendanceMetrics>('/analytics/attendance');
  },

  getLeaveMetrics: (): Promise<LeaveMetrics> => {
    return apiClient.get<LeaveMetrics>('/analytics/leave');
  },

  getPayrollMetrics: (): Promise<PayrollMetrics> => {
    return apiClient.get<PayrollMetrics>('/analytics/payroll');
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
};
