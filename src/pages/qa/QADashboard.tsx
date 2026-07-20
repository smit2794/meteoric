import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { ShieldCheck, HelpCircle } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { CoaCertificate } from '../../data/mockCoas';

export default function QADashboard() {
  const { coaRequests, coas } = useAppData();

  const [metrics, setMetrics] = useState({
    pendingRequests: 0,
    issuedCoas: 0,
    recentCoas: [] as CoaCertificate[]
  });

  useEffect(() => {
    setMetrics({
      pendingRequests: coaRequests.filter(r => r.status === 'Pending' || r.status === 'In Progress').length,
      issuedCoas: coas.filter(c => c.status === 'Approved').length,
      recentCoas: coas.slice(0, 5) // Recent 5 COAs
    });
  }, [coaRequests, coas]);

  const columns = [
    { header: 'COA No.', accessor: 'coa_no', sortable: true, render: (row: CoaCertificate) => <span className="font-bold text-slate-800">{row.coa_no}</span> },
    { header: 'Product Name', accessor: 'product', sortable: true },
    { header: 'Batch No.', accessor: 'batch_no' },
    { header: 'Prepared By', accessor: 'prepared_by_name' },
    {
      header: 'Certificate Status',
      accessor: 'status',
      sortable: true,
      render: (row: CoaCertificate) => {
        let color = 'bg-slate-100 text-slate-500';
        if (row.status === 'Approved') color = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
        else if (row.status === 'Draft') color = 'bg-slate-100 text-slate-500 border border-slate-200';
        return <span className={`px-2 py-0.5 rounded text-xs font-bold ${color}`}>{row.status}</span>;
      }
    }
  ];

  return (
    <div className="space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Quality Assurance Dashboard</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">Audit active analytical certificate requests (COA) and batch test parameters.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/portal/qa-team/coa-requests"
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <span>Review COA Requests</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { 
            category: 'COA REQUESTS', 
            val: metrics.pendingRequests, 
            label: 'Pending COA Requests', 
            icon: HelpCircle, 
            border: 'border-l-4 border-amber-500', 
            bg: 'bg-amber-50/50', 
            iconBg: 'bg-amber-100/50 text-amber-500', 
            textColor: 'text-amber-600', 
            footer: '→ Queue verification needed' 
          },
          { 
            category: 'CERTIFICATES', 
            val: metrics.issuedCoas, 
            label: 'Approved Certificates Issued', 
            icon: ShieldCheck, 
            border: 'border-l-4 border-emerald-500', 
            bg: 'bg-emerald-50/50', 
            iconBg: 'bg-emerald-100/50 text-emerald-500', 
            textColor: 'text-emerald-600', 
            footer: '→ Transmitted lab records' 
          }
        ].map((c, i) => (
          <div key={i} className={`p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-44 ${c.border} ${c.bg}`}>
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

      {/* Recent Activity Table */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Recent COA Certificates Activity</h3>
        <DataTable
          columns={columns}
          data={metrics.recentCoas}
          searchPlaceholder="Search recent COAs..."
          exportFileName="qa_recent_coas.csv"
        />
      </div>
    </div>
  );
}
