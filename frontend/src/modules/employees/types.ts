// Employee Types

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type EmployeeStatus = 'active' | 'inactive' | 'terminated' | 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'SUSPENDED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: string;
  profilePicture?: string;
  departmentId?: string;
  department?: Department;
  designation?: string;
  managerId?: string;
  manager?: Employee;
  status: EmployeeStatus;
  employmentStatus: 'active' | 'inactive' | 'terminated';
  salaryStructureId?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  shiftId?: string;
  dateOfJoining: string;
  endDate?: string;
  address?: string;
  emergencyContact?: string;
  bankDetails?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  headId?: string;
  head?: Employee;
  employees?: Employee[];
  employeeCount?: number;
}

export interface Designation {
  id: string;
  title: string;
  description?: string;
  level?: number;
}

export interface EmployeeListParams {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  status?: EmployeeStatus;
  employmentType?: EmploymentType;
  managerId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EmployeeListResponse {
  data: Employee[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateEmployeeDto {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId?: string;
  designation?: string;
  managerId?: string;
  dateOfJoining: string;
  employmentStatus?: string;
}

export interface UpdateEmployeeDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: string;
  departmentId?: string;
  designation?: string;
  managerId?: string;
  employmentType?: EmploymentType;
  status?: EmployeeStatus;
  address?: string;
  emergencyContact?: string;
  bankDetails?: string;
}

export interface EmployeeStats {
  total: number;
  active: number;
  onLeave: number;
  terminated: number;
  byDepartment: { department: string; count: number }[];
  byEmploymentType: { type: string; count: number }[];
  newJoiners: number;
  avgTenure: number;
}
