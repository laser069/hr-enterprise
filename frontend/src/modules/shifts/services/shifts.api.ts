import { apiClient } from '../../../core/api/api-client';
import type { Shift, CreateShiftDto, UpdateShiftDto } from '../types';

export const shiftsApi = {
  getShifts: () => apiClient.get<Shift[]>('/shifts'),
  getShift: (id: string) => apiClient.get<Shift>(`/shifts/${id}`),
  createShift: (data: CreateShiftDto) => apiClient.post<Shift>('/shifts', data),
  updateShift: (id: string, data: UpdateShiftDto) => apiClient.patch<Shift>(`/shifts/${id}`, data),
  deleteShift: (id: string) => apiClient.delete(`/shifts/${id}`),
};
