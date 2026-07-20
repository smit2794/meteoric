import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { BellRing, Mail, Save } from 'lucide-react';

const INITIAL_SETTINGS = {
  emailAlerts: {
    it_ticket: true,
    approval_request: true,
    low_stock: false,
    audit_scheduled: true,
    nc_raised: true
  },
  inAppAlerts: {
    it_ticket: true,
    approval_request: true,
    low_stock: true,
    audit_scheduled: true,
    nc_raised: true
  }
};

export default function NotificationSettings() {
  const [settings, setSettings] = useState<any>(INITIAL_SETTINGS);
  const [saving, setSaving] = useState(false);
  const { showSuccess } = useToast();
  const { hasActionPermission } = useAuth();
  
  const canEdit = hasActionPermission('settings', 'edit');

  const handleToggle = (type: string, category: string) => {
    if (!canEdit) return;
    setSettings((prev: any) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [category]: !prev[type][category]
      }
    }));
  };

  const handleSave = () => {
    if (!canEdit) return;
    setSaving(true);
    setTimeout(() => {
      showSuccess('Notification alert preferences saved.');
      setSaving(false);
    }, 500);
  };

  const alertCategories = [
    { key: 'it_ticket', label: 'New IT Tickets / Incident Assigned', desc: 'Alert when a ticketing request is generated or assigned' },
    { key: 'approval_request', label: 'Service & Travel Request Approval', desc: 'Alert when a manager approval is requested or resolved' },
    { key: 'low_stock', label: 'Low Stock Stationery Items Warning', desc: 'Alert when non-IT assets fall below reorder thresholds' },
    { key: 'audit_scheduled', label: 'Scheduled Compliance Audits', desc: 'Alert when a QMS compliance audit is scheduled or completed' },
    { key: 'nc_raised', label: 'Quality Non-Conformances Raised (NC)', desc: 'Alert when corrective action CAPA logs are created' }
  ];

  return (
    <div className="space-y-6 max-w-4xl select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Alert Preferences</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">Configure email transmittals and in-app bell notification preferences for Meteoric Biopharmaceuticals.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !canEdit}
          className={`flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg shadow-sm transition-all ${canEdit ? 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700' : 'bg-slate-300 cursor-not-allowed'}`}
        >
          <Save className="w-4.5 h-4.5" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 bg-slate-50/50 p-4 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
          <div className="md:col-span-2">Alert Event Type</div>
          <div className="text-center flex items-center justify-center gap-1.5 py-2 md:py-0">
            <Mail className="w-4 h-4 text-indigo-500" />
            <span>Email Alerts</span>
          </div>
          <div className="text-center flex items-center justify-center gap-1.5 py-2 md:py-0">
            <BellRing className="w-4 h-4 text-emerald-500" />
            <span>In-App Alerts</span>
          </div>
        </div>

        {/* Categories Rows */}
        <div className="divide-y divide-slate-200 font-medium text-slate-700">
          {alertCategories.map(cat => (
            <div key={cat.key} className="grid grid-cols-1 md:grid-cols-4 p-4.5 items-center hover:bg-slate-50/30 transition-colors">
              <div className="md:col-span-2 space-y-0.5 pr-4">
                <span className="text-sm font-bold text-slate-800 block">{cat.label}</span>
                <span className="text-xs text-slate-400 font-semibold block">{cat.desc}</span>
              </div>
              
              {/* Email Switch */}
              <div className="flex items-center justify-center py-3 md:py-0">
                <button
                  type="button"
                  disabled={!canEdit}
                  onClick={() => handleToggle('emailAlerts', cat.key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.emailAlerts[cat.key] ? 'bg-indigo-600' : 'bg-slate-200'
                  } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      settings.emailAlerts[cat.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* In App Switch */}
              <div className="flex items-center justify-center py-3 md:py-0">
                <button
                  type="button"
                  disabled={!canEdit}
                  onClick={() => handleToggle('inAppAlerts', cat.key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.inAppAlerts[cat.key] ? 'bg-indigo-600' : 'bg-slate-200'
                  } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      settings.inAppAlerts[cat.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
