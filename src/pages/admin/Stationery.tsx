import React, { useState } from 'react';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Plus, AlertOctagon, RotateCcw } from 'lucide-react';

export default function Stationery() {
  const { nonItAssets, addNonITAsset, updateNonITAssetStock } = useAppData();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Stationery',
    quantity: 0,
    reorder_level: 10,
    cost_per_unit: 1.0
  });

  const [stockVal, setStockVal] = useState(0);

  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  const handleOpenStock = (item: any) => {
    setSelectedItem(item);
    setStockVal(item.quantity);
    setStockModalOpen(true);
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        const diff = stockVal - selectedItem.quantity;
        const type = diff >= 0 ? 'in' : 'out';
        await updateNonITAssetStock(selectedItem.id, Math.abs(diff), type);
        showSuccess('Inventory stock count updated.');
        setStockModalOpen(false);
      }
    } catch (err) {
      showError('Failed to update stock.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addNonITAsset(formData as any);
      showSuccess('Inventory item registered successfully.');
      setModalOpen(false);
      setFormData({ name: '', category: 'Stationery', quantity: 0, reorder_level: 10, cost_per_unit: 1.0 });
    } catch (err) {
      showError('Failed to save inventory item.');
    }
  };

  const columns = [
    { header: 'Item Name', accessor: 'name', sortable: true, render: (row: any) => <span className="font-bold text-slate-800">{row.name}</span> },
    { header: 'Category Group', accessor: 'category', sortable: true },
    {
      header: 'Qty In Stock',
      accessor: 'quantity',
      sortable: true,
      render: (row: any) => {
        const isLow = row.quantity <= row.reorder_level;
        return (
          <span className={`flex items-center gap-1.5 font-bold ${isLow ? 'text-rose-600' : 'text-slate-700'}`}>
            <span>{row.quantity} units</span>
            {isLow && <AlertOctagon className="w-3.5 h-3.5 animate-pulse" />}
          </span>
        );
      }
    },
    { header: 'Reorder Level', accessor: 'reorder_level', sortable: true },
    { header: 'Cost per Unit (₹)', accessor: 'cost_per_unit', sortable: true, render: (row: any) => <span>₹{row.cost_per_unit.toFixed(2)}</span> },
    {
      header: 'Actions',
      render: (row: any) => (
        canEdit ? (
          <button
            onClick={() => handleOpenStock(row)}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Update Stock</span>
          </button>
        ) : <span className="text-slate-400 text-xs">No Access</span>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Meteoric Non-IT Assets & Stationery</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Audit office supplies, kitchen stock levels, and configure low-inventory notifications.</p>
      </div>

      <DataTable
        columns={columns}
        data={nonItAssets || []}
        searchKeys={['name', 'category']}
        searchPlaceholder="Search inventory..."
        filters={[
          { label: 'Category', accessor: 'category', options: ['Stationery', 'Pantry', 'Cleaning', 'Furniture', 'Other'] }
        ]}
        exportFileName="meteoric_office_stock.csv"
        actions={
          canEdit ? (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          ) : undefined
        }
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Office/Stationery Item">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Item Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. A4 Paper reams or Toilet Paper box"
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
                <option value="Stationery">Stationery</option>
                <option value="Lab Consumables">Lab Consumables</option>
                <option value="Office Supplies">Office Supplies</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Cost per Unit (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.cost_per_unit}
                onChange={(e) => setFormData({ ...formData, cost_per_unit: parseFloat(e.target.value) || 0 })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Initial Quantity</label>
              <input
                type="number"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Reorder Alert Level</label>
              <input
                type="number"
                required
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) || 0 })}
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
              Save Item
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={stockModalOpen} onClose={() => setStockModalOpen(false)} title={`Update Stock: ${selectedItem?.name}`}>
        <form onSubmit={handleStockSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">New Inventory Quantity</label>
            <input
              type="number"
              required
              value={stockVal}
              onChange={(e) => setStockVal(parseInt(e.target.value) || 0)}
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStockModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              Save Count
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
