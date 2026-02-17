import { apiClient } from '../../../core/api/api-client';
import type { Department, CreateDepartmentDto, UpdateDepartmentDto } from '../types';

export const departmentApi = {
  list: (): Promise<Department[]> => {
    return apiClient.get<Department[]>('/departments');
  },

  get: (id: string): Promise<Department> => {
    return apiClient.get<Department>(`/departments/${id}`);
  },

  create: (data: CreateDepartmentDto): Promise<Department> => {
    return apiClient.post<Department>('/departments', data);
  },

  update: (id: string, data: UpdateDepartmentDto): Promise<Department> => {
    return apiClient.patch<Department>(`/departments/${id}`, data);
  },

  delete: (id: string): Promise<void> => {
    return apiClient.delete(`/departments/${id}`);
  },

  assignHead: (id: string, headId: string): Promise<Department> => {
    return apiClient.post<Department>(`/departments/${id}/head`, { headId });
  },
};
