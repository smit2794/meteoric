import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { Plus, Edit2, ShieldAlert, Laptop, Trash2 } from 'lucide-react';
import { ITAsset } from '../../data/mockAssets';

export default function AssetInventory() {
  const { assets, addAsset, updateAsset, deleteAsset } = useAppData();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<ITAsset | null>(null);

  const [formData, setFormData] = useState({
    type: 'Laptop',
    brand: '',
    model: '',
    serial_no: '',
    assigned_to_name: '',
    location: '',
    status: 'In Stock' as 'Active' | 'In Stock' | 'Under Repair' | 'Retired',
    purchase_date: '',
    warranty_expiry: ''
  });

  const handleOpenAdd = () => {
    setEditingAsset(null);
    setFormData({
      type: 'Laptop',
      brand: '',
      model: '',
      serial_no: '',
      assigned_to_name: '',
      location: 'Ahmedabad HQ',
      status: 'In Stock',
      purchase_date: new Date().toISOString().split('T')[0],
      warranty_expiry: new Date(Date.now() + 365*2*24*60*60*1000).toISOString().split('T')[0]
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (asset: ITAsset) => {
    setEditingAsset(asset);
    setFormData({
      type: asset.type,
      brand: asset.brand,
      model: asset.model,
      serial_no: asset.serial_no,
      assigned_to_name: asset.assigned_to_name || '',
      location: asset.location,
      status: asset.status,
      purchase_date: asset.purchase_date || '',
      warranty_expiry: asset.warranty_expiry || ''
    });
    setModalOpen(true);
  };

  const handleRetire = (id: number) => {
    if (!window.confirm('Are you sure you want to retire this asset? This updates status to Retired.')) return;
    try {
      updateAsset(id, { status: 'Retired' });
      showSuccess('Asset retired successfully.');
    } catch (err) {
      showError('Failed to retire asset.');
    }
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this asset?')) return;
    try {
      deleteAsset(id);
      showSuccess('Asset deleted successfully.');
    } catch (err) {
      showError('Failed to delete asset.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAsset) {
        updateAsset(editingAsset.id, { ...formData, location: formData.location as any, assigned_to: null });
        showSuccess('Asset details updated successfully.');
      } else {
        addAsset({ ...formData, location: formData.location as any, assigned_to: null });
        showSuccess('New asset registered successfully.');
      }
      setModalOpen(false);
    } catch (err) {
      showError('Failed to save asset.');
    }
  };

  const columns = [
    { header: 'Asset ID', accessor: 'asset_id', sortable: true },
    {
      header: 'Device Type',
      accessor: 'type',
      sortable: true,
      render: (row: ITAsset) => (
        <span className="flex items-center gap-1.5 font-semibold text-slate-700">
          <Laptop className="w-4 h-4 text-slate-400" />
          <span>{row.type}</span>
        </span>
      )
    },
    {
      header: 'Brand / Model',
      accessor: 'model',
      sortable: true,
      render: (row: ITAsset) => <span>{row.brand} {row.model}</span>
    },
    { header: 'Serial No.', accessor: 'serial_no', sortable: true },
    { header: 'Assigned To', accessor: 'assigned_to_name', sortable: true, render: (row: ITAsset) => row.assigned_to_name || <span className="text-slate-400">Unassigned</span> },
    { header: 'Location', accessor: 'location', sortable: true },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row: ITAsset) => {
        let color = 'bg-slate-100 text-slate-500';
        if (row.status === 'Active') color = 'bg-emerald-50 text-emerald-700';
        else if (row.status === 'Under Repair') color = 'bg-amber-50 text-amber-700';
        else if (row.status === 'Retired') color = 'bg-rose-50 text-rose-700';
        return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>{row.status}</span>;
      }
    },
    { header: 'Warranty Expiry', accessor: 'warranty_expiry', sortable: true },
    {
      header: 'Actions',
      render: (row: ITAsset) => (
        <div className="flex items-center gap-1">
          {user?.role !== 'executive' && (
            <button
              onClick={() => handleOpenEdit(row)}
              className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {user?.role === 'admin' && row.status !== 'Retired' && (
            <button
              onClick={() => handleRetire(row.id)}
              className="p-1 hover:bg-rose-50 rounded text-rose-600 transition-colors"
              title="Retire Asset"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          )}
          {user?.role === 'admin' && (
            <button
              onClick={() => handleDelete(row.id)}
              className="p-1 hover:bg-rose-50 rounded text-rose-600 transition-colors"
              title="Delete Asset"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Asset Inventory</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Registry of Meteoric Biopharmaceuticals corporate hardware, serials, locations, and warranty details.</p>
      </div>

      <DataTable
        columns={columns}
        data={assets}
        searchKeys={['asset_id', 'brand', 'model', 'serial_no', 'location', 'assigned_to_name']}
        searchPlaceholder="Search hardware inventory..."
        filters={[
          { label: 'Type', accessor: 'type', options: ['Laptop', 'Desktop', 'Server', 'Mobile', 'Monitor', 'Printer', 'Other'] },
          { label: 'Status', accessor: 'status', options: ['Active', 'In Stock', 'Under Repair', 'Retired'] }
        ]}
        exportFileName="meteoric_it_assets.csv"
        actions={
          user?.role !== 'executive' ? (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Asset</span>
            </button>
          ) : undefined
        }
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAsset ? 'Edit Asset Details' : 'Register New Hardware Asset'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Asset Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Laptop">Laptop</option>
                <option value="Desktop">Desktop</option>
                <option value="Server">Server</option>
                <option value="Mobile">Mobile Phone</option>
                <option value="Monitor">Monitor</option>
                <option value="Printer">Printer</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Operation Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Active">Active</option>
                <option value="In Stock">In Stock</option>
                <option value="Under Repair">Under Repair</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Brand / Make</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. Dell, Apple"
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Model Name</label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g. Latitude 5420"
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Serial Number</label>
            <input
              type="text"
              required
              value={formData.serial_no}
              onChange={(e) => setFormData({ ...formData, serial_no: e.target.value })}
              placeholder="e.g. SN-8839210"
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Assigned Employee</label>
              <input
                type="text"
                value={formData.assigned_to_name}
                onChange={(e) => setFormData({ ...formData, assigned_to_name: e.target.value })}
                placeholder="e.g. Dr. Dev Karve"
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Office Location</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Ahmedabad HQ">Ahmedabad HQ</option>
                <option value="USA Office">USA Office</option>
                <option value="Vietnam Office">Vietnam Office</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Purchase Date</label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Warranty Expiry</label>
              <input
                type="date"
                value={formData.warranty_expiry}
                onChange={(e) => setFormData({ ...formData, warranty_expiry: e.target.value })}
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
              Save Asset
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
