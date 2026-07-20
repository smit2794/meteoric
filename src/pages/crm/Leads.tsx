import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Plus, Eye, UserCheck, Edit2 } from 'lucide-react';
import { Lead } from '../../data/mockLeads';

export default function Leads() {
  const { leads, addLead, updateLead } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess } = useToast();

  const MOCK_REPS = [
    { id: 1, name: 'Admin User', role: 'admin' },
    { id: 2, name: 'General Manager', role: 'manager' }
  ];

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    source: 'Direct/Email' as Lead['source'],
    assigned_rep: 'Admin User',
    status: 'New' as Lead['status'],
    email: '',
    phone: '',
    notes: '',
    country: 'India',
    product_category: 'Enzymes'
  });

  const handleOpenAdd = () => {
    setEditingLead(null);
    setFormData({
      name: '',
      company: '',
      source: 'Direct/Email' as Lead['source'],
      assigned_rep: user.name || 'Admin User',
      status: 'New',
      email: '',
      phone: '',
      notes: '',
      country: 'India',
      product_category: 'Enzymes'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      company: lead.company,
      source: lead.source as Lead['source'],
      assigned_rep: lead.assigned_rep || 'Admin User',
      status: lead.status,
      email: lead.email,
      phone: lead.phone || '',
      notes: lead.notes || '',
      country: lead.country || 'India',
      product_category: lead.product_category || 'Enzymes'
    });
    setModalOpen(true);
  };

  const handleConvertOpportunity = (lead: Lead) => {
    updateLead(lead.id, { status: 'Qualified' });
    showSuccess(`Lead ${lead.name} converted to Opportunity status.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLeadData = {
      name: formData.name,
      company: formData.company,
      source: formData.source as Lead['source'],
      assigned_rep: formData.assigned_rep,
      status: formData.status,
      email: formData.email,
      phone: formData.phone,
      notes: formData.notes,
      country: 'India',
      product_category: 'Enzymes'
    };

    if (editingLead) {
      updateLead(editingLead.id, newLeadData);
      showSuccess('Lead profile details updated.');
    } else {
      addLead(newLeadData);
      showSuccess('New lead created successfully.');
    }
    setModalOpen(false);
  };

  const columns = [
    { header: 'Contact Name', accessor: 'name', sortable: true, render: (row: Lead) => <span className="font-bold text-slate-800">{row.name}</span> },
    { header: 'Company Name', accessor: 'company', sortable: true },
    { header: 'Referral Source', accessor: 'source', sortable: true },
    { header: 'Assigned Sales Rep', accessor: 'assigned_rep', sortable: true },
    {
      header: 'Pipeline Status',
      accessor: 'status',
      sortable: true,
      render: (row: Lead) => {
        let color = 'bg-slate-100 text-slate-500';
        if (row.status === 'New') color = 'bg-blue-50 text-blue-700 border border-blue-100';
        else if (row.status === 'Contacted') color = 'bg-amber-50 text-amber-700 border border-amber-100';
        else if (row.status === 'Qualified') color = 'bg-indigo-50 text-indigo-700 border border-indigo-100';
        else if (row.status === 'Proposal') color = 'bg-purple-50 text-purple-700 border border-purple-100';
        else if (row.status === 'Won') color = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
        else if (row.status === 'Lost') color = 'bg-rose-50 text-rose-700 border border-rose-100';
        return <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${color}`}>{row.status}</span>;
      }
    },
    { header: 'Last Contacted', accessor: 'last_contacted', sortable: true },
    {
      header: 'Actions',
      render: (row: Lead) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate(`/portal/sales-team/crm/leads/${row.id}`)}
            className="p-1 hover:bg-slate-100 rounded text-indigo-600 transition-colors"
            title="View Detail Timeline"
          >
            <Eye className="w-4.5 h-4.5" />
          </button>
          {user?.role !== 'executive' && (
            <button
              onClick={() => handleOpenEdit(row)}
              className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Edit Lead"
            >
              <Edit2 className="w-4.5 h-4.5" />
            </button>
          )}
          {row.status !== 'Won' && row.status !== 'Lost' && row.status !== 'Qualified' && user?.role !== 'executive' && (
            <button
              onClick={() => handleConvertOpportunity(row)}
              className="p-1 bg-emerald-50 hover:bg-emerald-100 rounded text-emerald-600 transition-colors"
              title="Convert to Opportunity"
            >
              <UserCheck className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Sales CRM Leads</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Acquire and manage sales pipeline client leads, contact directories, and qualification stages.</p>
      </div>

      <DataTable
        columns={columns}
        data={leads}
        searchKeys={['name', 'company', 'source', 'assigned_rep_name', 'email']}
        searchPlaceholder="Search leads directory..."
        filters={[
          { label: 'Source', accessor: 'source', options: ['Email', 'Direct', 'Web', 'Referral', 'Other'] },
          { label: 'Status', accessor: 'status', options: ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'] }
        ]}
        exportFileName="meteoric_crm_leads.csv"
        actions={
          user?.role !== 'executive' && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lead</span>
            </button>
          )
        }
      />

      {/* Add / Edit Lead Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingLead ? 'Edit Lead Profile' : 'Register New Lead Opportunity'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Contact Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Tony Stark"
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Company Name</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Stark Industries"
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tony@stark.com"
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="555-0199"
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Referral Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as Lead['source'] })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Email">Email Marketing</option>
                <option value="Direct">Direct Outreach</option>
                <option value="Web">Web Form Inflow</option>
                <option value="Referral">Client Referral</option>
                <option value="Other">Other Source</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Lead Status Stage</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Lead['status'] })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal">Proposal / Quote Sent</option>
                <option value="Won">Closed - Won</option>
                <option value="Lost">Closed - Lost</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Assigned Sales Representative</label>
            <select
              value={formData.assigned_rep}
              onChange={(e) => setFormData({ ...formData, assigned_rep: e.target.value })}
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {MOCK_REPS.map(u => (
                <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Leads Summary Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Provide background info, client interests, next follow-up dates..."
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
              Save Lead
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
