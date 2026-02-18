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
    return apiClient.get<AttendanceStats>('/attendance/today-stats');
  },

  // Get employee attendance
  getEmployeeAttendance: async (employeeId: string, params?: AttendanceListParams): Promise<Attendance[]> => {
    const response = await apiClient.getPaginated<Attendance>('/attendance', { 
      params: { ...params, employeeId } 
    });
    return response.data;
  },

  // Get employee attendance summary
  getEmployeeSummary: (employeeId: string, month?: number, year?: number): Promise<AttendanceStats> => {
    return apiClient.get<AttendanceStats>(`/attendance/summary/${employeeId}`, {
      params: { month, year }
    });
  },

  // Delete attendance record
  delete: (id: string): Promise<void> => {
    return apiClient.delete(`/attendance/${id}`);
  },

  getMyAttendance: (startDate?: string, endDate?: string): Promise<Attendance[]> => {
    return apiClient.get<Attendance[]>('/attendance/my', { params: { startDate, endDate } });
  },

  get: (id: string): Promise<Attendance> => {
    return apiClient.get<Attendance>(`/attendance/${id}`);
  },

  update: (id: string, data: Partial<Attendance>): Promise<Attendance> => {
    return apiClient.patch<Attendance>(`/attendance/${id}`, data);
  },
};
