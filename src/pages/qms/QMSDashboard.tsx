import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { AlertCircle, CalendarRange, FileSpreadsheet, Plus } from 'lucide-react';

export default function QMSDashboard() {
  const { ncs, audits, qmsDocuments } = useAppData();
  const { hasActionPermission } = useAuth();
  
  const canCreate = hasActionPermission('qms', 'create');

  const metrics = useMemo(() => {
    // NC Status Pie
    const ncMap: Record<string, number> = {};
    ncs.forEach(n => {
      ncMap[n.status] = (ncMap[n.status] || 0) + 1;
    });
    const ncPie = Object.entries(ncMap).map(([name, value]) => ({ name, value }));

    // Audit Compliance Bar
    const auditMap: Record<string, number> = {};
    audits.forEach(a => {
      auditMap[a.status] = (auditMap[a.status] || 0) + 1;
    });
    const auditBar = Object.entries(auditMap).map(([status, count]) => ({ status, count }));

    return {
      openNCs: ncs.filter(n => n.status !== 'Closed').length,
      upcomingAudits: audits.filter(a => a.status === 'Scheduled').length,
      docsDueReview: qmsDocuments.length, // total SOP docs
      ncPie,
      auditBar
    };
  }, [ncs, audits, qmsDocuments]);

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#cbd5e1'];

  return (
    <div className="space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">QMS Dashboard</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">Audit active QMS non-conformances (NC/CAPA), audit schedules, and regulatory documentation for Meteoric Biopharmaceuticals.</p>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && (
            <>
              <Link
                to="/portal/qms-team/ncs"
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Raise NC</span>
              </Link>
              <Link
                to="/portal/qms-team/audit-management"
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 bg-white text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Audit</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            category: 'NON-CONFORMANCE', 
            val: metrics.openNCs, 
            label: 'Open Non-Conformances (NC)', 
            icon: AlertCircle, 
            border: 'border-l-4 border-rose-500', 
            bg: 'bg-rose-50/50', 
            iconBg: 'bg-rose-100/50 text-rose-500', 
            textColor: 'text-rose-600', 
            footer: '→ Active CAPA corrective actions' 
          },
          { 
            category: 'COMPLIANCE AUDITS', 
            val: metrics.upcomingAudits, 
            label: 'Upcoming Scheduled Audits', 
            icon: CalendarRange, 
            border: 'border-l-4 border-amber-500', 
            bg: 'bg-amber-50/50', 
            iconBg: 'bg-amber-100/50 text-amber-500', 
            textColor: 'text-amber-600', 
            footer: '→ Internal quality inspections' 
          },
          { 
            category: 'DOCUMENTATION', 
            val: metrics.docsDueReview, 
            label: 'Compliance SOPs Active', 
            icon: FileSpreadsheet, 
            border: 'border-l-4 border-indigo-500', 
            bg: 'bg-indigo-50/50', 
            iconBg: 'bg-indigo-100/50 text-indigo-500', 
            textColor: 'text-indigo-600', 
            footer: '→ Controlled QA publications' 
          }
        ].map((c, i) => (
          <div key={i} className={`p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-44 ${c.border} ${c.bg}`}>
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${c.iconBg}`}>
                <c.icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-extrabold tracking-widest uppercase ${c.textColor}`}>
                {c.category}
              </span>
            </div>

            {/* Middle row */}
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-800 block leading-tight">{c.val}</span>
              <span className="text-[11px] font-bold text-slate-500 block mt-0.5">{c.label}</span>
            </div>

            {/* Bottom row */}
            <span className={`text-[10px] font-extrabold tracking-tight mt-2 block ${c.textColor}`}>
              {c.footer}
            </span>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* NC Status Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-80">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Non-Conformances by Status</h3>
          <div className="flex-1 min-h-0">
            {metrics.ncPie.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.ncPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {metrics.ncPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} NCs`, 'Volume']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">No NC data logged</div>
            )}
          </div>
        </div>

        {/* Audit Status Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-80 lg:col-span-2">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Audits breakdown by Status</h3>
          <div className="flex-1 min-h-0">
            {metrics.auditBar.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.auditBar} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="status" tickLine={false} axisLine={false} style={{ fontSize: '10px', fontWeight: '600' }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: '10px', fontWeight: '600' }} />
                  <Tooltip formatter={(value: any) => [`${value} Audits`, 'Count']} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">No audits found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
