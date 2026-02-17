import { apiClient } from '../../../core/api/api-client';
import type { Approval } from '../types';

export const workflowApi = {
  getApprovals: (): Promise<Approval[]> => {
    return apiClient.get<Approval[]>('/workflow/approvals');
  },

  getPendingApprovals: (): Promise<Approval[]> => {
    return apiClient.get<Approval[]>('/workflow/approvals/pending');
  },

  approveStep: (id: string, comments?: string): Promise<Approval> => {
    return apiClient.post<Approval>(`/workflow/approvals/${id}/approve`, { comments });
  },

  rejectStep: (id: string, comments: string): Promise<Approval> => {
    return apiClient.post<Approval>(`/workflow/approvals/${id}/reject`, { comments });
  },
};
