import React, { useState } from 'react';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Plus, Check, X, Plane } from 'lucide-react';

export default function TravelBookings() {
  const { travelBookings, addTravelBooking, approveTravelBooking, markTravelBooked } = useAppData();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    destination: '',
    from_to: '',
    travel_date: '',
    purpose: '',
    mode: 'Flight',
    estimated_cost: 0
  });

  const handleResolveStatus = async (id: number, status: 'Approved' | 'Rejected') => {
    try {
      await approveTravelBooking(id, status);
      showSuccess(`Travel request ${status.toLowerCase()} successfully.`);
    } catch (err) {
      showError('Failed to resolve travel status.');
    }
  };

  const handleBook = async (id: number) => {
    try {
      await markTravelBooked(id);
      showSuccess('Tickets marked as booked.');
    } catch (err) {
      showError('Failed to book travel.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTravelBooking({ ...formData, employee: user?.name || 'Unknown' } as any);
      showSuccess('Travel request submitted for approval.');
      setModalOpen(false);
      setFormData({ destination: '', from_to: '', travel_date: '', purpose: '', mode: 'Flight', estimated_cost: 0 });
    } catch (err) {
      showError('Failed to submit travel request.');
    }
  };

  const columns = [
    { header: 'Employee', accessor: 'employee', sortable: true },
    { header: 'Route', accessor: 'from_to', sortable: true },
    { header: 'Travel Date', accessor: 'travel_date', sortable: true },
    { header: 'Transport Mode', accessor: 'mode' },
    { header: 'Est. Cost (₹)', accessor: 'estimated_cost', sortable: true, render: (row: any) => <span>₹{row.estimated_cost}</span> },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row: any) => {
        let color = 'bg-slate-100 text-slate-500';
        if (row.status === 'Approved') color = 'bg-emerald-50 text-emerald-700';
        else if (row.status === 'Booked') color = 'bg-indigo-50 text-indigo-700';
        else if (row.status === 'Completed') color = 'bg-slate-200 text-slate-700';
        else if (row.status === 'Rejected') color = 'bg-rose-50 text-rose-700';
        else if (row.status === 'Requested') color = 'bg-amber-50 text-amber-700';
        return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>{row.status}</span>;
      }
    },
    {
      header: 'Actions',
      render: (row: any) => {
        const isManager = user?.role === 'manager' || user?.role === 'admin';
        const isAdmin = user?.role === 'admin';
        
        if (row.status === 'Requested' && isManager) {
          return (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleResolveStatus(row.id, 'Approved')}
                className="p-1 bg-emerald-50 hover:bg-emerald-100 rounded text-emerald-600 transition-colors"
                title="Approve Request"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleResolveStatus(row.id, 'Rejected')}
                className="p-1 bg-rose-50 hover:bg-rose-100 rounded text-rose-600 transition-colors"
                title="Reject Request"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        }

        if (row.status === 'Approved' && isAdmin) {
          return (
            <button
              onClick={() => handleBook(row.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <Plane className="w-3 h-3" />
              <span>Book Tickets</span>
            </button>
          );
        }

        return <span className="text-slate-400 font-semibold text-xs">No Action</span>;
      }
    }
  ];

  const canAdd = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'executive';

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Meteoric Travel Requests & Bookings</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Submit travel requests for USA/Vietnam visits, audit booking schedules, and resolve approval workflows.</p>
      </div>

      <DataTable
        columns={columns}
        data={travelBookings || []}
        searchKeys={['employee', 'from_to', 'purpose']}
        searchPlaceholder="Search travel records..."
        filters={[
          { label: 'Status', accessor: 'status', options: ['Requested', 'Approved', 'Booked', 'Completed', 'Rejected'] }
        ]}
        exportFileName="meteoric_travel_bookings.csv"
        actions={
          canAdd ? (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Travel Request</span>
            </button>
          ) : undefined
        }
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Submit Travel Booking Request">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Route (From - To)</label>
            <input
              type="text"
              required
              value={formData.from_to}
              onChange={(e) => setFormData({ ...formData, from_to: e.target.value })}
              placeholder="e.g. Ahmedabad HQ to USA Office"
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Travel Date</label>
              <input
                type="date"
                required
                value={formData.travel_date}
                onChange={(e) => setFormData({ ...formData, travel_date: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Mode of Travel</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Flight">Flight Booking</option>
                <option value="Train">Train Ticket</option>
                <option value="Cab">Cab / Taxi</option>
                <option value="Other">Other Mode</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Estimated Cost (₹)</label>
              <input
                type="number"
                required
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) || 0 })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Business Purpose / Notes</label>
            <textarea
              required
              rows={3}
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="e.g. Lead negotiation meetings for Enzymes/Probiotics procurement team..."
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
