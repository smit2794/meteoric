import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';
import { Monitor, Briefcase, TrendingUp, CheckCircle, ShieldCheck, Play, ArrowRight, Activity, Type } from 'lucide-react';

export default function PortalSelect() {
  const { 
    assets, tickets, travelBookings, leads, coaRequests, orders, ncs, demoRole, setDemoRole, vendors, fontSize, setFontSize
  } = useAppData();
  const { showWarning } = useToast();
  const navigate = useNavigate();

  // Dynamic live counters
  const openTicketsCount = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length;
  const pendingTravelCount = travelBookings.filter(t => t.status === 'Requested').length;
  const activeLeadsCount = leads.filter(l => l.status !== 'Won' && l.status !== 'Lost').length;
  const pendingCoaCount = coaRequests.filter(r => r.status === 'Pending').length;
  const openCapasCount = ncs.filter(n => n.status !== 'Closed').length;

  const portals = [
    {
      name: 'IT Department',
      desc: 'Lab equipment IT systems, incidents, service requests, access control',
      counter: `${assets.length} Active Assets`,
      color: 'indigo',
      icon: Monitor,
      roleKey: 'IT Department',
      path: '/portal/it-department'
    },
    {
      name: 'Admin Department',
      desc: 'Vendors, raw material stock, travel between India/USA/Vietnam offices, courier register',
      counter: `${vendors.length} Active Vendors`,
      color: 'amber',
      icon: Briefcase,
      roleKey: 'Admin Department',
      path: '/portal/admin-department'
    },
    {
      name: 'Sales Team',
      desc: 'Distributor & customer leads, product quotations, sample requests',
      counter: `${activeLeadsCount} Active Inquiries`,
      color: 'sky',
      icon: TrendingUp,
      roleKey: 'Sales Team',
      path: '/portal/sales-team'
    },
    {
      name: 'QA Team',
      desc: 'Certificate of Analysis (COA) for enzyme/probiotic/formulation batches',
      counter: `${pendingCoaCount} Pending requests`,
      color: 'emerald',
      icon: CheckCircle,
      roleKey: 'QA Team',
      path: '/portal/qa-team'
    },
    {
      name: 'QMS Team',
      desc: 'GMP SOPs, regulatory documentation, internal/external compliance audits',
      counter: `${openCapasCount} Active CAPAs`,
      color: 'slate',
      icon: ShieldCheck,
      roleKey: 'QMS Team',
      path: '/portal/qms-team'
    }
  ];

  const handleEnterPortal = (p: typeof portals[0]) => {
    const isAuthorized = demoRole === 'Super Admin' || demoRole === p.roleKey;
    if (!isAuthorized) {
      showWarning(`Role Mismatch: Your current role is ${demoRole}. Switch your role to ${p.roleKey} to access this portal.`);
      return;
    }
    navigate(p.path);
  };

  const getColorStyles = (color: string) => {
    const maps: Record<string, { bg: string; border: string; text: string; fill: string }> = {
      indigo: { bg: 'bg-indigo-50/50', border: 'hover:border-indigo-500/50 hover:shadow-indigo-500/5', text: 'text-indigo-600', fill: 'bg-indigo-600' },
      amber: { bg: 'bg-amber-50/50', border: 'hover:border-amber-500/50 hover:shadow-amber-500/5', text: 'text-amber-600', fill: 'bg-amber-600' },
      emerald: { bg: 'bg-emerald-50/50', border: 'hover:border-emerald-500/5 hover:shadow-emerald-500/5', text: 'text-emerald-600', fill: 'bg-emerald-600' },
      sky: { bg: 'bg-sky-50/50', border: 'hover:border-sky-500/5 hover:shadow-sky-500/5', text: 'text-sky-600', fill: 'bg-sky-600' },
      slate: { bg: 'bg-slate-100/50', border: 'hover:border-slate-500/50 hover:shadow-slate-500/5', text: 'text-slate-600', fill: 'bg-slate-700' }
    };
    return maps[color] || maps.indigo;
  };

  return (
    <div className="min-h-screen bg-[#fafaf6] flex flex-col justify-between py-16 px-4 relative overflow-hidden select-none font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#ecece0]/45 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#ecece0]/45 rounded-full blur-[100px]" />

      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-6 z-10">
        <div className="flex items-center justify-center gap-3">
          <img
            src="/logo.png"
            alt="Meteoric Biopharmaceuticals"
            className="h-14 w-auto object-contain drop-shadow-sm"
          />
        </div>

        {/* Dynamic Selectors Container */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Dynamic Role Selector */}
          <div className="inline-block px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-xs">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-2">Demo Role:</span>
            <select
              value={demoRole}
              onChange={(e) => setDemoRole(e.target.value as any)}
              className="bg-transparent border-0 text-[11px] font-extrabold text-[#1b4332] focus:ring-0 focus:outline-none cursor-pointer"
            >
              <option value="Super Admin">Super Admin (All Portals)</option>
              <option value="IT Department">IT Department</option>
              <option value="Admin Department">Admin Department</option>
              <option value="Sales Team">Sales Team</option>
              <option value="QA Team">QA Team</option>
              <option value="QMS Team">QMS Team</option>
            </select>
          </div>

          {/* Accessibility Font Size Selector */}
          <div className="inline-flex items-center px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-xs gap-1.5 animate-fade-in">
            <Type className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Font Size:</span>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as any)}
              className="bg-transparent border-0 text-[11px] font-extrabold text-[#1b4332] focus:ring-0 focus:outline-none cursor-pointer"
            >
              <option value="sm">Small</option>
              <option value="base">Normal</option>
              <option value="lg">Large</option>
              <option value="xl">X-Large</option>
            </select>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1b4332] tracking-tight max-w-2xl mx-auto leading-tight">
          Connecting the Global Bio-Pharma Ecosystem
        </h1>

        <p className="text-xs md:text-sm text-slate-500 font-semibold max-w-2xl mx-auto leading-relaxed">
          Select a department workspace below to enter the live operating environment for enzymes, probiotics, prebiotics, postbiotics, bio-actives, and formulations management.
        </p>
      </div>

      {/* Portals Selector Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full z-10 my-12">
        {portals.map((p, idx) => {
          const style = getColorStyles(p.color);
          const Icon = p.icon;
          const isAuthorized = demoRole === 'Super Admin' || demoRole === p.roleKey;

          return (
            <div
              key={idx}
              className={`bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer ${
                isAuthorized ? style.border : 'opacity-40 grayscale cursor-not-allowed border-slate-200'
              }`}
              onClick={() => handleEnterPortal(p)}
            >
              <div className="space-y-4">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${style.bg}`}>
                  <Icon className={`w-5 h-5 ${style.text}`} />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 text-sm tracking-tight">{p.name}</span>
                    <span className="px-1.5 py-0.5 bg-emerald-50 text-[8px] font-bold text-emerald-700 uppercase tracking-widest rounded border border-emerald-100">
                      Workspace
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold hover:underline block">Meteoric Division</span>
                </div>

                <p className="text-[11px] font-semibold text-slate-500 leading-relaxed pr-1">
                  {p.desc}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-[#1b4332] font-black tracking-wide bg-[#1b4332]/5 px-2.5 py-1 rounded-full">
                  {p.counter}
                </span>

                <button
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm transition-transform hover:scale-105 ${
                    isAuthorized ? style.fill : 'bg-slate-300'
                  }`}
                  disabled={!isAuthorized}
                >
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Central Dashboard Card */}
        <Link
          to="/dashboard"
          className="bg-slate-800 border border-slate-700 rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 text-white"
        >
          <div className="space-y-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-slate-700 text-teal-400">
              <Activity className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm tracking-tight">Central Dashboard</span>
                <span className="px-1.5 py-0.5 bg-teal-900 text-[8px] font-bold text-teal-300 uppercase tracking-widest rounded border border-teal-800">
                  KPI Analytics
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold block">Cross-Module Monitor</span>
            </div>

            <p className="text-[11px] font-semibold text-slate-300 leading-relaxed pr-1">
              Cross-module metrics aggregator pulling from R&D, Admin, QA and QMS audit workflows.
            </p>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-700 flex items-center justify-between">
            <span className="text-[10px] text-teal-300 font-black tracking-wide bg-teal-950 px-2.5 py-1 rounded-full">
              {openTicketsCount} Pending Tickets
            </span>

            <button
              className="w-7 h-7 rounded-full flex items-center justify-center bg-teal-500 text-slate-900 shadow-sm"
            >
              <ArrowRight className="w-4 h-4 font-bold" />
            </button>
          </div>
        </Link>
      </div>

      {/* Bottom KPI strip */}
      <div className="max-w-6xl mx-auto w-full bg-[#1b4332] text-white py-4 px-8 rounded-2xl flex flex-wrap justify-around text-center gap-4 text-xs font-bold shadow-md z-10">
        <div>{openTicketsCount} Open Tickets</div>
        <div className="w-px bg-white/20 hidden md:block" />
        <div>{pendingTravelCount} Travel Approvals</div>
        <div className="w-px bg-white/20 hidden md:block" />
        <div>{activeLeadsCount} Active Leads</div>
        <div className="w-px bg-white/20 hidden md:block" />
        <div>{pendingCoaCount} QA Requests Pending</div>
      </div>
    </div>
  );
}
