import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Building, Plane, Truck, Clipboard, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { vendors, travelBookings, couriers, nonItAssets } = useAppData();
  const { user } = useAuth();

  const metrics = useMemo(() => {
    const categorySpend: Record<string, number> = {};
    (vendors || []).forEach((v: any) => {
      categorySpend[v.category] = (categorySpend[v.category] || 0) + v.total_spend;
    });
    const spendChart = Object.entries(categorySpend).map(([category, amount]) => ({
      category,
      amount
    }));

    return {
      activeVendors: (vendors || []).filter((v: any) => v.status === 'Active').length,
      pendingTravel: (travelBookings || []).filter((t: any) => t.status === 'Requested').length,
      couriersInTransit: (couriers || []).filter((c: any) => c.status === 'In Transit').length,
      lowStockItems: (nonItAssets || []).filter((i: any) => i.quantity <= i.reorder_level).length,
      spendChart
    };
  }, [vendors, travelBookings, couriers, nonItAssets]);

  const canAdd = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Meteoric Admin Operations</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">Overview of procurement vendors, staff travel bookings, active couriers, and office stationery inventory for Ahmedabad HQ and global offices.</p>
        </div>
        <div className="flex items-center gap-2">
          {canAdd && (
            <>
              <Link
                to="/admin/travel"
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Travel Request</span>
              </Link>
              <Link
                to="/admin/vendors"
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 bg-white text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vendor</span>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            category: 'PROCUREMENT', 
            val: metrics.activeVendors, 
            label: 'Active Vendors', 
            icon: Building, 
            border: 'border-l-4 border-indigo-500', 
            bg: 'bg-indigo-50/50', 
            iconBg: 'bg-indigo-100/50 text-indigo-500', 
            textColor: 'text-indigo-600', 
            footer: '→ Verified supply chain' 
          },
          { 
            category: 'TRAVELS', 
            val: metrics.pendingTravel, 
            label: 'Pending Travel Requests', 
            icon: Plane, 
            border: 'border-l-4 border-amber-500', 
            bg: 'bg-amber-50/50', 
            iconBg: 'bg-amber-100/50 text-amber-500', 
            textColor: 'text-amber-600', 
            footer: '→ Travel tickets logs' 
          },
          { 
            category: 'FREIGHTS', 
            val: metrics.couriersInTransit, 
            label: 'Couriers In Transit', 
            icon: Truck, 
            border: 'border-l-4 border-emerald-500', 
            bg: 'bg-emerald-50/50', 
            iconBg: 'bg-emerald-100/50 text-emerald-500', 
            textColor: 'text-emerald-600', 
            footer: '→ Active delivery shipments' 
          },
          { 
            category: 'INVENTORY', 
            val: metrics.lowStockItems, 
            label: 'Low Stock Items', 
            icon: Clipboard, 
            border: 'border-l-4 border-rose-500', 
            bg: 'bg-rose-50/50', 
            iconBg: 'bg-rose-100/50 text-rose-500', 
            textColor: 'text-rose-600', 
            footer: '→ Restocking required' 
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

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-80">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Monthly Procurement Spend (₹) by Category</h3>
          <div className="flex-1 min-h-0">
            {metrics.spendChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.spendChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" tickLine={false} axisLine={false} style={{ fontSize: '10px', fontWeight: '600' }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: '10px', fontWeight: '600' }} tickFormatter={(val: number) => `₹${val.toLocaleString()}`} />
                  <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Total Spend']} />
                  <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">No vendor spend data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
