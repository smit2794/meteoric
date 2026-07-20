import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Laptop, AlertTriangle, LifeBuoy, FileClock, Plus } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';

export default function ITDashboard() {
  const { assets, tickets } = useAppData();
  const { user } = useAuth();
  
  const metrics = useMemo(() => {
    const itTickets = tickets.filter(t => t.category === 'IT');
    const openTkts = itTickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed');
    
    const statusMap: Record<string, number> = {};
    assets.forEach(a => {
      statusMap[a.status] = (statusMap[a.status] || 0) + 1;
    });
    const statusBar = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

    const priorityMap: Record<string, number> = {};
    openTkts.forEach(t => {
      priorityMap[t.priority] = (priorityMap[t.priority] || 0) + 1;
    });
    const priorityPie = Object.entries(priorityMap).map(([priority, count]) => ({ name: priority, value: count }));

    // Use warranty_expiry from assets to substitute expiring licenses
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    const expiringLcs = assets.filter(a => {
      if (!a.warranty_expiry) return false;
      const expiry = new Date(a.warranty_expiry);
      return expiry >= now && expiry <= thirtyDaysFromNow;
    });

    return {
      totalAssets: assets.length,
      underRepair: assets.filter(a => a.status === 'Under Repair').length,
      openTickets: openTkts.length,
      expiringLicenses: expiringLcs.length,
      priorityPie,
      statusBar
    };
  }, [assets, tickets]);

  const COLORS = ['#ef4444', '#f59e0b', '#6366f1', '#10b981'];

  return (
    <div className="space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">IT Dashboard</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">Overview of Meteoric Biopharmaceuticals IT assets, incidents, and license renewals.</p>
        </div>
        <div className="flex items-center gap-2">
          {user?.role !== 'executive' && (
            <Link
              to="/portal/it-department/incidents"
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Ticket</span>
            </Link>
          )}
          {user?.role !== 'executive' && (
            <Link
              to="/portal/it-department/assets"
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 bg-white text-slate-700 text-sm font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Asset</span>
            </Link>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            category: 'ASSETS REGISTER', 
            val: metrics.totalAssets, 
            label: 'Total Assets Managed', 
            icon: Laptop, 
            border: 'border-l-4 border-indigo-500', 
            bg: 'bg-indigo-50/50', 
            iconBg: 'bg-indigo-100/50 text-indigo-500', 
            textColor: 'text-indigo-600', 
            footer: '→ Active hardware inventory' 
          },
          { 
            category: 'MAINTENANCE', 
            val: metrics.underRepair, 
            label: 'Assets Under Repair', 
            icon: AlertTriangle, 
            border: 'border-l-4 border-amber-500', 
            bg: 'bg-amber-50/50', 
            iconBg: 'bg-amber-100/50 text-amber-500', 
            textColor: 'text-amber-600', 
            footer: '→ Depot repair tasks' 
          },
          { 
            category: 'IT SUPPORT', 
            val: metrics.openTickets, 
            label: 'Open Incident Tickets', 
            icon: LifeBuoy, 
            border: 'border-l-4 border-rose-500', 
            bg: 'bg-rose-50/50', 
            iconBg: 'bg-rose-100/50 text-rose-500', 
            textColor: 'text-rose-600', 
            footer: '→ User support queue' 
          },
          { 
            category: 'COMPLIANCE', 
            val: metrics.expiringLicenses, 
            label: 'Warranties Expiring (30d)', 
            icon: FileClock, 
            border: 'border-l-4 border-emerald-500', 
            bg: 'bg-emerald-50/50', 
            iconBg: 'bg-emerald-100/50 text-emerald-500', 
            textColor: 'text-emerald-600', 
            footer: '→ Hardware SLA updates' 
          }
        ].map((c, i) => (
          <div key={i} className={`p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-44 ${c.border} ${c.bg}`}>
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${c.iconBg}`}>
                <c.icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-extrabold tracking-widest uppercase ${c.textColor}`}>
                {c.category}
              </span>
            </div>

            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-800 block leading-tight">{c.val}</span>
              <span className="text-[11px] font-bold text-slate-500 block mt-0.5">{c.label}</span>
            </div>

            <span className={`text-[10px] font-extrabold tracking-tight mt-2 block ${c.textColor}`}>
              {c.footer}
            </span>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Priority Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-80">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Open Incidents by Priority</h3>
          <div className="flex-1 min-h-0">
            {metrics.priorityPie.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.priorityPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {metrics.priorityPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} Incidents`, 'Open']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">No open incidents</div>
            )}
          </div>
        </div>

        {/* Asset Status Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-80 lg:col-span-2">
          <h3 className="font-bold text-slate-800 text-sm mb-4">IT Assets Breakdown by Status</h3>
          <div className="flex-1 min-h-0">
            {metrics.statusBar.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.statusBar} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="status" tickLine={false} axisLine={false} style={{ fontSize: '10px', fontWeight: '600' }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: '10px', fontWeight: '600' }} />
                  <Tooltip formatter={(value: number) => [`${value} Devices`, 'Count']} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">No assets found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
