// Recruitment Types

export type JobStatus = 'draft' | 'published' | 'closed';
export type CandidateStage = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

export interface Job {
  id: string;
  title: string;
  description?: string;
  departmentId?: string;
  requirements?: string;
  location?: string;
  employmentType?: string;
  minSalary?: number;
  maxSalary?: number;
  openings?: number;
  status: JobStatus;
  postedDate: string;
  closedDate?: string;
  postedAt?: string;
  candidateCount?: number;
  department?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
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
  description?: string;
  departmentId?: string;
  requirements?: string;
  location?: string;
  employmentType?: string;
  minSalary?: number;
  maxSalary?: number;
  openings?: number;
}

export interface CreateCandidateDto {
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  source?: string;
  notes?: string;
}

export interface RecruitmentSummary {
  openJobs: number;
  totalCandidates: number;
  hiredThisMonth: number;
  avgTimeToHire: number;
  interviewsScheduled: number;
  candidatesByStage: Record<CandidateStage, number>;
}

export type InterviewType = 'screening' | 'technical' | 'behavioral' | 'final';
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'pending_feedback';

export interface Interview {
  id: string;
  candidateId: string;
  interviewerId: string;
  scheduledAt: string;
  type: InterviewType;
  status: InterviewStatus;
  feedback?: string;
  score?: number;
  meetingLink?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  candidate?: Candidate;
  interviewer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
