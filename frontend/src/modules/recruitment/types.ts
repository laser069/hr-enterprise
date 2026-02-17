// Recruitment Types

export type JobStatus = 'OPEN' | 'CLOSED' | 'ON_HOLD';
export type CandidateStage = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFERED' | 'HIRED' | 'REJECTED';

export interface Job {
  id: string;
  title: string;
  description: string;
  departmentId: string;
  positions: number;
  status: JobStatus;
  postedDate: string;
  closedDate?: string;
  createdAt: string;
  updatedAt: string;
  postedAt?: string; // Add alias for postedDate
  location?: string;
  candidateCount?: number;
  openings?: number;
  department?: {
    id: string;
    name: string;
  };
}

export interface Candidate {
  id: string;
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  stage: CandidateStage;
  appliedAt: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
  job?: Job;
}

export interface CandidateListResponse {
  data: Candidate[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateJobDto {
  title: string;
  description: string;
  departmentId: string;
  positions: number;
}

export interface CreateCandidateDto {
  jobId: string;
  name: string;
  email: string;
  phone: string;
  resume?: string;
}

export interface RecruitmentSummary {
  openJobs: number;
  totalCandidates: number;
  hiredThisMonth: number;
  avgTimeToHire: number;
  interviewsScheduled: number;
  candidatesByStage: Record<CandidateStage, number>;
}
