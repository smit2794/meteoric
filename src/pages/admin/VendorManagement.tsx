import React, { useState } from 'react';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Plus, Edit2, ShieldAlert, Star } from 'lucide-react';

export default function VendorManagement() {
  const { vendors, addVendor, updateVendor } = useAppData();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Hardware',
    contact_name: '',
    contact_email: '',
    contract_end_date: '',
    total_spend: 0,
    rating: 5
  });

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canEdit = isAdmin || isManager;

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setFormData({
      name: '',
      category: 'Hardware',
      contact_name: '',
      contact_email: '',
      contract_end_date: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0], // 1yr from now
      total_spend: 0,
      rating: 5
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (vendor: any) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      category: vendor.category,
      contact_name: vendor.contact_name,
      contact_email: vendor.contact_email,
      contract_end_date: vendor.contract_end_date || '',
      total_spend: vendor.total_spend,
      rating: vendor.rating
    });
    setModalOpen(true);
  };

  const handleDeactivate = async (id: number) => {
    if (!window.confirm('Are you sure you want to deactivate this vendor?')) return;
    try {
      await updateVendor(id, { status: 'Inactive' });
      showSuccess('Vendor deactivated successfully.');
    } catch (err) {
      showError('Failed to deactivate vendor.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        await updateVendor(editingVendor.id, formData as any);
        showSuccess('Vendor profile updated successfully.');
      } else {
        await addVendor(formData as any);
        showSuccess('New vendor added successfully.');
      }
      setModalOpen(false);
    } catch (err) {
      showError('Failed to save vendor.');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400' : 'text-slate-200'}`} />
        ))}
      </div>
    );
  };

  const columns = [
    { header: 'Vendor Name', accessor: 'name', sortable: true, render: (row: any) => <span className="font-bold text-slate-800">{row.name}</span> },
    {
      header: 'Category',
      accessor: 'category',
      sortable: true,
      render: (row: any) => (
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">{row.category}</span>
      )
    },
    { header: 'Contact Person', accessor: 'contact_name' },
    { header: 'Contact Email', accessor: 'contact_email' },
    { header: 'Contract End Date', accessor: 'contract_end_date', sortable: true },
    { header: 'Total Spend (₹)', accessor: 'total_spend', sortable: true, render: (row: any) => <span>₹{row.total_spend?.toLocaleString()}</span> },
    { header: 'Rating Score', accessor: 'rating', sortable: true, render: (row: any) => renderStars(row.rating) },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row: any) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row: any) => (
        <div className="flex items-center gap-1">
          {canEdit ? (
            <>
              <button
                onClick={() => handleOpenEdit(row)}
                className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              {row.status === 'Active' && isAdmin && (
                <button
                  onClick={() => handleDeactivate(row.id)}
                  className="p-1 hover:bg-rose-50 rounded text-rose-600 transition-colors"
                  title="Deactivate Vendor"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <span className="text-slate-400 text-xs">No Access</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Meteoric Vendor Management</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Audit active procurement vendors, total spend ledger, and SLA performance rating scorecards.</p>
      </div>

      <DataTable
        columns={columns}
        data={vendors || []}
        searchKeys={['name', 'category', 'contact_name', 'contact_email']}
        searchPlaceholder="Search vendors..."
        filters={[
          { label: 'Category', accessor: 'category', options: ['Hardware', 'Software', 'Catering', 'Stationery', 'Logistics', 'Travel', 'Other'] },
          { label: 'Status', accessor: 'status', options: ['Active', 'Inactive'] }
        ]}
        exportFileName="meteoric_vendors.csv"
        actions={
          canEdit ? (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vendor</span>
            </button>
          ) : undefined
        }
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingVendor ? 'Edit Vendor Details' : 'Register New Vendor'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Vendor / Company Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Acme Logistics Group"
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Hardware">Hardware Provision</option>
                <option value="Software">Software Licensing</option>
                <option value="Catering">Office Catering</option>
                <option value="Stationery">Office Stationery</option>
                <option value="Logistics">Courier & Freight</option>
                <option value="Travel">Travel Management</option>
                <option value="Other">Other Services</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Rating Score (1-5)</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Contact Person Name</label>
              <input
                type="text"
                required
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                placeholder="e.g. Mike Vance"
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Contact Email Address</label>
              <input
                type="email"
                required
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="mike@acmelogistics.com"
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Total Billing Spend (₹)</label>
              <input
                type="number"
                value={formData.total_spend}
                onChange={(e) => setFormData({ ...formData, total_spend: parseFloat(e.target.value) || 0 })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Contract Renewal Date</label>
              <input
                type="date"
                value={formData.contract_end_date}
                onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              Save Vendor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
