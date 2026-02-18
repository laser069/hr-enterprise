import React, { useState } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { useTickets } from '../hooks/useHelpdesk';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../shared/components/ui/DataTable';
import { Badge } from '../../../shared/components/ui/Badge';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { CreateTicketModal } from '../components/CreateTicketModal';

const TicketListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  
  const { data: ticketsData, isLoading } = useTickets({ 
    skip: page * 10, 
    take: 10,
    status: filterStatus 
  });
  
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
      header: 'ID',
      accessorKey: 'id',
      cell: (info: any) => (
        <div className="font-mono text-xs">{info.getValue().slice(0, 8)}</div>
      ),
    },
    {
      header: 'Subject',
      accessorKey: 'title',
      cell: (info: any) => (
        <div className="font-medium text-slate-900 dark:text-white">{info.getValue()}</div>
      ),
    },
    {
      header: 'Requester',
      accessorKey: 'requester',
      cell: (info: any) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {info.getValue()?.employee?.firstName} {info.getValue()?.employee?.lastName}
          </span>
          <span className="text-xs text-slate-500">{info.getValue()?.email}</span>
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
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All Tickets</h1>
          <p className="text-slate-500 dark:text-slate-400">View and manage support requests</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex gap-2 mb-4">
          <Button 
            variant={!filterStatus ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setFilterStatus(undefined)}
          >
            All
          </Button>
          <Button 
            variant={filterStatus === 'open' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setFilterStatus('open')}
          >
            Open
          </Button>
          <Button 
            variant={filterStatus === 'in_progress' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setFilterStatus('in_progress')}
          >
            In Progress
          </Button>
          <Button 
            variant={filterStatus === 'resolved' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setFilterStatus('resolved')}
          >
            Resolved
          </Button>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <DataTable
            data={ticketsData?.data || []}
            columns={columns}
          />
        )}
        
        {/* Simple Pagination */}
        <div className="flex justify-between items-center mt-4">
            <Button 
                variant="outline" 
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
            >
                Previous
            </Button>
            <span className="text-sm text-slate-500">
                Page {page + 1} of {ticketsData?.meta?.totalPages || 1}
            </span>
            <Button 
                variant="outline" 
                disabled={!ticketsData?.meta || page >= ticketsData.meta.totalPages - 1}
                onClick={() => setPage(p => p + 1)}
            >
                Next
            </Button>
        </div>
      </Card>

      <CreateTicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default TicketListPage;
