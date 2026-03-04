import { apiClient } from '../../../core/api/api-client';
import type {
  Goal,
  PerformanceReview,
  CreateGoalDto,
  CreateReviewDto,
  UpdateGoalProgressDto,
  FeedbackRequest,
  PromotionHistory,
  CreateFeedbackDto,
  SubmitFeedbackDto,
  CreatePromotionDto
} from '../types';

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

  // 360 Feedback
  getFeedback: (params: { employeeId?: string; reviewerId?: string }): Promise<FeedbackRequest[]> => {
    return apiClient.get<FeedbackRequest[]>('/performance/feedback', { params });
  },

  requestFeedback: (data: CreateFeedbackDto): Promise<FeedbackRequest> => {
    return apiClient.post<FeedbackRequest>('/performance/feedback', data);
  },

  submitFeedback: (id: string, data: SubmitFeedbackDto): Promise<FeedbackRequest> => {
    return apiClient.post<FeedbackRequest>(`/performance/feedback/${id}/submit`, data);
  },

  // Promotions
  getPromotions: (employeeId: string): Promise<PromotionHistory[]> => {
    return apiClient.get<PromotionHistory[]>(`/performance/promotions/${employeeId}`);
  },

  createPromotion: (data: CreatePromotionDto): Promise<PromotionHistory> => {
    return apiClient.post<PromotionHistory>('/performance/promotions', data);
  },
};
