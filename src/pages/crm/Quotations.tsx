import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, ChevronLeft, Trash2, ShieldCheck, Mail, Send, Edit2, FileText, History, Download } from 'lucide-react';
import { Quotation } from '../../data/mockLeads';

export default function Quotations() {
  const { quotations, leads, addQuotation, updateQuotationStatus, requestCoaFromQA } = useAppData();
  const { user } = useAuth();
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [historyModalQuote, setHistoryModalQuote] = useState<Quotation | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Builder Form State
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [lineItems, setLineItems] = useState([{ item: '', qty: 1, price: 0 }]);
  const [totalAmount, setTotalAmount] = useState(0);

  // Check query parameters to open builder automatically prefilled (e.g. from Lead Details page)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const prefillLeadId = queryParams.get('leadId');
    const prefillCustomer = queryParams.get('customer');
    if (prefillLeadId && prefillCustomer) {
      setSelectedLeadId(prefillLeadId);
      setCustomerName(prefillCustomer);
      setShowBuilder(true);
    }
  }, [location]);

  // Auto calculate total
  useEffect(() => {
    const total = lineItems.reduce((acc, curr) => acc + (curr.qty * curr.price), 0);
    setTotalAmount(total);
  }, [lineItems]);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { item: '', qty: 1, price: 0 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, field: keyof typeof lineItems[0], value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const handleLeadSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const leadId = e.target.value;
    setSelectedLeadId(leadId);
    const lead = leads.find(l => String(l.id) === String(leadId));
    if (lead) {
      setCustomerName(`${lead.name} (${lead.company})`);
    }
  };

  const handleSaveQuotation = (status: Quotation['status'] = 'Draft') => {
    if (!selectedLeadId || !customerName) {
      showError('Please select a client contact.');
      return;
    }
    
    // Check if item descriptions are filled
    const invalid = lineItems.some(i => !i.item.trim());
    if (invalid) {
      showError('Please input a description for all line items.');
      return;
    }

    addQuotation({
      lead_id: Number(selectedLeadId),
      customer_name: customerName,
      amount: totalAmount,
      line_items: lineItems,
      product_category: lineItems[0]?.item || 'Enzymes'
    });

    showSuccess(`Quotation saved successfully as ${status}.`);
    setShowBuilder(false);
    navigate('/crm/quotations', { replace: true });
  };

  const handleRequestCOA = (id: number, quoteNo: string) => {
    requestCoaFromQA(id);
    showSuccess(`COA analysis request submitted for Quotation ${quoteNo}.`);
  };

  const handleUpdateStatus = (id: number, status: Quotation['status']) => {
    updateQuotationStatus(id, status);
    showSuccess(`Quotation status updated to ${status}.`);
  };

  const handleGeneratePDF = (row: Quotation) => {
    const win = window.open('', '_blank');
    if (!win) { showError('Popup blocked. Please allow popups.'); return; }
    const itemsHtml = (row.line_items || []).map((li: any) =>
      `<tr><td style="padding:6px 10px;border-bottom:1px solid #f1f5f9">${li.item || li.description || '-'}</td><td style="padding:6px 10px;border-bottom:1px solid #f1f5f9;text-align:center">${li.qty}</td><td style="padding:6px 10px;border-bottom:1px solid #f1f5f9;text-align:right">$${(li.price || li.unit_price || 0).toLocaleString()}</td><td style="padding:6px 10px;border-bottom:1px solid #f1f5f9;text-align:right">$${((li.qty || 1) * (li.price || li.unit_price || 0)).toLocaleString()}</td></tr>`
    ).join('');
    win.document.write(`<!DOCTYPE html><html><head><title>Quotation ${row.quote_no}</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#1e293b}h1{color:#4f46e5;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin-top:16px}th{background:#f8fafc;padding:8px 10px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#64748b}@media print{button{display:none}}</style></head><body><h1>METEORIC BIOPHARMACEUTICALS</h1><p style="color:#64748b;font-size:13px">Quotation — ${row.quote_no} | ${new Date(row.created_at).toLocaleDateString()}</p><hr style="border:none;border-top:2px solid #e2e8f0;margin:16px 0"/><p><strong>Client:</strong> ${row.customer_name}</p><p><strong>Status:</strong> ${row.status}</p><table><thead><tr><th>Item / Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${itemsHtml}</tbody></table><p style="text-align:right;margin-top:20px;font-size:18px"><strong>Grand Total: $${row.amount.toLocaleString()}</strong></p><br/><button onclick="window.print()" style="padding:8px 20px;background:#4f46e5;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px">🖨 Print / Save as PDF</button></body></html>`);
    win.document.close();
    showSuccess(`PDF preview opened for ${row.quote_no}.`);
  };

  const handleViewHistory = (row: Quotation) => {
    setHistoryModalQuote(row);
    setShowHistoryModal(true);
  };

  const handleEditQuotation = (row: Quotation) => {
    setEditingQuotation(row);
    setSelectedLeadId(String(row.lead_id));
    setCustomerName(row.customer_name);
    setLineItems(Array.isArray(row.line_items) && row.line_items.length > 0 ? row.line_items : [{ item: '', qty: 1, price: 0 }]);
    setShowBuilder(true);
  };

  const columns = [
    { header: 'Quote No.', accessor: 'quote_no', sortable: true, render: (row: Quotation) => <span className="font-bold text-slate-800">{row.quote_no}</span> },
    { header: 'Customer Client', accessor: 'customer_name', sortable: true },
    { header: 'Total Value ($)', accessor: 'amount', sortable: true, render: (row: Quotation) => <span className="font-semibold text-slate-700">${row.amount.toLocaleString()}</span> },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row: Quotation) => {
        let color = 'bg-slate-100 text-slate-500';
        if (row.status === 'Draft') color = 'bg-slate-100 text-slate-500 border border-slate-200';
        else if (row.status === 'Sent') color = 'bg-blue-50 text-blue-700 border border-blue-100';
        else if (row.status === 'Approved') color = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
        else if (row.status === 'Rejected') color = 'bg-rose-50 text-rose-700 border border-rose-100';
        else if (row.status === 'COA Requested') color = 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse';
        else if (row.status === 'COA Ready') color = 'bg-teal-50 text-teal-700 border border-teal-100';
        return <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${color}`}>{row.status}</span>;
      }
    },
    { header: 'Date Created', accessor: 'created_at', sortable: true, render: (row: Quotation) => <span>{new Date(row.created_at).toLocaleDateString()}</span> },
    {
      header: 'Actions',
      render: (row: Quotation) => {
        const canReqCOA = ['Draft', 'Sent', 'Approved', 'COA Ready'].includes(row.status);
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            {user?.role !== 'executive' && (
              <button
                onClick={() => handleEditQuotation(row)}
                className="p-1 hover:bg-indigo-50 rounded text-indigo-600 transition-colors"
                title="Edit Quotation"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {row.status === 'Draft' && user?.role !== 'executive' && (
              <button
                onClick={() => handleUpdateStatus(row.id, 'Sent')}
                className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                title="Send Quote to Customer"
              >
                <Mail className="w-4 h-4" />
              </button>
            )}
            {row.status === 'Sent' && user?.role !== 'executive' && (
              <button
                onClick={() => handleUpdateStatus(row.id, 'Approved')}
                className="p-1 hover:bg-slate-100 rounded text-emerald-600 transition-colors"
                title="Client Approved Quote"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            )}
            {canReqCOA && row.status !== 'COA Requested' && row.status !== 'COA Ready' && user?.role !== 'executive' && (
              <button
                onClick={() => handleRequestCOA(row.id, row.quote_no)}
                className="px-2 py-1 text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-800 rounded hover:bg-amber-100 transition-colors"
                title="Request COA from Quality Control department"
              >
                Request COA
              </button>
            )}
            {row.status === 'COA Ready' && (
              <span className="text-[10px] font-bold text-emerald-600">COA Attached</span>
            )}
            <button
              onClick={() => handleGeneratePDF(row)}
              className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors"
              title="Generate PDF"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewHistory(row)}
              className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors"
              title="View Quotation History"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        );
      }
    }
  ];

  if (showBuilder) {
    return (
      <div className="space-y-6 max-w-5xl select-none">
        {/* Builder Header */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setShowBuilder(false); navigate('/crm/quotations', { replace: true }); }} 
            className="p-2 border border-slate-200 hover:bg-slate-50 bg-white rounded-lg transition-all text-slate-600 shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quotations Builder Engine</span>
            <h1 className="text-lg font-bold text-slate-800 mt-0.5">Construct Sales Quotation</h1>
          </div>
        </div>

        {/* Builder Form Area */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          {/* Client select */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Select Client Lead</label>
              <select
                value={selectedLeadId}
                onChange={handleLeadSelect}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Choose contact...</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.company})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Customer Representation</label>
              <input
                type="text"
                disabled
                value={customerName}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 focus:outline-none"
                placeholder="Prefilled upon selecting lead"
              />
            </div>
          </div>

          {/* Line items dynamic list */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Line Items</h3>
            
            <div className="space-y-2">
              {lineItems.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      value={item.item}
                      onChange={(e) => handleLineItemChange(idx, 'item', e.target.value)}
                      placeholder="Product Description (e.g. Industrial film roll)"
                      className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.qty}
                      onChange={(e) => handleLineItemChange(idx, 'qty', parseInt(e.target.value) || 1)}
                      placeholder="Qty"
                      className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="w-28">
                    <input
                      type="number"
                      min="0"
                      required
                      value={item.price}
                      onChange={(e) => handleLineItemChange(idx, 'price', parseFloat(e.target.value) || 0)}
                      placeholder="Price/unit"
                      className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveLineItem(idx)}
                    className="p-2 border border-slate-200 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                    title="Remove Line"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddLineItem}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-2"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Add Line Item</span>
            </button>
          </div>

          {/* Aggregated totals */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-500 font-semibold text-sm">Calculated Quotation Total:</span>
            <span className="text-lg font-black text-slate-800">${totalAmount.toLocaleString()}</span>
          </div>

          {/* Builder Controls */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              onClick={() => { setShowBuilder(false); navigate('/crm/quotations', { replace: true }); }}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSaveQuotation('Draft')}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSaveQuotation('Sent')}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-1"
            >
              <Send className="w-4 h-4" />
              <span>Send to Customer</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Sales Quotations</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Audit proposals and dispatch COA analysis requests to the Quality Control lab.</p>
      </div>

      <DataTable
        columns={columns}
        data={quotations}
        searchKeys={['quote_no', 'customer_name', 'status']}
        searchPlaceholder="Search quotations..."
        filters={[
          { label: 'Status', accessor: 'status', options: ['Draft', 'Sent', 'Approved', 'Rejected', 'COA Requested', 'COA Ready'] }
        ]}
        exportFileName="meteoric_crm_quotations.csv"
        actions={
          user?.role !== 'executive' && (
            <button
              onClick={() => setShowBuilder(true)}
              className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Quotation</span>
            </button>
          )
        }
      />

      {/* Quotation History Modal */}
      {showHistoryModal && historyModalQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">Quotation History — {historyModalQuote.quote_no}</h2>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>
            <div className="text-sm text-slate-500 space-y-1">
              <div><span className="font-semibold text-slate-700">Client:</span> {historyModalQuote.customer_name}</div>
              <div><span className="font-semibold text-slate-700">Current Status:</span> <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700">{historyModalQuote.status}</span></div>
              <div><span className="font-semibold text-slate-700">Amount:</span> ${historyModalQuote.amount.toLocaleString()}</div>
              <div><span className="font-semibold text-slate-700">Created:</span> {new Date(historyModalQuote.created_at).toLocaleString()}</div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Line Items</p>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                {(historyModalQuote.line_items || []).map((li: any, idx: number) => (
                  <div key={idx} className="flex justify-between px-4 py-2 text-sm">
                    <span className="text-slate-700">{li.item || li.description || '-'}</span>
                    <span className="text-slate-500">Qty {li.qty} × ${(li.price || li.unit_price || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center pt-2">Status history is tracked in-memory only for this demo session.</p>
            <div className="flex justify-end">
              <button onClick={() => setShowHistoryModal(false)} className="px-4 py-2 text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
