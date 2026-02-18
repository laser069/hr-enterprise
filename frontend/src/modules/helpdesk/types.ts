export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'it_support' | 'hr_query' | 'payroll_issue' | 'other';
  requesterId: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  requester?: {
    id: string;
    email: string;
    employee?: {
      firstName: string;
      lastName: string;
    };
  };
  assignee?: {
    id: string;
    email: string;
    employee?: {
      firstName: string;
      lastName: string;
    };
  };
  _count?: {
    comments: number;
  };
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    employee?: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface CreateTicketDTO {
  title: string;
  description: string;
  category: string;
  priority?: string;
}

export interface TicketStats {
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  total: number;
}
