// Leave Management Types

export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type LeaveStatus = LeaveRequestStatus;

export interface LeaveType {
  id: string;
  name: string;
  description?: string;
  daysPerYear: number;
  isPaid: boolean;
  isCarryForward: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveRequestStatus;
  approverId?: string;
  approverComments?: string;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    employeeCode: string;
    profilePicture?: string;
  };
  leaveType?: LeaveType;
  approver?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  year: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  leaveType?: LeaveType;
}

export interface CreateLeaveRequestDto {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveListParams {
  page?: number;
  limit?: number;
  employeeId?: string;
  status?: LeaveRequestStatus;
  startDate?: string;
  endDate?: string;
}
