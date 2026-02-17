import { apiClient } from '../../../core/api/api-client';
import type { CreateEmployeeDto } from '../../employees/types';
import type { Job, Candidate, CreateJobDto, CreateCandidateDto, RecruitmentSummary, CandidateListResponse } from '../types';

export const recruitmentApi = {
  // Jobs
  getJobs: (params?: Record<string, unknown>): Promise<Job[]> => {
    return apiClient.get<Job[]>('/recruitment/jobs', { params });
  },

  createJob: (data: CreateJobDto): Promise<Job> => {
    return apiClient.post<Job>('/recruitment/jobs', data);
  },

  closeJob: (id: string): Promise<Job> => {
    return apiClient.post<Job>(`/recruitment/jobs/${id}/close`);
  },

  // Candidates
  getCandidates: (params?: Record<string, unknown>): Promise<CandidateListResponse> => {
    return apiClient.get<CandidateListResponse>('/recruitment/candidates', { params });
  },

  createCandidate: (data: CreateCandidateDto): Promise<Candidate> => {
    return apiClient.post<Candidate>('/recruitment/candidates', data);
  },

  updateCandidateStage: (id: string, stage: string): Promise<Candidate> => {
    return apiClient.post<Candidate>(`/recruitment/candidates/${id}/stage`, { stage });
  },

  convertToEmployee: (id: string, employeeData: CreateEmployeeDto): Promise<void> => {
    return apiClient.post(`/recruitment/candidates/${id}/convert`, employeeData);
  },

  deleteCandidate: (id: string): Promise<void> => {
    return apiClient.delete(`/recruitment/candidates/${id}`);
  },

  getSummary: (): Promise<RecruitmentSummary> => {
    return apiClient.get<RecruitmentSummary>('/recruitment/summary');
  },
};
