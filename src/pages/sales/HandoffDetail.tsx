import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Send, CheckSquare, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function HandoffDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, sendOrderToProduction, acknowledgeOrderVendor, updateOrderStatus } = useAppData();
  const { hasActionPermission } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [order, setOrder] = useState<any>(null);
  
  const canEdit = hasActionPermission('sales', 'edit');

  useEffect(() => {
    if (id) {
      const found = orders.find(o => String(o.id) === String(id));
      if (found) {
        setOrder(found);
      }
    }
  }, [id, orders]);

  const handleSendToVendor = () => {
    if (!order) return;
    try {
      sendOrderToProduction(order.id);
      showSuccess('Order pack dispatched to vendor successfully.');
    } catch (err) {
      showError('Failed to dispatch order pack.');
    }
  };

  const handleAcknowledge = () => {
    if (!order) return;
    try {
      acknowledgeOrderVendor(order.id);
      showSuccess('Order acknowledged by vendor. Production initiated.');
    } catch (err) {
      showError('Failed to record acknowledgment.');
    }
  };

  const handleUpdateStatus = (status: string) => {
    if (!order) return;
    try {
      updateOrderStatus(order.id, status as any);
      showSuccess(`Order status updated to ${status}.`);
    } catch (err) {
      showError('Failed to update status.');
    }
  };

  if (!order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-sm font-bold text-slate-800">Order not found</h3>
        <button onClick={() => navigate(-1)} className="mt-4 text-xs font-semibold text-indigo-600">Go Back</button>
      </div>
    );
  }

  // Parse JSON data safely
  const lineItems = typeof order.line_items_json === 'string' ? JSON.parse(order.line_items_json || '[]') : order.line_items_json;
  const testParams = typeof order.test_params_json === 'string' ? JSON.parse(order.test_params_json || '[]') : order.test_params_json;

  return (
    <div className="space-y-6 max-w-5xl select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 border border-slate-200 hover:bg-slate-50 bg-white rounded-lg transition-all text-slate-600 shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Fulfillment Handoff Pack</span>
            <h1 className="text-lg font-bold text-slate-800 mt-0.5">Order Pack: {order.order_no}</h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {order.status === 'Confirmed' && (
            <button
              onClick={handleSendToVendor}
              disabled={!canEdit}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-white text-xs font-semibold rounded-lg shadow-sm ${canEdit ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-300 cursor-not-allowed'}`}
            >
              <Send className="w-4.5 h-4.5" />
              <span>Send to Vendor</span>
            </button>
          )}

          {order.status === 'Sent to Vendor' && !order.vendor_acknowledged && (
            <button
              onClick={handleAcknowledge}
              disabled={!canEdit}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-white text-xs font-semibold rounded-lg shadow-sm ${canEdit ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-300 cursor-not-allowed'}`}
            >
              <CheckSquare className="w-4.5 h-4.5" />
              <span>Acknowledge Vendor Receipt</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Quotation details + COA details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quotation Pack */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-4.5 h-4.5 text-indigo-500" />
                <span>Quotation Pack: {order.quote_no}</span>
              </h3>
              <span className="text-sm font-black text-slate-800">${order.amount?.toLocaleString()}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs divide-y divide-slate-100 font-medium text-slate-700">
                <thead className="bg-slate-50 font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-2">Item Description</th>
                    <th className="px-4 py-2 text-center">Qty</th>
                    <th className="px-4 py-2 text-right">Unit Price</th>
                    <th className="px-4 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lineItems?.map((line: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-slate-800 font-bold">{line.item}</td>
                      <td className="px-4 py-3 text-center">{line.qty}</td>
                      <td className="px-4 py-3 text-right">${line.price?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">${(line.qty * line.price)?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* COA Pack */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                <span>Certificate of Analysis: {order.coa_no || 'Pending QA Approval'}</span>
              </h3>
              {order.batch_no && (
                <span className="text-xs font-bold text-slate-500">Batch Ref: {order.batch_no}</span>
              )}
            </div>

            {order.coa_no ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs divide-y divide-slate-100 font-medium text-slate-700">
                  <thead className="bg-slate-50 font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="px-4 py-2">Test Parameter</th>
                      <th className="px-4 py-2">Specification Target</th>
                      <th className="px-4 py-2">Lab Result</th>
                      <th className="px-4 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {testParams?.map((param: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-slate-800 font-bold">{param.parameter}</td>
                        <td className="px-4 py-3">{param.specification}</td>
                        <td className="px-4 py-3">{param.result}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${param.status === 'Pass' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{param.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-rose-500 font-bold bg-rose-50/50 border border-rose-100 rounded-xl">
                No Certificate of Analysis is linked to this order. QA laboratory analysis is required before vendor transmittal.
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Status & Logistics trackers */}
        <div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-xs text-slate-600">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fulfillment Tracking</h3>
            
            <div className="space-y-4">
              <div className="space-y-2.5">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-400 font-semibold">Order status</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase border border-indigo-100">{order.status}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-400 font-semibold">Vendor Receipt</span>
                  <span className="font-bold text-slate-700">{order.vendor_acknowledged ? 'Acknowledged' : 'Pending Handoff'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-400 font-semibold">Quote Reference</span>
                  <span className="font-bold text-slate-700">{order.quote_no}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400 font-semibold">Created Date</span>
                  <span className="font-bold text-slate-700">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Status Update panel */}
              {order.status !== 'Confirmed' && order.status !== 'Sent to Vendor' && (
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Update Logistic Status</label>
                  <div className="flex flex-col gap-1.5">
                    {['In Production', 'Dispatched', 'Delivered'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(status)}
                        disabled={!canEdit}
                        className={`w-full py-1.5 px-3 border rounded-lg text-left font-semibold transition-all ${
                          order.status === status 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' 
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
