import React, { useState } from 'react';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Check, X } from 'lucide-react';

interface ServiceRequest {
  id: number;
  request_id: string;
  type: string;
  requested_by_name: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approver_name: string | null;
  notes: string;
}

const mockRequests: ServiceRequest[] = [
  { id: 1, request_id: 'REQ-HW-001', type: 'Hardware', requested_by_name: 'Dr. Dev Karve', status: 'Pending', approver_name: null, notes: 'Need a new monitor for the lab.' },
  { id: 2, request_id: 'REQ-SW-002', type: 'Software License', requested_by_name: 'Smit Patel', status: 'Approved', approver_name: 'Admin', notes: 'Adobe Creative Cloud renewal.' }
];

export default function ServiceRequests() {
  const [requests, setRequests] = useState<ServiceRequest[]>(mockRequests);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();
  const { showSuccess } = useToast();

  const [formData, setFormData] = useState({
    type: 'Hardware',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: ServiceRequest = {
      id: Date.now(),
      request_id: `REQ-${formData.type.substring(0,2).toUpperCase()}-${Date.now().toString().slice(-3)}`,
      type: formData.type,
      requested_by_name: user?.name || 'Meteoric Employee',
      status: 'Pending',
      approver_name: null,
      notes: formData.notes
    };
    setRequests([newReq, ...requests]);
    showSuccess('Service request submitted successfully.');
    setModalOpen(false);
    setFormData({ type: 'Hardware', notes: '' });
  };

  const handleResolveStatus = (id: number, status: 'Approved' | 'Rejected') => {
    setRequests(requests.map(r => r.id === id ? { ...r, status, approver_name: user?.name || 'Admin' } : r));
    showSuccess(`Request ${status.toLowerCase()} successfully.`);
  };

  const columns = [
    { header: 'Request ID', accessor: 'request_id', sortable: true },
    { header: 'Request Type', accessor: 'type', sortable: true },
    { header: 'Requested By', accessor: 'requested_by_name', sortable: true },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row: ServiceRequest) => {
        let color = 'bg-slate-100 text-slate-500';
        if (row.status === 'Approved') color = 'bg-emerald-50 text-emerald-700';
        else if (row.status === 'Rejected') color = 'bg-rose-50 text-rose-700';
        else if (row.status === 'Pending') color = 'bg-amber-50 text-amber-700';
        return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>{row.status}</span>;
      }
    },
    { header: 'Approver', accessor: 'approver_name', render: (row: ServiceRequest) => row.approver_name || <span className="text-slate-400">N/A</span> },
    { header: 'Details / Notes', accessor: 'notes', render: (row: ServiceRequest) => <span className="text-slate-600 font-semibold line-clamp-1 max-w-xs">{row.notes}</span> },
    {
      header: 'Actions',
      render: (row: ServiceRequest) => {
        const canApprove = (user?.role === 'manager' || user?.role === 'admin') && row.status === 'Pending';
        if (!canApprove) return <span className="text-slate-400 font-semibold text-xs">No Actions</span>;

        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleResolveStatus(row.id, 'Approved')}
              className="p-1 bg-emerald-50 hover:bg-emerald-100 rounded text-emerald-600 transition-colors"
              title="Approve"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleResolveStatus(row.id, 'Rejected')}
              className="p-1 bg-rose-50 hover:bg-rose-100 rounded text-rose-600 transition-colors"
              title="Reject"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-xl font-bold text-slate-800">IT Service Requests</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Request hardware provisions, software licenses, or directory access privileges for Meteoric Biopharmaceuticals employees.</p>
      </div>

      <DataTable
        columns={columns}
        data={requests}
        searchKeys={['request_id', 'type', 'requested_by_name', 'notes']}
        searchPlaceholder="Search requests..."
        filters={[
          { label: 'Type', accessor: 'type', options: ['Hardware', 'Software License', 'Access Privilege', 'Other'] },
          { label: 'Status', accessor: 'status', options: ['Pending', 'Approved', 'Rejected'] }
        ]}
        exportFileName="it_service_requests.csv"
        actions={
          user?.role !== 'executive' ? (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Request</span>
            </button>
          ) : undefined
        }
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Submit IT Service Request">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Request Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="Hardware">Hardware Provision (e.g. laptop, monitor)</option>
              <option value="Software License">Software License (e.g. Adobe, Office)</option>
              <option value="Access Privilege">Access Privilege (e.g. AWS console, GitHub)</option>
              <option value="Other">Other Request</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Justification Notes</label>
            <textarea
              required
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Explain the business need or specification required..."
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
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
