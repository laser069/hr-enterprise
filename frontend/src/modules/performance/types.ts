// Performance Management Types

export type GoalStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ReviewStatus = 'DRAFT' | 'SUBMITTED' | 'ACKNOWLEDGED';

export interface Goal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  targetValue: number;
  achievedValue: number;
  weightage?: number;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  period: string;
  rating: number; // 1-5
  strengths: string;
  improvements: string;
  comments: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateGoalDto {
  employeeId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  targetValue: number;
  achievedValue?: number;
}

export interface UpdateGoalProgressDto {
  achievedValue: number;
  status?: GoalStatus;
}

export interface CreateReviewDto {
  employeeId: string;
  period: string;
  rating: number;
  strengths: string;
  improvements: string;
  comments: string;
}
