import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTicket, useAddTicketComment, useUpdateTicketStatus } from '../hooks/useHelpdesk';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { format } from 'date-fns';
import { User, MessageSquare, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../../../core/auth/auth-context';

const TicketDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: ticket, isLoading } = useTicket(id!);
  const addComment = useAddTicketComment();
  const updateStatus = useUpdateTicketStatus();
  const { user } = useAuth();
  
  const [comment, setComment] = useState('');

  if (isLoading) return <div>Loading...</div>;
  if (!ticket) return <div>Ticket not found</div>;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    addComment.mutate({ id: ticket.id, content: comment }, {
      onSuccess: () => setComment('')
    });
  };

  const handleStatusChange = (status: string) => {
    updateStatus.mutate({ id: ticket.id, status });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'blue';
      case 'in_progress': return 'yellow';
      case 'resolved': return 'green';
      case 'closed': return 'gray';
      default: return 'gray';
    }
  };

  // Check if current user is admin or HR to allow status updates
  const canManage = user?.role?.name === 'admin' || user?.role?.name === 'hr';

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{ticket.title}</h1>
          <div className="flex gap-2">
            <Badge variant={getStatusColor(ticket.status) as any}>{ticket.status.replace('_', ' ')}</Badge>
            <Badge variant="outline">{ticket.priority}</Badge>
            <Badge variant="outline">{ticket.category.replace('_', ' ')}</Badge>
          </div>
        </div>
        {canManage && (
          <div className="flex gap-2">
            {ticket.status !== 'in_progress' && (
              <Button size="sm" onClick={() => handleStatusChange('in_progress')}>Mark In Progress</Button>
            )}
            {ticket.status !== 'resolved' && (
              <Button size="sm" variant="outline" className="text-green-600 border-green-600" onClick={() => handleStatusChange('resolved')}>Resolve</Button>
            )}
            {ticket.status !== 'closed' && (
              <Button size="sm" variant="outline" onClick={() => handleStatusChange('closed')}>Close</Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{ticket.description}</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Comments
            </h3>
            
            <div className="space-y-6 mb-6">
              {ticket.comments?.map((comment: any) => (
                <div key={comment.id} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">
                            {comment.user.employee?.firstName} {comment.user.employee?.lastName || 'Unknown'}
                        </span>
                        <span className="text-xs text-slate-500">
                            {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                        </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))}
              {ticket.comments?.length === 0 && (
                <p className="text-slate-500 text-center py-4">No comments yet</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-3">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Type your comment..."
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <Button type="submit" disabled={!comment.trim() || addComment.isPending}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase">Ticket Info</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Requester</label>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                        {ticket.requester?.employee?.firstName?.[0]}
                    </div>
                    <span className="text-sm font-medium">
                        {ticket.requester?.employee?.firstName} {ticket.requester?.employee?.lastName}
                    </span>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Created</label>
                <span className="text-sm">{format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a')}</span>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Assigned To</label>
                <span className="text-sm">
                    {ticket.assignee ? (
                        `${ticket.assignee.employee?.firstName} ${ticket.assignee.employee?.lastName}`
                    ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                    )}
                </span>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">ID</label>
                <span className="text-sm font-mono">{ticket.id}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
