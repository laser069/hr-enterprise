import { apiClient } from '../../../core/api/api-client';
import type {
  LeaveType,
  LeaveRequest,
  LeaveBalance,
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

  // Leave Requests
  getLeaveRequests: (params?: LeaveListParams): Promise<LeaveRequest[]> => {
    return apiClient.get<LeaveRequest[]>('/leave-requests', { params });
  },

  getLeaveRequest: (id: string): Promise<LeaveRequest> => {
    return apiClient.get<LeaveRequest>(`/leave-requests/${id}`);
  },

  createLeaveRequest: (data: CreateLeaveRequestDto): Promise<LeaveRequest> => {
    return apiClient.post<LeaveRequest>('/leave-requests', data);
  },

  approveLeaveRequest: (id: string, comments?: string): Promise<LeaveRequest> => {
    return apiClient.patch<LeaveRequest>(`/leave-requests/${id}/approve`, { comments });
  },

  rejectLeaveRequest: (id: string, rejectionReason: string): Promise<LeaveRequest> => {
    return apiClient.patch<LeaveRequest>(`/leave-requests/${id}/reject`, { rejectionReason });
  },

  cancelLeaveRequest: (id: string): Promise<LeaveRequest> => {
    return apiClient.patch<LeaveRequest>(`/leave-requests/${id}/cancel`);
  },

  getMyLeaveRequests: (): Promise<LeaveRequest[]> => {
    return apiClient.get<LeaveRequest[]>('/leave-requests/my-requests');
  },

  getPendingApprovals: (): Promise<LeaveRequest[]> => {
    // Backend uses findAll with status=pending for this generally, 
    // or a specialized endpoint. For now, let's use the list with status pending.
    return apiClient.get<LeaveRequest[]>('/leave-requests', { params: { status: 'pending' } });
  },

  // Leave Balances & Summary
  getLeaveBalance: (year: number): Promise<LeaveBalance[]> => {
    return apiClient.get<LeaveBalance[]>('/leave-requests/balance', { params: { year } });
  },

  getLeaveSummary: (year: number): Promise<Record<string, unknown>> => {
    return apiClient.get<Record<string, unknown>>('/leave-requests/summary', { params: { year } });
  },
};
