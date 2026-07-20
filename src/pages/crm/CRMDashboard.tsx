import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Users, FilePieChart, Award, FileSpreadsheet, Plus } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';

export default function CRMDashboard() {
  const { leads, quotations } = useAppData();
  const { user } = useAuth();
  
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    qualifiedLeads: 0,
    quotesSent: 0,
    conversionRate: '0.0',
    sourcePie: [] as {name: string, value: number}[],
    pipelineBar: [] as {stage: string, value: number}[]
  });

  useEffect(() => {
    // Group leads by source
    const sourceMap: Record<string, number> = {};
    leads.forEach(l => {
      sourceMap[l.source] = (sourceMap[l.source] || 0) + 1;
    });
    const sourcePie = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

    // Group quotation values by status
    const quoteMap: Record<string, number> = {};
    quotations.forEach(q => {
      quoteMap[q.status] = (quoteMap[q.status] || 0) + q.amount;
    });
    const pipelineBar = Object.entries(quoteMap).map(([stage, value]) => ({ stage, value }));

    // Calculate metrics
    const wonLeadsCount = leads.filter(l => l.status === 'Won').length;
    const conversionRate = leads.length > 0 ? ((wonLeadsCount / leads.length) * 100).toFixed(1) : '0.0';

    setMetrics({
      totalLeads: leads.length,
      qualifiedLeads: leads.filter(l => l.status === 'Qualified' || l.status === 'Proposal' || l.status === 'Won').length,
      quotesSent: quotations.filter(q => q.status === 'Sent' || q.status === 'Approved' || q.status === 'COA Ready').length,
      conversionRate,
      sourcePie,
      pipelineBar
    });
  }, [leads, quotations]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];

  return (
    <div className="space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Sales CRM Dashboard</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">Audit active leads pipeline, client transmittals, quotes, and conversion analytics.</p>
        </div>
        <div className="flex items-center gap-2">
          {user?.role !== 'executive' && (
            <Link
              to="/portal/sales-team/crm"
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lead</span>
            </Link>
          )}
          {user?.role !== 'executive' && (
            <Link
              to="/portal/sales-team/quotations"
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 bg-white text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Quotation</span>
            </Link>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            category: 'LEADS FLOW', 
            val: metrics.totalLeads, 
            label: 'Total Leads Registered', 
            icon: Users, 
            border: 'border-l-4 border-indigo-500', 
            bg: 'bg-indigo-50/50', 
            iconBg: 'bg-indigo-100/50 text-indigo-500', 
            textColor: 'text-indigo-600', 
            footer: '→ Contact directories volume' 
          },
          { 
            category: 'OPPORTUNITY', 
            val: metrics.qualifiedLeads, 
            label: 'Qualified Opportunities', 
            icon: FileSpreadsheet, 
            border: 'border-l-4 border-amber-500', 
            bg: 'bg-amber-50/50', 
            iconBg: 'bg-amber-100/50 text-amber-500', 
            textColor: 'text-amber-600', 
            footer: '→ Proposals pipeline progress' 
          },
          { 
            category: 'QUOTATIONS', 
            val: metrics.quotesSent, 
            label: 'Active Quotations Sent', 
            icon: FilePieChart, 
            border: 'border-l-4 border-rose-500', 
            bg: 'bg-rose-50/50', 
            iconBg: 'bg-rose-100/50 text-rose-500', 
            textColor: 'text-rose-600', 
            footer: '→ Dispatched customer offers' 
          },
          { 
            category: 'CONVERSIONS', 
            val: `${metrics.conversionRate}%`, 
            label: 'Closed-Won Conversion', 
            icon: Award, 
            border: 'border-l-4 border-emerald-500', 
            bg: 'bg-emerald-50/50', 
            iconBg: 'bg-emerald-100/50 text-emerald-500', 
            textColor: 'text-emerald-600', 
            footer: '→ Successful accounts closed' 
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
        {/* Leads by Source Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-80">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Leads by Referral Source</h3>
          <div className="flex-1 min-h-0">
            {metrics.sourcePie.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.sourcePie}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {metrics.sourcePie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Leads`, 'Volume']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">No lead source data</div>
            )}
          </div>
        </div>

        {/* Pipeline Value by Stage Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-80 lg:col-span-2">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Total Proposal Value ($) by Quotation status</h3>
          <div className="flex-1 min-h-0">
            {metrics.pipelineBar.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.pipelineBar} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="stage" tickLine={false} axisLine={false} style={{ fontSize: '10px', fontWeight: 600 }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: '10px', fontWeight: 600 }} tickFormatter={(val: number) => `$${val.toLocaleString()}`} />
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Proposal Value']} />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">No proposals found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
