// Performance Management Types

export type GoalStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type ReviewStatus = 'draft' | 'submitted' | 'acknowledged';

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
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  overallRating?: number;  // 1-5
  strengths?: string;
  areasOfImprovement?: string;
  feedback?: string;
  goals?: string;
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
  reviewerId: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  overallRating: number;
  comments?: string;
  strengths?: string;
  improvements?: string;
  feedback?: string;
  goals?: string;
}
