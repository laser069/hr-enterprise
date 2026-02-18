import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { holidaysApi } from '../services/holidays.api';
import type { UpdateHolidayDto } from '../types';

export const useHolidays = (year?: number) => {
  return useQuery({
    queryKey: ['holidays', { year }],
    queryFn: () => holidaysApi.getHolidays({ year }),
  });
};

export const useHoliday = (id: string) => {
  return useQuery({
    queryKey: ['holidays', id],
    queryFn: () => holidaysApi.getHoliday(id),
    enabled: !!id,
  });
};

export const useCreateHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: holidaysApi.createHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });
};

export const useUpdateHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHolidayDto }) =>
      holidaysApi.updateHoliday(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });
};

export const useDeleteHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: holidaysApi.deleteHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });
};
