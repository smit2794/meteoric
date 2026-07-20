import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { Plus, Eye, Send } from 'lucide-react';

export default function Orders() {
  const { orders, quotations, coas, addOrder, sendOrderToProduction } = useAppData();
  const { hasActionPermission } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    quotation_id: '',
    coa_id: '',
    customer: ''
  });

  const canCreate = hasActionPermission('sales', 'create');
  const canEdit = hasActionPermission('sales', 'edit');

  const quotes = quotations.filter(q => q.status === 'COA Ready' || q.status === 'Approved');
  const approvedCoas = coas.filter(c => c.status === 'Approved');

  const handleQuoteSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const quoteId = Number(e.target.value);
    const quote = quotes.find(q => q.id === quoteId);
    if (quote) {
      const matchingCoa = approvedCoas.find(c => c.quotation_id === quoteId);
      setFormData({
        quotation_id: String(quoteId),
        coa_id: matchingCoa ? String(matchingCoa.id) : '',
        customer: quote.customer_name
      });
    } else {
      setFormData({ quotation_id: '', coa_id: '', customer: '' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.quotation_id) {
      showError('Please select a quotation.');
      return;
    }
    const quoteId = Number(formData.quotation_id);
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;

    addOrder({
      order_no: `ORD-${Date.now().toString().slice(-4)}`,
      customer: formData.customer,
      quote_no: quote.quote_no,
      coa_no: approvedCoas.find(c => c.id === Number(formData.coa_id))?.coa_no || null,
      amount: quote.amount,
      status: 'Confirmed',
      vendor_acknowledged: 0,
      line_items_json: JSON.stringify(quote.line_items || []),
      test_params_json: JSON.stringify([])
    } as any);

    showSuccess('Sales order confirmed successfully.');
    setModalOpen(false);
    setFormData({ quotation_id: '', coa_id: '', customer: '' });
  };

  const handleSendToVendor = (id: number, orderNo: string) => {
    try {
      sendOrderToProduction(id);
      showSuccess(`Order ${orderNo} dispatched to vendor portal.`);
    } catch (err) {
      showError('Failed to dispatch order to vendor.');
    }
  };

  const columns = [
    { header: 'Order No.', accessor: 'order_no', sortable: true, render: (row: any) => <span className="font-bold text-slate-800">{row.order_no}</span> },
    { header: 'Customer', accessor: 'customer', sortable: true },
    { header: 'Quote Ref', accessor: 'quote_no', sortable: true },
    { header: 'COA Ref Cert', accessor: 'coa_no', render: (row: any) => row.coa_no || <span className="text-rose-500 font-bold text-xs bg-rose-50 px-2 py-0.5 rounded border border-rose-100">No COA</span> },
    {
      header: 'Fulfillment Status',
      accessor: 'status',
      sortable: true,
      render: (row: any) => {
        let color = 'bg-slate-100 text-slate-500';
        if (row.status === 'Confirmed') color = 'bg-blue-50 text-blue-700 border border-blue-100';
        else if (row.status === 'Sent to Vendor') color = 'bg-purple-50 text-purple-700 border border-purple-100 animate-pulse';
        else if (row.status === 'In Production') color = 'bg-amber-50 text-amber-700 border border-amber-100';
        else if (row.status === 'Dispatched') color = 'bg-teal-50 text-teal-700 border border-teal-100';
        else if (row.status === 'Delivered') color = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
        return <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${color}`}>{row.status}</span>;
      }
    },
    {
      header: 'Vendor Acknowledged',
      accessor: 'vendor_acknowledged',
      sortable: true,
      render: (row: any) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${row.vendor_acknowledged === 1 || row.vendor_acknowledged === true ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
          {row.vendor_acknowledged === 1 || row.vendor_acknowledged === true ? 'Acknowledged' : 'Pending'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row: any) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate(`/sales/orders/${row.id}`)}
            className="p-1 hover:bg-slate-100 rounded text-indigo-600 transition-colors flex items-center gap-0.5 text-xs font-semibold"
            title="View Order Pack & Handoff"
          >
            <Eye className="w-4 h-4" />
            <span>Open Pack</span>
          </button>
          {row.status === 'Confirmed' && canEdit && (
            <button
              onClick={() => handleSendToVendor(row.id, row.order_no)}
              className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Send Order Handoff pack to Vendor"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Fulfillment Orders</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Manage approved orders for Meteoric Biopharmaceuticals, aggregate quotation/COA dispatch packs, and track vendor acknowledgments.</p>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        searchKeys={['order_no', 'customer', 'quote_no', 'status']}
        searchPlaceholder="Search orders log..."
        filters={[
          { label: 'Status', accessor: 'status', options: ['Confirmed', 'Sent to Vendor', 'In Production', 'Dispatched', 'Delivered'] }
        ]}
        exportFileName="sales_orders.csv"
        actions={
          <button
            onClick={() => setModalOpen(true)}
            disabled={!canCreate}
            className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold rounded-lg shadow-sm ${canCreate ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>
        }
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Confirm New Fulfillment Order">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Select Approved Quotation</label>
            <select
              value={formData.quotation_id}
              onChange={handleQuoteSelect}
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">Select proposal...</option>
              {quotes.map(q => (
                <option key={q.id} value={q.id}>{q.quote_no} ({q.customer_name})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Client Customer</label>
              <input
                type="text"
                disabled
                value={formData.customer}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Associated COA Cert</label>
              <select
                disabled
                value={formData.coa_id}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 focus:outline-none"
              >
                <option value="">Auto prefilled from laboratory</option>
                {approvedCoas.map(c => (
                  <option key={c.id} value={c.id}>{c.coa_no} ({c.product})</option>
                ))}
              </select>
            </div>
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
              disabled={!canCreate}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Confirm Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
