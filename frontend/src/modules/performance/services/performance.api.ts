import { apiClient } from '../../../core/api/api-client';
import type { Goal, PerformanceReview, CreateGoalDto, CreateReviewDto, UpdateGoalProgressDto } from '../types';

export const performanceApi = {
  // Goals
  getGoals: (): Promise<Goal[]> => {
    return apiClient.get<Goal[]>('/performance/goals');
  },

  createGoal: (data: CreateGoalDto): Promise<Goal> => {
    return apiClient.post<Goal>('/performance/goals', data);
  },

  updateGoalProgress: (id: string, data: UpdateGoalProgressDto): Promise<Goal> => {
    return apiClient.patch<Goal>(`/performance/goals/${id}/progress`, data);
  },

  // Reviews
  getReviews: (): Promise<PerformanceReview[]> => {
    return apiClient.get<PerformanceReview[]>('/performance/reviews');
  },

  createReview: (data: CreateReviewDto): Promise<PerformanceReview> => {
    return apiClient.post<PerformanceReview>('/performance/reviews', data);
  },

  getPendingReviews: (): Promise<PerformanceReview[]> => {
    return apiClient.get<PerformanceReview[]>('/performance/reviews', { params: { status: 'draft' } });
  },

  submitReview: (id: string): Promise<PerformanceReview> => {
    return apiClient.post<PerformanceReview>(`/performance/reviews/${id}/submit`);
  },

  acknowledgeReview: (id: string): Promise<PerformanceReview> => {
    return apiClient.post<PerformanceReview>(`/performance/reviews/${id}/acknowledge`);
  },

  getSummary: (employeeId: string): Promise<Record<string, unknown>> => {
    return apiClient.get<Record<string, unknown>>(`/performance/summary/${employeeId}`);
  },

  deleteGoal: (id: string): Promise<void> => {
    return apiClient.delete(`/performance/goals/${id}`);
  },
};
