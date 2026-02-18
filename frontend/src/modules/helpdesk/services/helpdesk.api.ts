import { api } from '../../../core/api/api';
import { Ticket, CreateTicketDTO, TicketComment, TicketStats } from '../types';

export const helpdeskApi = {
  getTickets: async (params?: { status?: string; priority?: string; category?: string; skip?: number; take?: number }) => {
    const { data } = await api.get<{ data: Ticket[]; meta: any }>('/helpdesk/tickets', { params });
    return data;
  },

  getTicket: async (id: string) => {
    const { data } = await api.get<Ticket & { comments: TicketComment[] }>(`/helpdesk/tickets/${id}`);
    return data;
  },

  createTicket: async (ticket: CreateTicketDTO) => {
    const { data } = await api.post<Ticket>('/helpdesk/tickets', ticket);
    return data;
  },

  updateStatus: async (id: string, status: string) => {
    const { data } = await api.patch<Ticket>(`/helpdesk/tickets/${id}`, { status });
    return data;
  },

  addComment: async (id: string, content: string) => {
    const { data } = await api.post<TicketComment>(`/helpdesk/tickets/${id}/comments`, { content });
    return data;
  },

  getStats: async () => {
    const { data } = await api.get<TicketStats>('/helpdesk/stats');
    return data;
  },
};
