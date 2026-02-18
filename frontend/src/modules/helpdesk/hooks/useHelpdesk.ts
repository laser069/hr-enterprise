import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { helpdeskApi } from '../services/helpdesk.api';
import { CreateTicketDTO } from '../types';

export const useTickets = (params?: { status?: string; priority?: string; skip?: number; take?: number }) => {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: () => helpdeskApi.getTickets(params),
  });
};

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => helpdeskApi.getTicket(id),
    enabled: !!id,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTicketDTO) => helpdeskApi.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['helpdesk-stats'] });
    },
  });
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => helpdeskApi.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['helpdesk-stats'] });
    },
  });
};

export const useAddTicketComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => helpdeskApi.addComment(id, content),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
    },
  });
};

export const useHelpdeskStats = () => {
  return useQuery({
    queryKey: ['helpdesk-stats'],
    queryFn: helpdeskApi.getStats,
  });
};
