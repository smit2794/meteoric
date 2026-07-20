import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Info } from 'lucide-react';

const INITIAL_MATRIX = [
  { role: 'ittech', module: 'dashboard', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
  { role: 'ittech', module: 'it', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
  { role: 'sales', module: 'crm', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
  { role: 'sales', module: 'sales', can_view: 1, can_create: 1, can_edit: 0, can_delete: 0 },
  { role: 'qa', module: 'qa', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
  { role: 'qa', module: 'qms', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
  { role: 'manager', module: 'dashboard', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
  { role: 'manager', module: 'admin', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
  { role: 'manager', module: 'crm', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
  { role: 'manager', module: 'sales', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
  { role: 'manager', module: 'qms', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
  { role: 'manager', module: 'settings', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
];

export default function Permissions() {
  const [matrix, setMatrix] = useState<any[]>(INITIAL_MATRIX);
  const [saving, setSaving] = useState(false);
  const { showSuccess } = useToast();
  const { hasActionPermission } = useAuth();
  
  const canEdit = hasActionPermission('settings', 'edit');

  const handleCheckboxChange = (role: string, module: string, field: string) => {
    if (!canEdit) return;
    setMatrix(prev => {
      const exists = prev.find(r => r.role === role && r.module === module);
      if (exists) {
        return prev.map(row => {
          if (row.role === role && row.module === module) {
            return { ...row, [field]: row[field] === 1 ? 0 : 1 };
          }
          return row;
        });
      } else {
        const newRow = { role, module, can_view: 0, can_create: 0, can_edit: 0, can_delete: 0, [field]: 1 };
        return [...prev, newRow];
      }
    });
  };

  const handleSave = () => {
    if (!canEdit) return;
    setSaving(true);
    setTimeout(() => {
      showSuccess('Roles and permissions matrix updated successfully.');
      setSaving(false);
    }, 500);
  };

  const rolesList = ['ittech', 'sales', 'qa', 'manager'];
  const modulesList = [
    { key: 'dashboard', label: 'Main Dashboard' },
    { key: 'it', label: 'IT Asset Management' },
    { key: 'admin', label: 'Administration & Stationery' },
    { key: 'crm', label: 'Sales CRM & Leads' },
    { key: 'qa', label: 'QA & Certificate Control' },
    { key: 'sales', label: 'Sales Fulfillment & Orders' },
    { key: 'qms', label: 'QMS & Audits' },
    { key: 'settings', label: 'System Settings' }
  ];

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Roles & Permissions Matrix</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">Configure role-based access control (RBAC) levels for system modules for Meteoric Biopharmaceuticals.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !canEdit}
          className={`flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg shadow-sm transition-all ${canEdit ? 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700' : 'bg-slate-300 cursor-not-allowed'}`}
        >
          <ShieldCheck className="w-4.5 h-4.5" />
          <span>{saving ? 'Saving...' : 'Save Permissions'}</span>
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-xl flex gap-3 text-amber-800 text-xs">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed font-semibold">
          <strong className="block text-amber-900 font-bold mb-0.5">Admin Security Control Note:</strong>
          The "admin" role is a superuser and retains full permissions (View, Create, Edit, Delete) across all modules globally. It is excluded from this configuration panel to guarantee administrator accessibility.
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider">Role & Module</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-center uppercase tracking-wider">Can View</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-center uppercase tracking-wider">Can Create</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-center uppercase tracking-wider">Can Edit</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-center uppercase tracking-wider">Can Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
              {rolesList.map(role => (
                <React.Fragment key={role}>
                  <tr className="bg-slate-100/50">
                    <td colSpan={5} className="px-6 py-2.5 font-black text-slate-800 uppercase tracking-widest text-[10px]">
                      Role: {role === 'ittech' ? 'IT Technician' : role === 'sales' ? 'Sales Representative' : role === 'qa' ? 'QA Officer' : 'General Manager'}
                    </td>
                  </tr>
                  
                  {modulesList.map(mod => {
                    const row = matrix.find(r => r.role === role && r.module === mod.key) || { can_view: 0, can_create: 0, can_edit: 0, can_delete: 0 };
                    return (
                      <tr key={mod.key} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3.5 pl-10 font-semibold text-slate-700">
                          {mod.label}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={row.can_view === 1}
                            disabled={!canEdit}
                            onChange={() => handleCheckboxChange(role, mod.key, 'can_view')}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4.5 h-4.5 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={row.can_create === 1}
                            disabled={!canEdit}
                            onChange={() => handleCheckboxChange(role, mod.key, 'can_create')}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4.5 h-4.5 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={row.can_edit === 1}
                            disabled={!canEdit}
                            onChange={() => handleCheckboxChange(role, mod.key, 'can_edit')}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4.5 h-4.5 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={row.can_delete === 1}
                            disabled={!canEdit}
                            onChange={() => handleCheckboxChange(role, mod.key, 'can_delete')}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4.5 h-4.5 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
