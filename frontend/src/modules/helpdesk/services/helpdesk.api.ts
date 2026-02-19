import { apiClient } from '../../../core/api/api-client';
import type { Ticket, CreateTicketDTO, TicketComment, TicketStats } from '../types';

export const helpdeskApi = {
  getTickets: async (params?: { status?: string; priority?: string; category?: string; skip?: number; take?: number }) => {
    return apiClient.getPaginated<Ticket>('/helpdesk/tickets', { params });
  },

  getTicket: async (id: string) => {
    return apiClient.get<Ticket & { comments: TicketComment[] }>(`/helpdesk/tickets/${id}`);
  },

  createTicket: async (ticket: CreateTicketDTO) => {
    return apiClient.post<Ticket>('/helpdesk/tickets', ticket);
  },

  updateStatus: async (id: string, status: string) => {
    return apiClient.patch<Ticket>(`/helpdesk/tickets/${id}`, { status });
  },

  addComment: async (id: string, content: string) => {
    return apiClient.post<TicketComment>(`/helpdesk/tickets/${id}/comments`, { content });
  },

  getStats: async () => {
    return apiClient.get<TicketStats>('/helpdesk/stats');
  },
};
