import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruitmentApi } from '../services/recruitment.api';
import type { CreateJobDto, CreateCandidateDto, Job, RecruitmentSummary, CandidateListResponse } from '../types';

export const recruitmentKeys = {
  all: ['recruitment'] as const,
  jobs: () => [...recruitmentKeys.all, 'jobs'] as const,
  candidates: () => [...recruitmentKeys.all, 'candidates'] as const,
};

export function useJobs(params?: Record<string, unknown>) {
  return useQuery<Job[]>({
    queryKey: [...recruitmentKeys.jobs(), params],
    queryFn: () => recruitmentApi.getJobs(params),
  });
}

export function useCandidates(params?: Record<string, unknown>) {
  return useQuery<CandidateListResponse>({
    queryKey: [...recruitmentKeys.candidates(), params],
    queryFn: () => recruitmentApi.getCandidates(params),
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJobDto) => recruitmentApi.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobs() });
    },
  });
}

export function useCloseJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recruitmentApi.closeJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobs() });
    },
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCandidateDto) => recruitmentApi.createCandidate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.candidates() });
    },
  });
}

export function useUpdateCandidateStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      recruitmentApi.updateCandidateStage(id, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.candidates() });
    },
  });
}

export const useMoveCandidateStage = useUpdateCandidateStage;

export function useConvertToEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recruitmentApi.convertToEmployee(id, {
      employeeCode: '', // Added missing required field
      firstName: '',
      lastName: '',
      email: '',
      departmentId: '',
      managerId: '', // Added missing field
      employmentType: 'FULL_TIME',
      dateOfJoining: new Date().toISOString(), // Added missing field
      designation: '',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.candidates() });
    },
  });
}

export function useDeleteCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recruitmentApi.deleteCandidate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.candidates() });
    },
  });
}

export function useRecruitmentStats() {
  return useQuery({
    queryKey: ['recruitment', 'stats'],
    queryFn: () => recruitmentApi.getSummary().then((res: RecruitmentSummary) => ({
      openJobs: res.openJobs,
      totalCandidates: res.totalCandidates,
      newCandidatesThisMonth: 0,
      hiredThisMonth: res.hiredThisMonth,
    })),
  });
}

export function useRecruitmentSummary() {
  return useQuery({
    queryKey: ['recruitment', 'summary'],
    queryFn: () => recruitmentApi.getSummary(),
  });
}
