import React, { useState } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { CreateTicketModal } from '../components/CreateTicketModal';
import { useTickets, useHelpdeskStats } from '../hooks/useHelpdesk';
import { Plus, Ticket as TicketIcon, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../shared/components/ui/DataTable';
import { Badge } from '../../../shared/components/ui/Badge';
import { format } from 'date-fns';

const HelpdeskDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: stats, isLoading: statsLoading } = useHelpdeskStats();
  const { data: ticketsData, isLoading: ticketsLoading } = useTickets({ take: 5 });
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'blue';
      case 'in_progress': return 'yellow';
      case 'resolved': return 'green';
      case 'closed': return 'gray';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'gray';
      default: return 'gray';
    }
  };

  const columns = [
    {
      header: 'Subject',
      accessorKey: 'title',
      cell: (info: any) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{info.getValue()}</div>
          <div className="text-xs text-slate-500">{info.row.original.id.slice(0, 8)}</div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessorKey: 'category',
      cell: (info: any) => (
        <span className="capitalize">{info.getValue().replace('_', ' ')}</span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => (
        <Badge variant={getStatusColor(info.getValue()) as any}>
          {info.getValue().replace('_', ' ')}
        </Badge>
      ),
    },
    {
      header: 'Priority',
      accessorKey: 'priority',
      cell: (info: any) => (
        <Badge variant={getPriorityColor(info.getValue()) as any}>
          {info.getValue()}
        </Badge>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'createdAt',
      cell: (info: any) => format(new Date(info.getValue()), 'MMM d, yyyy'),
    },
    {
      id: 'actions',
      cell: (info: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/helpdesk/tickets/${info.row.original.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Helpdesk</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage support tickets and inquiries</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/helpdesk/tickets')}>
                View All Tickets
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Open Tickets</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.open || 0}</h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
              <TicketIcon className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">In Progress</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.inProgress || 0}</h3>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Resolved</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.resolved || 0}</h3>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Critical Priority</p>
              {/* Note: Backend stats usually return status breakdown, we might need a separate call or specific processing for critical count if needed. For now using placeholder or if standard stats extended */}
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">-</h3>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Tickets</h2>
        </div>
        {ticketsLoading ? (
            <div>Loading...</div>
        ) : (
            <DataTable
            data={ticketsData?.data || []}
            columns={columns}
            />
        )}
      </Card>

      <CreateTicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default HelpdeskDashboard;
