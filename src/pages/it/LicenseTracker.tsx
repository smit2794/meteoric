import React, { useState, useMemo } from 'react';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Bell, RefreshCw, CalendarDays } from 'lucide-react';

interface License {
  id: number;
  name: string;
  vendor: string;
  owner_name: string;
  expiry_date: string;
  reminder_set: 0 | 1;
  notes: string;
}

const initialLicenses: License[] = [
  { id: 1, name: 'Microsoft Office 365 E3', vendor: 'Microsoft', owner_name: 'Smit Patel', expiry_date: '2027-01-15', reminder_set: 1, notes: 'Enterprise wide subscription.' },
  { id: 2, name: 'AWS Production Services', vendor: 'Amazon Web Services', owner_name: 'Dr. Dev Karve', expiry_date: '2026-08-01', reminder_set: 1, notes: 'Cloud infrastructure.' },
  { id: 3, name: 'Adobe Creative Cloud', vendor: 'Adobe', owner_name: 'Marketing Team', expiry_date: '2026-07-25', reminder_set: 0, notes: 'Used by branding.' }
];

export default function LicenseTracker() {
  const [licenses, setLicenses] = useState<License[]>(initialLicenses);
  const [modalOpen, setModalOpen] = useState(false);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    vendor: '',
    expiry_date: '',
    owner_name: '',
    notes: ''
  });

  const [renewDate, setRenewDate] = useState('');

  const licensesWithDays = useMemo(() => {
    const today = new Date().getTime();
    return licenses.map(l => {
      const exp = new Date(l.expiry_date).getTime();
      const diffTime = exp - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ...l, days_remaining: diffDays };
    });
  }, [licenses]);

  const handleOpenRenew = (license: License) => {
    setSelectedLicense(license);
    const currentExpiry = new Date(license.expiry_date);
    currentExpiry.setFullYear(currentExpiry.getFullYear() + 1);
    setRenewDate(currentExpiry.toISOString().split('T')[0]);
    setRenewModalOpen(true);
  };

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLicense) return;
    try {
      setLicenses(licenses.map(l => l.id === selectedLicense.id ? { ...l, expiry_date: renewDate } : l));
      showSuccess(`License ${selectedLicense.name} extended successfully.`);
      setRenewModalOpen(false);
    } catch (err) {
      showError('Failed to renew license.');
    }
  };

  const handleToggleReminder = (id: number, currentVal: 0 | 1) => {
    const nextVal = currentVal === 1 ? 0 : 1;
    try {
      setLicenses(licenses.map(l => l.id === id ? { ...l, reminder_set: nextVal } : l));
      showSuccess('Alert notification preference updated.');
    } catch (err) {
      showError('Failed to update alert settings.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newLic: License = {
        id: Date.now(),
        name: formData.name,
        vendor: formData.vendor,
        expiry_date: formData.expiry_date,
        owner_name: formData.owner_name,
        reminder_set: 1,
        notes: formData.notes
      };
      setLicenses([...licenses, newLic]);
      showSuccess('Software license added successfully.');
      setModalOpen(false);
      setFormData({ name: '', vendor: '', expiry_date: '', owner_name: '', notes: '' });
    } catch (err) {
      showError('Failed to add license.');
    }
  };

  const columns = [
    { header: 'License / SLA Name', accessor: 'name', sortable: true, render: (row: any) => <span className="font-bold text-slate-800">{row.name}</span> },
    { header: 'Vendor', accessor: 'vendor', sortable: true },
    { header: 'Owner', accessor: 'owner_name', sortable: true },
    { header: 'Expiry Date', accessor: 'expiry_date', sortable: true, render: (row: any) => <span className="font-semibold text-slate-700">{row.expiry_date}</span> },
    {
      header: 'Days Remaining',
      accessor: 'days_remaining',
      sortable: true,
      render: (row: any) => {
        const days = row.days_remaining;
        if (days < 0) return <span className="text-rose-600 font-bold">Expired</span>;
        if (days <= 30) return <span className="text-rose-500 font-bold bg-rose-50 border border-rose-100 px-2 py-0.5 rounded text-xs">{days} days remaining</span>;
        if (days <= 60) return <span className="text-amber-500 font-bold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded text-xs">{days} days remaining</span>;
        return <span className="text-slate-600 font-semibold">{days} days</span>;
      }
    },
    {
      header: 'Alerts',
      render: (row: any) => (
        <button
          onClick={() => handleToggleReminder(row.id, row.reminder_set)}
          className={`p-1.5 rounded-lg border transition-all ${
            row.reminder_set === 1 
              ? 'text-indigo-600 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50' 
              : 'text-slate-400 border-slate-200 bg-white hover:bg-slate-50'
          }`}
          title="Toggle Email Reminder Alerts"
        >
          <Bell className="w-4 h-4" />
        </button>
      )
    },
    {
      header: 'Actions',
      render: (row: any) => {
        if (user?.role === 'executive') return <span className="text-slate-400 font-semibold text-xs">No Actions</span>;
        return (
          <button
            onClick={() => handleOpenRenew(row)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Renew</span>
          </button>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-xl font-bold text-slate-800">License & SLA Renewal Tracker</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Monitor expiration timelines for software contracts, SLAs, domain names, and corporate subscriptions for Meteoric Biopharmaceuticals.</p>
      </div>

      <DataTable
        columns={columns}
        data={licensesWithDays}
        searchKeys={['name', 'vendor', 'owner_name']}
        searchPlaceholder="Search licenses..."
        filters={[
          { label: 'Vendor', accessor: 'vendor', options: ['Microsoft', 'Adobe', 'Amazon Web Services'] }
        ]}
        exportFileName="meteoric_license_renewal.csv"
        actions={
          user?.role !== 'executive' ? (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add License</span>
            </button>
          ) : undefined
        }
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Software License / Contract">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">License/Subscription Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. AWS Production Hub Subscription"
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Vendor Name</label>
              <input
                type="text"
                required
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="e.g. Microsoft"
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Internal Owner</label>
              <input
                type="text"
                required
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                placeholder="e.g. Dr. Dev Karve"
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Contract Expiry Date</label>
            <input
              type="date"
              required
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Additional Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="SLA response speed details, billing card reference..."
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
              Save License
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={renewModalOpen} onClose={() => setRenewModalOpen(false)} title={`Renew License: ${selectedLicense?.name}`}>
        <form onSubmit={handleRenewSubmit} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed font-semibold">
            Current Expiry: <strong>{selectedLicense?.expiry_date}</strong>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">New Expiry Date</label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                type="date"
                required
                value={renewDate}
                onChange={(e) => setRenewDate(e.target.value)}
                className="w-full text-sm pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRenewModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              Confirm Extension
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
