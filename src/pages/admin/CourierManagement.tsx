import React, { useState } from 'react';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Check, MapPin } from 'lucide-react';

export default function CourierManagement() {
  const { couriers, addCourier, markCourierDelivered } = useAppData();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    type: 'Inward',
    sender: '',
    receiver: '',
    date: new Date().toISOString().split('T')[0],
    tracking_no: '',
    notes: ''
  });

  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  const handleMarkDelivered = async (id: number) => {
    try {
      await markCourierDelivered(id);
      showSuccess('Courier status updated to Delivered.');
    } catch (err) {
      showError('Failed to update status.');
    }
  };

  const handleTrack = (courier: any) => {
    showSuccess(`Tracking courier ${courier.courier_id} via tracking system.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCourier({
        type: formData.type as 'Inward' | 'Outward',
        sender: formData.sender,
        receiver: formData.receiver,
        date: formData.date,
        tracking_no: formData.tracking_no
      });
      showSuccess('Courier dispatch entry logged successfully.');
      setModalOpen(false);
    } catch (err) {
      showError('Failed to log courier.');
    }
  };

  const columns = [
    { header: 'Courier ID', accessor: 'courier_id', sortable: true },
    {
      header: 'Direction Type',
      accessor: 'type',
      sortable: true,
      render: (row: any) => (
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
          row.type === 'Inward' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
        }`}>{row.type}</span>
      )
    },
    { header: 'Sender / Origin', accessor: 'sender', sortable: true },
    { header: 'Receiver / Recipient', accessor: 'receiver', sortable: true },
    { header: 'Date Logged', accessor: 'date', sortable: true },
    { header: 'Tracking No.', accessor: 'tracking_no' },
    {
      header: 'Transit Status',
      accessor: 'status',
      sortable: true,
      render: (row: any) => {
        let color = 'bg-slate-100 text-slate-500';
        if (row.status === 'Delivered') color = 'bg-emerald-50 text-emerald-700';
        else if (row.status === 'In Transit') color = 'bg-amber-50 text-amber-700 animate-pulse';
        else if (row.status === 'Returned') color = 'bg-rose-50 text-rose-700';
        return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>{row.status}</span>;
      }
    },
    {
      header: 'Actions',
      render: (row: any) => (
        <div className="flex items-center gap-1.5">
          {row.status === 'In Transit' && canEdit && (
            <button
              onClick={() => handleMarkDelivered(row.id)}
              className="p-1 bg-emerald-50 hover:bg-emerald-100 rounded text-emerald-600 transition-colors"
              title="Mark Delivered"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleTrack(row)}
            className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
            title="Track Courier Location"
          >
            <MapPin className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Meteoric Courier Dispatch</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Log incoming materials (inward) and outgoing client shipments (outward) with live tracking IDs.</p>
      </div>

      <DataTable
        columns={columns}
        data={couriers || []}
        searchKeys={['courier_id', 'sender', 'receiver', 'tracking_no']}
        searchPlaceholder="Search courier database..."
        filters={[
          { label: 'Direction', accessor: 'type', options: ['Inward', 'Outward'] },
          { label: 'Status', accessor: 'status', options: ['In Transit', 'Delivered', 'Returned'] }
        ]}
        exportFileName="meteoric_couriers.csv"
        actions={
          canEdit ? (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Log Courier</span>
            </button>
          ) : undefined
        }
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Log Inward / Outward Courier Shipment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Direction Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Inward">Inward (Incoming material)</option>
                <option value="Outward">Outward (Outgoing shipment)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Log Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Sender / Origin</label>
              <input
                type="text"
                required
                value={formData.sender}
                onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                placeholder="e.g. Acme Chemical Corp"
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Receiver / Recipient</label>
              <input
                type="text"
                required
                value={formData.receiver}
                onChange={(e) => setFormData({ ...formData, receiver: e.target.value })}
                placeholder="e.g. QA Lab Desk"
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Tracking Number</label>
            <input
              type="text"
              value={formData.tracking_no}
              onChange={(e) => setFormData({ ...formData, tracking_no: e.target.value })}
              placeholder="e.g. Fedex TRK-9903"
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Package Contents / Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Quality audit ledger books or reagent bottles..."
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
              Log Courier
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
