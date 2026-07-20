import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { Plus, Eye, UserPlus, ToggleLeft, CheckSquare } from 'lucide-react';
import { Ticket } from '../../data/mockTickets';

export default function IncidentManagement() {
  const { tickets, addTicket, assignTicket, updateTicketStatus } = useAppData();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [modalOpen, setModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'IT' as const,
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
    description: ''
  });

  const [assigneeId, setAssigneeId] = useState('');
  const [ticketStatus, setTicketStatus] = useState<Ticket['status']>('New');

  // Hardcode techs for demo
  const techs = [
    { id: 2, name: 'Smit Patel', role: 'IT Manager' },
    { id: 3, name: 'Tech Support', role: 'ittech' }
  ];

  const itTickets = useMemo(() => tickets.filter(t => t.category === 'IT'), [tickets]);

  const handleOpenAssign = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setAssigneeId(ticket.assigned_to?.toString() || '');
    setAssignModalOpen(true);
  };

  const handleOpenStatus = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setTicketStatus(ticket.status);
    setStatusModalOpen(true);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !assigneeId) return;
    try {
      const tech = techs.find(t => t.id.toString() === assigneeId);
      if (tech) {
        assignTicket(selectedTicket.id, tech.id, tech.name);
        showSuccess('Ticket technician assigned successfully.');
      }
      setAssignModalOpen(false);
    } catch (err) {
      showError('Failed to assign ticket.');
    }
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      updateTicketStatus(selectedTicket.id, ticketStatus);
      showSuccess('Ticket status updated.');
      setStatusModalOpen(false);
    } catch (err) {
      showError('Failed to update ticket status.');
    }
  };

  const handleCloseTicket = (id: number) => {
    if (!window.confirm('Are you sure you want to close this incident?')) return;
    try {
      updateTicketStatus(id, 'Closed');
      showSuccess('Incident closed successfully.');
    } catch (err) {
      showError('Failed to close incident.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addTicket({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        raised_by: 1, // Mock user ID
        raised_by_name: user?.name || 'Meteoric Employee',
        assigned_to: null,
        assigned_to_name: ''
      });
      showSuccess('New support ticket raised successfully.');
      setModalOpen(false);
      setFormData({ title: '', category: 'IT', priority: 'Medium', description: '' });
    } catch (err) {
      showError('Failed to create ticket.');
    }
  };

  const calculateSLATimer = (deadline: string) => {
    if (!deadline) return 'N/A';
    const diff = new Date(deadline).getTime() - new Date().getTime();
    if (diff <= 0) return <span className="text-rose-600 font-bold">SLA Violated</span>;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours < 4) {
      return <span className="text-rose-500 font-bold animate-pulse">{hours}h {mins}m left</span>;
    }
    return <span className="text-slate-600">{hours}h {mins}m left</span>;
  };

  const columns = [
    { header: 'Ticket ID', accessor: 'ticket_id', sortable: true },
    { header: 'Subject', accessor: 'title', sortable: true, render: (row: Ticket) => <span className="font-semibold text-slate-800 line-clamp-1">{row.title}</span> },
    {
      header: 'Priority',
      accessor: 'priority',
      sortable: true,
      render: (row: Ticket) => {
        let color = 'bg-slate-100 text-slate-500 border-slate-200';
        if (row.priority === 'Critical') color = 'bg-rose-50 text-rose-700 border-rose-100';
        else if (row.priority === 'High') color = 'bg-amber-50 text-amber-700 border-amber-100';
        else if (row.priority === 'Medium') color = 'bg-indigo-50 text-indigo-700 border-indigo-100';
        return <span className={`px-2 py-0.5 rounded text-xs font-bold border ${color}`}>{row.priority}</span>;
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row: Ticket) => {
        let color = 'bg-slate-100 text-slate-500';
        if (row.status === 'New') color = 'bg-blue-50 text-blue-700';
        else if (row.status === 'In Progress') color = 'bg-amber-50 text-amber-700';
        else if (row.status === 'Resolved') color = 'bg-emerald-50 text-emerald-700';
        else if (row.status === 'Closed') color = 'bg-slate-100 text-slate-500';
        return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>{row.status}</span>;
      }
    },
    { header: 'Assigned Tech', accessor: 'assigned_to_name', render: (row: Ticket) => row.assigned_to_name || <span className="text-slate-400 font-semibold">Unassigned</span> },
    { header: 'Raised By', accessor: 'raised_by_name' },
    { header: 'SLA Timer', accessor: 'sla_deadline', render: (row: Ticket) => calculateSLATimer(row.sla_deadline) },
    {
      header: 'Actions',
      render: (row: Ticket) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/portal/it-department/tickets/${row.id}`)}
            className="p-1 hover:bg-slate-100 rounded text-indigo-600 transition-colors"
            title="View Details"
          >
            <Eye className="w-4.5 h-4.5" />
          </button>
          {user?.role !== 'executive' && (
            <button
              onClick={() => handleOpenAssign(row)}
              className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Assign Technician"
            >
              <UserPlus className="w-4.5 h-4.5" />
            </button>
          )}
          {user?.role !== 'executive' && (
            <button
              onClick={() => handleOpenStatus(row)}
              className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title={location.pathname.includes('/tickets') ? "Update Ticket" : "Update Incident Status"}
            >
              <ToggleLeft className="w-4.5 h-4.5" />
            </button>
          )}
          {user?.role !== 'executive' && row.status !== 'Closed' && (
            <button
              onClick={() => handleCloseTicket(row.id)}
              className="p-1 hover:bg-slate-100 rounded text-rose-600 transition-colors"
              title={location.pathname.includes('/tickets') ? "Close Ticket" : "Close Incident"}
            >
              <CheckSquare className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-xl font-bold text-slate-800">IT Incidents & Tickets</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Manage Meteoric Biopharmaceuticals network failures, laptop support requests, and tech incidents SLA tracking.</p>
      </div>

      <DataTable
        columns={columns}
        data={itTickets}
        searchKeys={['ticket_id', 'title', 'priority', 'status', 'assigned_to_name', 'raised_by_name']}
        searchPlaceholder="Search support tickets..."
        filters={[
          { label: 'Priority', accessor: 'priority', options: ['Low', 'Medium', 'High', 'Critical'] },
          { label: 'Status', accessor: 'status', options: ['New', 'In Progress', 'Resolved', 'Closed'] }
        ]}
        exportFileName="meteoric_it_tickets.csv"
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        }
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Raise IT Support Ticket">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Ticket Title / Subject</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Printer offline or VPN connection failure"
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Category</label>
              <select
                disabled
                value={formData.category}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
              >
                <option value="IT">IT Infrastructure</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">SLA Severity Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Low">Low (72h SLA)</option>
                <option value="Medium">Medium (48h SLA)</option>
                <option value="High">High (24h SLA)</option>
                <option value="Critical">Critical (4h SLA)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Issue Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a detailed description of the incident..."
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Support Technician">
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Select IT Staff member</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">Unassigned</option>
              {techs.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              Assign Staff
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={statusModalOpen} onClose={() => setStatusModalOpen(false)} title="Change Ticket Status">
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Select Status</label>
            <select
              value={ticketStatus}
              onChange={(e) => setTicketStatus(e.target.value as any)}
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              Update Status
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
