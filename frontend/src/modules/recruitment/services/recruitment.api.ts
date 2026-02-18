import { apiClient } from '../../../core/api/api-client';
import type {
  Job,
  Candidate,
  CandidateListResponse,
  CreateJobDto,
  CreateCandidateDto,
  RecruitmentSummary,
  Interview,
  InterviewType,
  InterviewStatus,
} from '../types';

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
  
  publishJob: (id: string): Promise<Job> => {
    return apiClient.post<Job>(`/recruitment/jobs/${id}/publish`);
  },

  // Candidates
  getCandidates: (params?: Record<string, unknown>): Promise<CandidateListResponse> => {
    return apiClient.getPaginated<Candidate>('/recruitment/candidates', { params });
  },

  createCandidate: (data: CreateCandidateDto): Promise<Candidate> => {
    return apiClient.post<Candidate>('/recruitment/candidates', data);
  },

  updateCandidateStage: (id: string, stage: string): Promise<Candidate> => {
    return apiClient.patch<Candidate>(`/recruitment/candidates/${id}/stage`, { stage });
  },

  convertToEmployee: (id: string): Promise<void> => {
    return apiClient.post(`/recruitment/candidates/${id}/convert`);
  },

  deleteCandidate: (id: string): Promise<void> => {
    return apiClient.delete(`/recruitment/candidates/${id}`);
  },

  getSummary: (): Promise<RecruitmentSummary> => {
    return apiClient.get<RecruitmentSummary>('/recruitment/summary');
  },

  // Interviews
  scheduleInterview: (data: { candidateId: string; interviewerId: string; scheduledAt: string; type: InterviewType }): Promise<Interview> => {
    return apiClient.post<Interview>('/recruitment/interviews', data);
  },

  getInterviews: (candidateId?: string): Promise<Interview[]> => {
    return apiClient.get<Interview[]>('/recruitment/interviews', { params: { candidateId } });
  },

  updateInterview: (id: string, data: { status?: InterviewStatus; feedback?: string; score?: number }): Promise<Interview> => {
    return apiClient.patch<Interview>(`/recruitment/interviews/${id}`, data);
  },

  // Offer Letter
  generateOfferLetter: (candidateId: string): Promise<Blob> => {
    return apiClient.getBlob(`/recruitment/candidates/${candidateId}/offer-letter`);
  },
};
