export interface Employee {
  id: string;
  userId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  departmentId?: string;
  designationId?: string;
  dateOfJoining: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateEmployeeInput {
  userId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  departmentId?: string;
  designationId?: string;
  dateOfJoining: string;
}

export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  departmentId?: string;
  designationId?: string;
  status?: 'active' | 'inactive';
}

export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface Designation {
  id: string;
  title: string;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type LeaveType = 'annual' | 'sick' | 'casual' | 'maternity' | 'paternity' | 'bereavement' | 'other';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  reason?: string;
  status: LeaveStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveRequestInput {
  employeeId: string;
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  reason?: string;
}

export interface LeaveSummary {
  employeeId: string;
  year: number;
  totalDays: number;
  approvedDays: number;
  pendingDays: number;
  rejectedDays: number;
  remainingDays: number;
}
