import { apiClient, type PaginatedResponse } from '../../../core/api/api-client';
import type {
  LeaveType,
  LeaveRequest,
  LeaveBalance,
  LeaveSummary,
  CreateLeaveRequestDto,
  LeaveListParams,
} from '../types';

export const leaveApi = {
  // Leave Types
  getLeaveTypes: (): Promise<LeaveType[]> => {
    return apiClient.get<LeaveType[]>('/leave-types');
  },

  createLeaveType: (data: Partial<LeaveType>): Promise<LeaveType> => {
    return apiClient.post<LeaveType>('/leave-types', data);
  },

  updateLeaveType: (id: string, data: Partial<LeaveType>): Promise<LeaveType> => {
    return apiClient.patch<LeaveType>(`/leave-types/${id}`, data);
  },

  deleteLeaveType: (id: string): Promise<void> => {
    return apiClient.delete(`/leave-types/${id}`);
  },

  // Leave Requests
  getLeaveRequests: (params?: LeaveListParams): Promise<PaginatedResponse<LeaveRequest>> => {
    return apiClient.getPaginated<LeaveRequest>('/leave-requests', { params });
  },

  getLeaveRequest: (id: string): Promise<LeaveRequest> => {
    return apiClient.get<LeaveRequest>(`/leave-requests/${id}`);
  },

  createLeaveRequest: (data: CreateLeaveRequestDto): Promise<LeaveRequest> => {
    return apiClient.post<LeaveRequest>('/leave-requests', data);
  },

  approveLeaveRequest: (id: string): Promise<LeaveRequest> => {
    return apiClient.patch<LeaveRequest>(`/leave-requests/${id}/approve`);
  },

  rejectLeaveRequest: (id: string, rejectionReason: string): Promise<LeaveRequest> => {
    return apiClient.patch<LeaveRequest>(`/leave-requests/${id}/reject`, { rejectionReason });
  },

  cancelLeaveRequest: (id: string): Promise<LeaveRequest> => {
    return apiClient.patch<LeaveRequest>(`/leave-requests/${id}/cancel`);
  },

  getMyLeaveRequests: (params?: LeaveListParams): Promise<PaginatedResponse<LeaveRequest>> => {
    return apiClient.getPaginated<LeaveRequest>('/leave-requests/my-requests', { params });
  },

  getPendingApprovals: (): Promise<PaginatedResponse<LeaveRequest>> => {
    return apiClient.getPaginated<LeaveRequest>('/leave-requests', { params: { status: 'pending' } });
  },

  // Leave Balances & Summary
  getLeaveBalance: (year: number): Promise<{ balances: LeaveBalance[] }> => {
    return apiClient.get('/leave-requests/balance', { params: { year } });
  },

  getLeaveSummary: (year: number): Promise<{ summary: LeaveSummary }> => {
    return apiClient.get('/leave-requests/summary', { params: { year } });
  },
};
