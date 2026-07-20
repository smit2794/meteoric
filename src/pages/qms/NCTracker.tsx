import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { Plus, CheckCircle, RotateCw } from 'lucide-react';

export default function NCTracker() {
  const { ncs, addNC, updateNC, closeNC, demoRole } = useAppData();
  const { hasActionPermission } = useAuth();
  const { showSuccess, showError } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [capaModalOpen, setCapaModalOpen] = useState(false);
  const [selectedNc, setSelectedNc] = useState<any>(null);
  
  const canCreate = hasActionPermission('qms', 'create');
  const canEdit = hasActionPermission('qms', 'edit');

  const [formData, setFormData] = useState({
    description: '',
    department: 'Quality Assurance',
    due_date: new Date().toISOString().split('T')[0],
    assigned_name: `${demoRole} User`
  });

  const [capaData, setCapaData] = useState({
    root_cause: '',
    corrective_action: '',
    status: 'In Progress'
  });

  const handleOpenCapa = (nc: any) => {
    setSelectedNc(nc);
    setCapaData({
      root_cause: nc.root_cause || '',
      corrective_action: nc.corrective_action || '',
      status: nc.status === 'Open' ? 'In Progress' : nc.status
    });
    setCapaModalOpen(true);
  };

  const handleCloseNC = (id: number) => {
    try {
      closeNC(id);
      showSuccess('Non-Conformance marked as Closed.');
    } catch (err) {
      showError('Failed to close NC.');
    }
  };

  const handleCapaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNc) return;
    try {
      updateNC(selectedNc.id, {
        root_cause: capaData.root_cause,
        corrective_action: capaData.corrective_action,
        status: capaData.status as any
      });
      showSuccess('CAPA corrective action plan updated.');
      setCapaModalOpen(false);
    } catch (err) {
      showError('Failed to save CAPA plan.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addNC({
        description: formData.description,
        department: formData.department,
        due_date: formData.due_date,
        assigned_name: formData.assigned_name
      } as any);
      showSuccess('Non-Conformance report raised successfully.');
      setModalOpen(false);
      setFormData({ ...formData, description: '' });
    } catch (err) {
      showError('Failed to raise Non-Conformance.');
    }
  };

  const columns = [
    { header: 'NC ID', accessor: 'nc_id', sortable: true, render: (row: any) => <span className="font-bold text-rose-600">{row.nc_id}</span> },
    { header: 'Deviation Description', accessor: 'description', render: (row: any) => <span className="font-semibold text-slate-800 line-clamp-1 max-w-xs">{row.description}</span> },
    { header: 'Department', accessor: 'department', sortable: true },
    { header: 'CAPA Owner', accessor: 'assigned_name', sortable: true },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row: any) => {
        let color = 'bg-slate-100 text-slate-500';
        if (row.status === 'Closed') color = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
        else if (row.status === 'In Progress') color = 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse';
        else if (row.status === 'Open') color = 'bg-rose-50 text-rose-700 border border-rose-100';
        return <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${color}`}>{row.status}</span>;
      }
    },
    { header: 'Corrective Action Due', accessor: 'due_date', sortable: true },
    {
      header: 'Actions',
      render: (row: any) => (
        <div className="flex items-center gap-1.5">
          {row.status !== 'Closed' && (
            <>
              <button
                onClick={() => handleOpenCapa(row)}
                disabled={!canEdit}
                className={`flex items-center gap-0.5 px-2 py-1 border rounded text-xs font-semibold ${canEdit ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                title="Define Root Cause & CAPA"
              >
                <RotateCw className="w-3 h-3" />
                <span>CAPA</span>
              </button>
              <button
                onClick={() => handleCloseNC(row.id)}
                disabled={!canEdit}
                className={`flex items-center gap-0.5 px-2 py-1 text-white rounded text-xs font-semibold shadow-sm ${canEdit ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-300 cursor-not-allowed'}`}
                title="Close NC Report"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </>
          )}
          {row.status === 'Closed' && (
            <span className="text-[10px] font-bold text-slate-400">Locked / Resolved</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Non-Conformance & CAPA Tracker</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Audit quality deviations (NC) and log corrective & preventive action plans (CAPA) for Meteoric Biopharmaceuticals.</p>
      </div>

      <DataTable
        columns={columns}
        data={ncs}
        searchKeys={['nc_id', 'description', 'department', 'assigned_name']}
        searchPlaceholder="Search non-conformances..."
        filters={[
          { label: 'Department', accessor: 'department', options: ['Quality Assurance', 'IT Department', 'Sales & CRM', 'Production & Logistics', 'Administration Office'] },
          { label: 'Status', accessor: 'status', options: ['Open', 'In Progress', 'Closed'] }
        ]}
        exportFileName="qms_non_conformances.csv"
        actions={
          <button
            onClick={() => setModalOpen(true)}
            disabled={!canCreate}
            className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold rounded-lg shadow-sm ${canCreate ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          >
            <Plus className="w-4 h-4" />
            <span>Raise NC</span>
          </button>
        }
      />

      {/* Raise NC Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Raise Compliance Non-Conformance (NC)">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Deviation Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the quality deviation, out-of-spec test, or compliance failure..."
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="IT Department">IT Department</option>
                <option value="Sales & CRM">Sales & CRM</option>
                <option value="Production & Logistics">Production & Logistics</option>
                <option value="Administration Office">Administration Office</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Resolution Due Date</label>
              <input
                type="date"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Assign CAPA Owner</label>
            <input
              type="text"
              disabled
              value={formData.assigned_name}
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 focus:outline-none"
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
              disabled={!canCreate}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Raise NC Report
            </button>
          </div>
        </form>
      </Modal>

      {/* Define CAPA Modal */}
      <Modal isOpen={capaModalOpen} onClose={() => setCapaModalOpen(false)} title={`Define Corrective Action (CAPA): ${selectedNc?.nc_id}`}>
        <form onSubmit={handleCapaSubmit} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed font-semibold">
            Deviation: <strong>{selectedNc?.description}</strong>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Root Cause Investigation</label>
            <textarea
              required
              rows={3}
              value={capaData.root_cause}
              onChange={(e) => setCapaData({ ...capaData, root_cause: e.target.value })}
              placeholder="Why did this failure occur? Identify the root cause..."
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Corrective & Preventive Action Plan</label>
            <textarea
              required
              rows={3}
              value={capaData.corrective_action}
              onChange={(e) => setCapaData({ ...capaData, corrective_action: e.target.value })}
              placeholder="What actions are taken to resolve this and prevent recurrence..."
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Fulfillment Stage</label>
            <select
              value={capaData.status}
              onChange={(e) => setCapaData({ ...capaData, status: e.target.value })}
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="In Progress">In Progress (Under Action)</option>
              <option value="Closed">Closed (Deviation Resolved)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCapaModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canEdit}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Save CAPA Plan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
