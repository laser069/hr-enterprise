// Workflow Types

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ApprovalEntityType = 'LEAVE_REQUEST' | 'PAYROLL_RUN' | 'EXPENSE_CLAIM';

export interface Approval {
  id: string;
  entityType: string;
  entityId: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  comments?: string;
  requesterId: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  requester?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  steps?: ApprovalStep[];
  approvedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ApprovalStep {
  id: string;
  approvalId: string;
  approverId: string;
  order: number;
  status: string;
  comments?: string;
  approvedAt?: string;
  approver?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}
