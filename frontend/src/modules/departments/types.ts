// Department Types

export interface Department {
  id: string;
  name: string;
  description?: string;
  headId?: string;
  createdAt: string;
  updatedAt: string;
  head?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  employees?: { id: string; firstName: string; lastName: string; email: string; employeeCode: string; profilePicture?: string; designation?: string; employmentStatus?: string; status?: string; }[];
  employeeCount?: number;
}

export interface CreateDepartmentDto {
  name: string;
  description?: string;
  headId?: string;
}

export interface UpdateDepartmentDto {
  name?: string;
  description?: string;
  headId?: string;
}

export interface DepartmentListParams {
  page?: number;
  limit?: number;
  search?: string;
}
