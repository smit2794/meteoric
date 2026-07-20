import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  LineChart, Line 
} from 'recharts';
import { 
  CheckCircle2, AlertCircle, Users, FileCheck, HelpCircle, 
  ArrowRight, Clock, Monitor, Building, TrendingUp, ShieldCheck, Layers
} from 'lucide-react';

export default function MainDashboard() {
  const { user } = useAuth();
  const { activityLogs, tickets, travelBookings, leads, audits, assets, vendors, quotations, coas } = useAppData();

  const stats = useMemo(() => {
    // 1. Centralized dynamic KPI cards
    const kpiCards = [
      { category: 'IT ASSETS', val: assets.length, label: 'Total IT Assets', border: 'border-l-4 border-indigo-500', bg: 'bg-indigo-50/50', textColor: 'text-indigo-600', icon: Monitor, footer: 'Hardware systems count' },
      { category: 'IT INCIDENTS', val: tickets.filter(t => t.category === 'IT' && t.status !== 'Resolved' && t.status !== 'Closed').length, label: 'Open IT Incidents', border: 'border-l-4 border-rose-500', bg: 'bg-rose-50/50', textColor: 'text-rose-600', icon: AlertCircle, footer: 'Awaiting resolution' },
      { category: 'SERVICE REQUESTS', val: tickets.filter(t => t.category === 'IT' && t.priority === 'High').length, label: 'Pending Requests', border: 'border-l-4 border-amber-500', bg: 'bg-amber-50/50', textColor: 'text-amber-600', icon: HelpCircle, footer: 'Critical requests queue' },
      { category: 'HELP DESK', val: tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length, label: 'Active Tickets', border: 'border-l-4 border-violet-500', bg: 'bg-violet-50/50', textColor: 'text-violet-600', icon: AlertCircle, footer: 'Central ticketing queue' },
      { category: 'VENDORS', val: vendors.length, label: 'Active Vendors', border: 'border-l-4 border-emerald-500', bg: 'bg-emerald-50/50', textColor: 'text-emerald-600', icon: Building, footer: 'Registered supply chain' },
      { category: 'SALES INQUIRIES', val: leads.length, label: 'Sales CRM Leads', border: 'border-l-4 border-sky-500', bg: 'bg-sky-50/50', textColor: 'text-sky-600', icon: TrendingUp, footer: 'Inbound distributor leads' },
      { category: 'PROPOSALS', val: quotations.filter(q => q.status !== 'Approved' && q.status !== 'Rejected').length, label: 'Pending Quotes', border: 'border-l-4 border-purple-500', bg: 'bg-purple-50/50', textColor: 'text-purple-600', icon: Layers, footer: 'Quotations pending approval' },
      { category: 'COMPLIANCE', val: audits.filter(a => a.status === 'Scheduled').length, label: 'Scheduled Audits', border: 'border-l-4 border-slate-500', bg: 'bg-slate-100/50', textColor: 'text-slate-600', icon: ShieldCheck, footer: 'Pending QMS GMP audits' }
    ];

    // 2. Ticket / Incidents Trend over last 7 days (Mock trend data)
    const ticketTrend = [
      { date: '14th Jul', active: 3, closed: 1 },
      { date: '15th Jul', active: 4, closed: 2 },
      { date: '16th Jul', active: 5, closed: 3 },
      { date: '17th Jul', active: 6, closed: 2 },
      { date: '18th Jul', active: 8, closed: 4 },
      { date: '19th Jul', active: 7, closed: 5 },
      { date: '20th Jul', active: tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length, closed: tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length }
    ];

    // 3. COA Status Breakdown Pie
    const coaMap: Record<string, number> = {};
    coas.forEach(c => {
      coaMap[c.status] = (coaMap[c.status] || 0) + 1;
    });
    const coaPie = Object.entries(coaMap).map(([name, value]) => ({ name, value }));

    // 4. Sales Pipeline Funnel stage volume counts
    const pipelineMap: Record<string, number> = {};
    leads.forEach(l => {
      pipelineMap[l.status] = (pipelineMap[l.status] || 0) + 1;
    });
    const pipelineBar = Object.entries(pipelineMap).map(([stage, count]) => ({ stage, count }));

    return {
      kpiCards,
      ticketTrend,
      coaPie,
      pipelineBar
    };
  }, [tickets, travelBookings, leads, audits, assets, vendors, quotations, coas]);

  const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#cbd5e1'];

  return (
    <div className="space-y-8 select-none">
      {/* Header banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Welcome to Meteoric Central Dashboard</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">Cross-module KPI summary pulling from R&D systems, Admin travel, QA batch COAs and QMS compliance audit records.</p>
        </div>
        <div className="text-xs font-semibold text-slate-400">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.kpiCards.map((c, i) => (
          <div key={i} className={`p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-44 ${c.border} ${c.bg}`}>
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center bg-white shadow-xs ${c.textColor}`}>
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
        {/* Ticket Trends Line Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-80 lg:col-span-2">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Tickets & Incidents Trend (Last 7 Days)</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.ticketTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: '10px', fontWeight: '600' }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: '10px', fontWeight: '600' }} />
                <Tooltip formatter={(value: any) => [`${value} Tickets`, 'Volume']} />
                <Legend iconType="plainline" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="active" name="Open Incidents" stroke="#ef4444" strokeWidth={2.5} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="closed" name="Closed/Resolved" stroke="#10b981" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COA Certificates Breakdown Pie */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-80">
          <h3 className="font-bold text-slate-800 text-sm mb-4">COA Status Breakdown</h3>
          <div className="flex-1 min-h-0">
            {stats.coaPie.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.coaPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.coaPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} COAs`, 'Volume']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">No COA records found</div>
            )}
          </div>
        </div>

        {/* Sales Pipeline Funnel Stage Counts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-80 lg:col-span-3">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Sales CRM Pipeline Lead Volume by Stage</h3>
          <div className="flex-1 min-h-0">
            {stats.pipelineBar.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.pipelineBar} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="stage" tickLine={false} axisLine={false} style={{ fontSize: '10px', fontWeight: '600' }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: '10px', fontWeight: '600' }} />
                  <Tooltip formatter={(value: any) => [`${value} Leads`, 'Volume']} />
                  <Bar dataKey="count" fill="#1b4332" radius={[4, 4, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">No pipeline data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
