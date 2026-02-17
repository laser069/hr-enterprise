import { apiClient } from '../../../core/api/api-client';
import type {
  Attendance,
  AttendanceStats,
  CheckInDto,
  CheckOutDto,
  AttendanceListParams,
  AttendanceListResponse,
} from '../types';

export const attendanceApi = {
  // List attendance records
  list: (params: AttendanceListParams): Promise<AttendanceListResponse> => {
    return apiClient.getPaginated<Attendance>('/attendance', { params });
  },

  // Check in
  checkIn: (data: CheckInDto): Promise<Attendance> => {
    return apiClient.post<Attendance>('/attendance/check-in', data);
  },

  // Check out
  checkOut: (data: CheckOutDto): Promise<Attendance> => {
    return apiClient.post<Attendance>('/attendance/check-out', data);
  },

  // Get attendance statistics
  getStats: (params?: { startDate: string; endDate: string; departmentId?: string }): Promise<AttendanceStats> => {
    return apiClient.get<AttendanceStats>('/analytics/attendance/metrics', { params });
  },

  // Get today's attendance stats
  getTodayStats: (): Promise<AttendanceStats> => {
    return apiClient.get<AttendanceStats>('/analytics/attendance/today');
  },

  // Get employee attendance
  getEmployeeAttendance: (employeeId: string, params?: AttendanceListParams): Promise<Attendance[]> => {
    return apiClient.get<Attendance[]>(`/attendance/employee/${employeeId}`, { params });
  },

  // Get employee attendance summary
  getEmployeeSummary: (employeeId: string): Promise<AttendanceStats> => {
    return apiClient.get<AttendanceStats>(`/attendance/summary/${employeeId}`);
  },

  // Delete attendance record
  delete: (id: string): Promise<void> => {
    return apiClient.delete(`/attendance/${id}`);
  },
};
