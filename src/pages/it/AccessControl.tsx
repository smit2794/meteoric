import React, { useState } from 'react';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, UserX } from 'lucide-react';

interface AccessLog {
  id: number;
  user_name: string;
  system_app: string;
  access_level: 'Read' | 'Write' | 'Admin';
  granted_date: string;
  granted_by_name: string;
  status: 'Active' | 'Revoked';
}

const mockAccessLogs: AccessLog[] = [
  { id: 1, user_name: 'Dr. Dev Karve', system_app: 'ERP Finance', access_level: 'Admin', granted_date: '2026-01-10', granted_by_name: 'Smit Patel', status: 'Active' },
  { id: 2, user_name: 'Priya Sharma', system_app: 'CRM Hubspot', access_level: 'Write', granted_date: '2026-02-15', granted_by_name: 'Smit Patel', status: 'Active' },
  { id: 3, user_name: 'Rahul Desai', system_app: 'Jira QA', access_level: 'Read', granted_date: '2026-03-20', granted_by_name: 'Smit Patel', status: 'Revoked' }
];

export default function AccessControl() {
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(mockAccessLogs);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    user_name: '',
    system_app: 'ERP Finance',
    access_level: 'Read' as const,
    granted_date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user_name) {
      showError('Please enter an employee name');
      return;
    }
    
    const newLog: AccessLog = {
      id: Date.now(),
      user_name: formData.user_name,
      system_app: formData.system_app,
      access_level: formData.access_level,
      granted_date: formData.granted_date,
      granted_by_name: user?.name || 'Meteoric Admin',
      status: 'Active'
    };

    setAccessLogs([newLog, ...accessLogs]);
    showSuccess('Access privilege granted successfully.');
    setModalOpen(false);
    setFormData({ ...formData, user_name: '' });
  };

  const handleRevoke = (id: number) => {
    if (!window.confirm('Are you sure you want to revoke this access privilege?')) return;
    setAccessLogs(accessLogs.map(log => log.id === id ? { ...log, status: 'Revoked' } : log));
    showSuccess('Access privilege revoked.');
  };

  const columns = [
    { header: 'Employee', accessor: 'user_name', sortable: true },
    { header: 'System / App', accessor: 'system_app', sortable: true },
    {
      header: 'Access Level',
      accessor: 'access_level',
      sortable: true,
      render: (row: AccessLog) => (
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
          row.access_level === 'Admin' ? 'bg-rose-50 text-rose-700' :
          row.access_level === 'Write' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'
        }`}>{row.access_level}</span>
      )
    },
    { header: 'Granted Date', accessor: 'granted_date', sortable: true },
    { header: 'Granted By', accessor: 'granted_by_name' },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row: AccessLog) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row: AccessLog) => {
        if (row.status !== 'Active' || user?.role === 'executive') return <span className="text-slate-400 font-semibold text-xs">No Actions</span>;
        return (
          <button
            onClick={() => handleRevoke(row.id)}
            className="p-1 hover:bg-rose-50 rounded text-rose-600 transition-colors"
            title="Revoke Access"
          >
            <UserX className="w-4 h-4" />
          </button>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Access & Permissions Control</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Audit and grant user credentials/privileges for core enterprise systems at Meteoric Biopharmaceuticals.</p>
      </div>

      <DataTable
        columns={columns}
        data={accessLogs}
        searchKeys={['user_name', 'system_app', 'access_level', 'status']}
        searchPlaceholder="Search access records..."
        filters={[
          { label: 'System', accessor: 'system_app', options: ['AWS Cloud', 'CRM Hubspot', 'Jira QA', 'ERP Finance'] },
          { label: 'Status', accessor: 'status', options: ['Active', 'Revoked'] }
        ]}
        exportFileName="meteoric_access_control.csv"
        actions={
          user?.role !== 'executive' ? (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Grant Access</span>
            </button>
          ) : undefined
        }
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Grant System Access Credentials">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Employee Name</label>
            <input
              type="text"
              required
              value={formData.user_name}
              onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
              placeholder="e.g. Rahul Desai"
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">System / Application</label>
              <select
                value={formData.system_app}
                onChange={(e) => setFormData({ ...formData, system_app: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="AWS Cloud">AWS Cloud</option>
                <option value="CRM Hubspot">CRM Hubspot</option>
                <option value="Jira QA">Jira QA</option>
                <option value="ERP Finance">ERP Finance</option>
                <option value="Office 365">Office 365</option>
                <option value="GitHub Enterprise">GitHub Enterprise</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Access Level</label>
              <select
                value={formData.access_level}
                onChange={(e) => setFormData({ ...formData, access_level: e.target.value as any })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Read">Read-Only</option>
                <option value="Write">Write / Modify</option>
                <option value="Admin">Full Administrator</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Granted Date</label>
            <input
              type="date"
              required
              value={formData.granted_date}
              onChange={(e) => setFormData({ ...formData, granted_date: e.target.value })}
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
              Grant Access
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
