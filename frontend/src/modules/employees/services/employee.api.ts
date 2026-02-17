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
    return apiClient.get<EmployeeStats>('/employees/stats');
  },

  // Get employees by department
  getByDepartment: async (departmentId: string): Promise<Employee[]> => {
    return apiClient.get<Employee[]>(`/departments/${departmentId}/employees`);
  },

  // Get employees reporting to a manager
  getSubordinates: async (managerId: string): Promise<Employee[]> => {
    return apiClient.get<Employee[]>(`/employees/${managerId}/subordinates`);
  },

  // Upload profile picture
  uploadProfilePicture: async (id: string, file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<{ url: string }>(
      `/employees/${id}/profile-picture`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
  },

  // Export employees to CSV
  exportCsv: async (params?: EmployeeListParams): Promise<Blob> => {
    // We use directly axios for blob responses as apiClient.get unwraps data
    // actually, let's keep it simple or implement getBlob in apiClient if needed
    // for now, use the raw axiosInstance via apiClient for special cases if needed
    // but better to have it in apiClient
    return apiClient.get<Blob>('/employees/export', {
      params,
      responseType: 'blob',
    });
  },
};
