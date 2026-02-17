// Employee Types

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'SUSPENDED';
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
  designation?: string; // Backend returns string, not object
  managerId?: string;
  manager?: Employee;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  employmentStatus?: string; // Matching backend field
  dateOfJoining: string;
  endDate?: string;
  address?: string; // Backend stores as string
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

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface EmergencyContact {
  name?: string;
  relationship?: string;
  phone?: string;
}

export interface BankDetails {
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
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
  gender?: Gender;
  dateOfBirth?: string;
  departmentId?: string;
  designation?: string;
  managerId?: string;
  employmentType: EmploymentType;
  dateOfJoining: string;
  address?: string;
  emergencyContact?: string;
  bankDetails?: string;
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
