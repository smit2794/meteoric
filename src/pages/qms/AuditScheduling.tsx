import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { Plus, Eye, Play } from 'lucide-react';

export default function AuditScheduling() {
  const { audits, addAudit, updateAuditChecklist, demoRole } = useAppData();
  const { hasActionPermission } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Internal',
    department: 'QA Lab',
    scheduled_date: new Date().toISOString().split('T')[0],
    auditor_name: `${demoRole} User`
  });

  const canCreate = hasActionPermission('qms', 'create');
  const canEdit = hasActionPermission('qms', 'edit');

  const handleStartAudit = (id: number) => {
    try {
      const audit = audits.find(a => a.id === id);
      if (audit) {
        updateAuditChecklist(id, audit.checklist || [], 'In Progress');
        showSuccess('Audit started. Checklist is now editable.');
        navigate(`/qms/audits/${id}`);
      }
    } catch (err) {
      showError('Failed to start audit.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addAudit({
        type: formData.type as any,
        department: formData.department as any,
        scheduled_date: formData.scheduled_date,
        auditor_name: formData.auditor_name,
        auditor_id: 1
      });
      showSuccess('Compliance audit scheduled successfully.');
      setModalOpen(false);
    } catch (err) {
      showError('Failed to schedule audit.');
    }
  };

  const columns = [
    { header: 'Audit ID', accessor: 'audit_id', sortable: true, render: (row: any) => <span className="font-bold text-slate-500">{row.audit_id}</span> },
    {
      header: 'Audit Scope Type',
      accessor: 'type',
      sortable: true,
      render: (row: any) => (
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
          row.type === 'Internal' ? 'bg-indigo-50 text-indigo-700' : 'bg-purple-50 text-purple-700'
        }`}>{row.type}</span>
      )
    },
    { header: 'Audited Department', accessor: 'department', sortable: true },
    { header: 'Scheduled Date', accessor: 'scheduled_date', sortable: true },
    { header: 'Lead Auditor', accessor: 'auditor_name', sortable: true },
    {
      header: 'Audit Status',
      accessor: 'status',
      sortable: true,
      render: (row: any) => {
        let color = 'bg-slate-100 text-slate-500';
        if (row.status === 'Completed') color = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
        else if (row.status === 'In Progress') color = 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse';
        else if (row.status === 'Scheduled') color = 'bg-blue-50 text-blue-700 border border-blue-100';
        return <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${color}`}>{row.status}</span>;
      }
    },
    {
      header: 'Actions',
      render: (row: any) => (
        <div className="flex items-center gap-1.5">
          {row.status === 'Scheduled' && (
            <button
              onClick={() => handleStartAudit(row.id)}
              disabled={!canEdit}
              className={`flex items-center gap-0.5 px-2 py-1 rounded text-xs font-semibold ${canEdit ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-300 text-white cursor-not-allowed'}`}
              title="Start Audit Checklist"
            >
              <Play className="w-3 h-3" />
              <span>Start</span>
            </button>
          )}
          {row.status !== 'Scheduled' && (
            <button
              onClick={() => navigate(`/qms/audits/${row.id}`)}
              className="flex items-center gap-0.5 px-2 py-1 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold"
              title="View Checklist Execution details"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>Checklist</span>
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Compliance Audit Scheduling</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Schedule internal/external quality audits, assign lead auditors, and track checklist execution status for Meteoric Biopharmaceuticals.</p>
      </div>

      <DataTable
        columns={columns}
        data={audits}
        searchKeys={['audit_id', 'department', 'auditor_name', 'status']}
        searchPlaceholder="Search audits scheduled..."
        filters={[
          { label: 'Type', accessor: 'type', options: ['Internal', 'External'] },
          { label: 'Status', accessor: 'status', options: ['Scheduled', 'In Progress', 'Completed'] }
        ]}
        exportFileName="meteoric_audits.csv"
        actions={
          <button
            onClick={() => setModalOpen(true)}
            disabled={!canCreate}
            className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold rounded-lg shadow-sm ${canCreate ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Audit</span>
          </button>
        }
      />

      {/* Schedule Audit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Compliance Audit">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Audit Scope Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Internal">Internal Quality Audit</option>
                <option value="External">External Regulatory Audit</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Lead Auditor</label>
              <input
                type="text"
                disabled
                value={formData.auditor_name}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Audited Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="QA Lab">QA Lab</option>
                <option value="IT Department">IT Department</option>
                <option value="Sales & CRM">Sales & CRM</option>
                <option value="Production">Production</option>
                <option value="Admin & Logistics">Admin & Logistics</option>
                <option value="R&D Center">R&D Center</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Scheduled Date</label>
              <input
                type="date"
                required
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
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
              disabled={!canCreate}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Schedule Audit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
