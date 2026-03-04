import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceApi } from '../services/performance.api';
import type { CreateGoalDto, CreateReviewDto, UpdateGoalProgressDto } from '../types';

export const performanceKeys = {
  all: ['performance'] as const,
  goals: () => [...performanceKeys.all, 'goals'] as const,
  reviews: () => [...performanceKeys.all, 'reviews'] as const,
  pendingReviews: () => [...performanceKeys.all, 'pending-reviews'] as const,
  feedback: () => [...performanceKeys.all, 'feedback'] as const,
  promotions: (employeeId: string) => [...performanceKeys.all, 'promotions', employeeId] as const,
};

export function useGoals() {
  return useQuery({
    queryKey: performanceKeys.goals(),
    queryFn: () => performanceApi.getGoals(),
  });
}

export function useReviews() {
  return useQuery({
    queryKey: performanceKeys.reviews(),
    queryFn: () => performanceApi.getReviews(),
  });
}

export function usePendingReviews() {
  return useQuery({
    queryKey: performanceKeys.pendingReviews(),
    queryFn: () => performanceApi.getPendingReviews(),
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGoalDto) => performanceApi.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.goals() });
    },
  });
}

export function useUpdateGoalProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateGoalProgressDto) =>
      performanceApi.updateGoalProgress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.goals() });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => performanceApi.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.goals() });
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReviewDto) => performanceApi.createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() });
    },
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => performanceApi.submitReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() });
    },
  });
}

export function useAcknowledgeReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => performanceApi.acknowledgeReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() });
    },
  });
}

export function usePerformanceStats() {
  return useQuery({
    queryKey: [...performanceKeys.all, 'stats'],
    queryFn: async () => {
      // Mock stats for now
      return {
        totalGoals: 0,
        averageRating: 0,
        pendingReviews: 0,
        completedGoals: 0,
      };
    },
  });
}

export function useFeedback(params: { employeeId?: string; reviewerId?: string }) {
  return useQuery({
    queryKey: [...performanceKeys.feedback(), params],
    queryFn: () => performanceApi.getFeedback(params),
  });
}

export function useRequestFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => performanceApi.requestFeedback(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.feedback() });
    },
  });
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & any) =>
      performanceApi.submitFeedback(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.feedback() });
    },
  });
}

export function usePromotions(employeeId: string) {
  return useQuery({
    queryKey: performanceKeys.promotions(employeeId),
    queryFn: () => performanceApi.getPromotions(employeeId),
    enabled: !!employeeId,
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => performanceApi.createPromotion(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.promotions(variables.employeeId) });
    },
  });
}
