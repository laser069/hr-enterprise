import { apiClient } from '../../../core/api/api-client';
import type { Holiday, CreateHolidayDto, UpdateHolidayDto } from '../types';

export const holidaysApi = {
  getHolidays: (params?: { year?: number }) => 
    apiClient.get<Holiday[]>('/holidays', { params }),
  getHoliday: (id: string) => apiClient.get<Holiday>(`/holidays/${id}`),
  createHoliday: (data: CreateHolidayDto) => apiClient.post<Holiday>('/holidays', data),
  updateHoliday: (id: string, data: UpdateHolidayDto) => apiClient.patch<Holiday>(`/holidays/${id}`, data),
  deleteHoliday: (id: string) => apiClient.delete(`/holidays/${id}`),
};
