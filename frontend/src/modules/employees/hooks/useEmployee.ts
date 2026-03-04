import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '../services/employee.api';
import type {
  EmployeeListParams,
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from '../types';

// Query keys
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (params: EmployeeListParams) => [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
  stats: () => [...employeeKeys.all, 'stats'] as const,
  subordinates: (id: string) => [...employeeKeys.all, 'subordinates', id] as const,
  history: (id: string) => [...employeeKeys.all, 'history', id] as const,
};

// List employees hook
export function useEmployees(params: EmployeeListParams = {}) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeeApi.list(params),
  });
}

// Get single employee hook
export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeeApi.get(id),
    enabled: !!id,
  });
}

// Get employee stats hook
export function useEmployeeStats() {
  return useQuery({
    queryKey: employeeKeys.stats(),
    queryFn: () => employeeApi.getStats(),
  });
}

// Get subordinates hook
export function useSubordinates(managerId: string) {
  return useQuery({
    queryKey: employeeKeys.subordinates(managerId),
    queryFn: () => employeeApi.getSubordinates(managerId),
    enabled: !!managerId,
  });
}

// Create employee hook
export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeDto) => employeeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.stats() });
    },
  });
}

// Update employee hook
export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeDto }) =>
      employeeApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

// Delete employee hook
export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.stats() });
    },
  });
}

// Get employee history hook
export function useEmployeeHistory(id: string) {
  return useQuery({
    queryKey: employeeKeys.history(id),
    queryFn: () => employeeApi.getHistory(id),
    enabled: !!id,
  });
}

