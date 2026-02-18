import { apiClient } from '../../../core/api/api-client';
import type {
  Employee,
  EmployeeListParams,
  EmployeeListResponse,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeStats,
} from '../types';

export const employeeApi = {
  // List employees with pagination and filters
  list: async (params: EmployeeListParams): Promise<EmployeeListResponse> => {
    return apiClient.getPaginated<Employee>('/employees', { params });
  },

  // Get single employee by ID
  get: async (id: string): Promise<Employee> => {
    return apiClient.get<Employee>(`/employees/${id}`);
  },

  // Create new employee
  create: async (data: CreateEmployeeDto): Promise<Employee> => {
    return apiClient.post<Employee>('/employees', data);
  },

  // Update employee
  update: async (id: string, data: UpdateEmployeeDto): Promise<Employee> => {
    return apiClient.patch<Employee>(`/employees/${id}`, data);
  },

  // Delete employee
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/employees/${id}`);
  },

  // Get employee statistics
  getStats: async (): Promise<EmployeeStats> => {
    return apiClient.get<EmployeeStats>('/employees/statistics');
  },

  // Get employees by department
  getByDepartment: async (departmentId: string): Promise<Employee[]> => {
    return apiClient.get<Employee[]>('/employees', { params: { departmentId } });
  },

  // Get employees reporting to a manager
  getSubordinates: async (managerId: string): Promise<Employee[]> => {
    return apiClient.get<Employee[]>(`/employees/${managerId}/team`);
  },

  // Get full organization hierarchy
  getHierarchy: async (): Promise<any> => {
    return apiClient.get('/employees/hierarchy');
  },
};
