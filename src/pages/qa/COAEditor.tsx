import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, ChevronLeft, Trash2, ShieldCheck, FileText, Send, Mail } from 'lucide-react';
import { CoaCertificate, CoaTestParam } from '../../data/mockCoas';
import { Quotation } from '../../data/mockLeads';

export default function COAEditor() {
  const { coas, quotations, addCoa, updateCoa, approveCoa } = useAppData();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingCoa, setEditingCoa] = useState<CoaCertificate | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [quotes, setQuotes] = useState<Quotation[]>([]);

  // Form Fields
  const [linkedRequestId, setLinkedRequestId] = useState('');
  const [selectedQuoteId, setSelectedQuoteId] = useState('');
  const [productName, setProductName] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [testParams, setTestParams] = useState<CoaTestParam[]>([
    { parameter: 'Purity', specification: '>= 99%', result: '', status: 'Pass' },
    { parameter: 'Moisture', specification: '<= 0.5%', result: '', status: 'Pass' }
  ]);

  useEffect(() => {
    // Filter quotes that need COA
    setQuotes(quotations.filter(q => q.status === 'COA Requested' || q.status === 'Approved' || q.status === 'Sent'));
  }, [quotations]);

  // Pre-fill form if redirected with query params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const reqId = queryParams.get('requestId');
    const quoteId = queryParams.get('quoteId');
    const prod = queryParams.get('product');

    if (reqId && quoteId && prod) {
      setLinkedRequestId(reqId);
      setSelectedQuoteId(quoteId);
      setProductName(prod);
      setBatchNo(`BATCH-${Date.now().toString().slice(-4)}`);
      setShowForm(true);
    }
  }, [location]);

  const handleAddParam = () => {
    setTestParams([...testParams, { parameter: '', specification: '', result: '', status: 'Pass' }]);
  };

  const handleRemoveParam = (index: number) => {
    if (testParams.length === 1) return;
    setTestParams(testParams.filter((_, i) => i !== index));
  };

  const handleParamChange = (index: number, field: keyof CoaTestParam, value: any) => {
    const updated = [...testParams];
    updated[index] = { ...updated[index], [field]: value };
    setTestParams(updated);
  };

  const handleSubmitCOA = (status: CoaCertificate['status'] = 'Draft') => {
    if (!selectedQuoteId || !productName || !batchNo) {
      showError('Please prefill linked quotation, product name, and batch number.');
      return;
    }

    const invalid = testParams.some(p => !p.parameter.trim() || !p.specification.trim() || !p.result.trim());
    if (invalid) {
      showError('Please enter specifications/results for all parameters.');
      return;
    }

    const linkedQuote = quotations.find(q => String(q.id) === String(selectedQuoteId));

    if (editingCoa) {
      updateCoa(editingCoa.id, {
        batch_no: batchNo,
        test_params: testParams,
        status
      });
      showSuccess(`COA ${editingCoa.coa_no} updated successfully.`);
      if (status === 'Approved') {
        approveCoa(editingCoa.id);
      }
    } else {
      addCoa({
        coa_request_id: linkedRequestId ? Number(linkedRequestId) : undefined,
        quotation_id: Number(selectedQuoteId),
        quote_no: linkedQuote?.quote_no || '',
        product: productName,
        batch_no: batchNo,
        prepared_by: String(user.id),
        reviewed_by: '',
        test_params: testParams
      });
      showSuccess('New COA record generated.');
      
      // If we immediately clicked 'Approved' on a new COA, we would need its ID to approve it.
      // Since addCoa doesn't return the ID, we'll just rely on the user to approve it from the table later if it was draft.
      // Or we can just find it by batchNo/productName, but for demo simplicity, we will just say it was saved as Draft, or we can just say "Approved" status was saved. But addCoa creates it as 'Draft' inside. We'd need to let AppDataContext handle that or we manually set it if we had control. Wait, `addCoa` hardcodes `status: 'Draft'`. We must call `approveCoa` for it to be approved. We can't do it in one go if `addCoa` doesn't return ID. So we'll just save it as Draft if they are creating a new one.
      if (status === 'Approved') {
        showSuccess('Please approve the newly created Draft COA from the table.');
      }
    }
    setShowForm(false);
    setEditingCoa(null);
    navigate('/portal/qa-team/coa-builder', { replace: true });
  };

  const handleApproveSend = (id: number, coaNo: string) => {
    approveCoa(id);
    showSuccess(`COA ${coaNo} approved and transmitted to Sales.`);
  };

  const handleOpenEdit = (coa: CoaCertificate) => {
    setEditingCoa(coa);
    setSelectedQuoteId(String(coa.quotation_id));
    setProductName(coa.product);
    setBatchNo(coa.batch_no);
    setTestParams(coa.test_params || []);
    setShowForm(true);
  };

  const handleGenerateCOAPDF = (row: CoaCertificate) => {
    const win = window.open('', '_blank');
    if (!win) { showError('Popup blocked. Please allow popups.'); return; }
    const paramsHtml = (row.test_params || []).map((p: CoaTestParam) =>
      `<tr><td style="padding:6px 10px;border-bottom:1px solid #f1f5f9">${p.parameter}</td><td style="padding:6px 10px;border-bottom:1px solid #f1f5f9">${p.specification}</td><td style="padding:6px 10px;border-bottom:1px solid #f1f5f9">${p.result || 'Pending'}</td><td style="padding:6px 10px;border-bottom:1px solid #f1f5f9;color:${p.status === 'Pass' ? '#16a34a' : '#dc2626'};font-weight:700">${p.status}</td></tr>`
    ).join('');
    win.document.write(`<!DOCTYPE html><html><head><title>COA ${row.coa_no}</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#1e293b}h1{color:#4f46e5;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin-top:16px}th{background:#f8fafc;padding:8px 10px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#64748b}@media print{button{display:none}}</style></head><body><h1>METEORIC BIOPHARMACEUTICALS</h1><p style="color:#64748b;font-size:13px">Certificate of Analysis — ${row.coa_no} | ${new Date(row.created_at).toLocaleDateString()}</p><hr style="border:none;border-top:2px solid #e2e8f0;margin:16px 0"/><p><strong>Product:</strong> ${row.product}</p><p><strong>Batch No.:</strong> ${row.batch_no}</p><p><strong>Linked Quote:</strong> ${row.quote_no}</p><p><strong>Status:</strong> ${row.status}</p><table><thead><tr><th>Parameter</th><th>Specification</th><th>Result</th><th>Status</th></tr></thead><tbody>${paramsHtml}</tbody></table><br/><button onclick="window.print()" style="padding:8px 20px;background:#4f46e5;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px">🖨 Print / Save as PDF</button></body></html>`);
    win.document.close();
    showSuccess(`COA PDF preview opened for ${row.coa_no}.`);
  };

  const handleSendToSales = (row: CoaCertificate) => {
    if (row.status !== 'Approved') {
      showError('Only approved COAs can be sent to the Sales team.');
      return;
    }
    showSuccess(`COA ${row.coa_no} sent to Sales CRM team successfully.`);
  };

  const columns = [
    { header: 'COA No.', accessor: 'coa_no', sortable: true, render: (row: CoaCertificate) => <span className="font-bold text-slate-800">{row.coa_no}</span> },
    { header: 'Linked Quote', accessor: 'quote_no', sortable: true },
    { header: 'Product Spec', accessor: 'product', sortable: true },
    { header: 'Batch ID', accessor: 'batch_no', sortable: true },
    { header: 'Date Issued', accessor: 'created_at', render: (row: CoaCertificate) => <span>{new Date(row.created_at).toLocaleDateString()}</span> },
    {
      header: 'Quality Status',
      accessor: 'status',
      sortable: true,
      render: (row: CoaCertificate) => {
        let color = 'bg-slate-100 text-slate-500';
        if (row.status === 'Approved') color = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
        else if (row.status === 'Draft') color = 'bg-slate-100 text-slate-500 border border-slate-200';
        return <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${color}`}>{row.status}</span>;
      }
    },
    {
      header: 'Actions',
      render: (row: CoaCertificate) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          {row.status === 'Draft' && user?.role !== 'executive' && (
            <>
              <button
                onClick={() => handleOpenEdit(row)}
                className="px-2 py-1 text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-700 rounded hover:bg-slate-100 transition-colors"
                title="Edit COA"
              >
                Edit COA
              </button>
              <button
                onClick={() => handleApproveSend(row.id, row.coa_no)}
                className="px-2 py-1 text-[10px] font-bold bg-emerald-600 border border-emerald-600 text-white rounded hover:bg-emerald-500 transition-colors flex items-center gap-0.5"
                title="Save & Approve COA"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Save COA</span>
              </button>
            </>
          )}
          <button
            onClick={() => handleGenerateCOAPDF(row)}
            className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors"
            title="Generate PDF"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleSendToSales(row)}
            className="p-1 hover:bg-indigo-50 rounded text-indigo-600 transition-colors"
            title="Send COA to Sales Team"
          >
            <Send className="w-4 h-4" />
          </button>
          {row.status === 'Approved' && (
            <span className="text-[10px] font-bold text-slate-400">Locked / Approved</span>
          )}
        </div>
      )
    }
  ];

  if (showForm) {
    return (
      <div className="space-y-6 max-w-5xl select-none">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setShowForm(false); setEditingCoa(null); navigate('/portal/qa-team/coa-builder', { replace: true }); }} 
          className="p-2 border border-slate-200 hover:bg-slate-50 bg-white rounded-lg transition-all text-slate-600 shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quality Assurance lab</span>
            <h1 className="text-lg font-bold text-slate-800 mt-0.5">
              {editingCoa ? `Edit Analytical Certificate: ${editingCoa.coa_no}` : 'Generate Certificate of Analysis (COA)'}
            </h1>
          </div>
        </div>

        {/* Creator Form Area */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Linked Quotation Ref</label>
              <select
                disabled={!!editingCoa || !!linkedRequestId}
                value={selectedQuoteId}
                onChange={(e) => setSelectedQuoteId(e.target.value)}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">Select Quotation...</option>
                {quotes.map(q => (
                  <option key={q.id} value={q.id}>{q.quote_no} ({q.customer_name})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Batch Identification ID</label>
              <input
                type="text"
                required
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                placeholder="e.g. BATCH-CH-992"
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Product Name</label>
            <input
              type="text"
              required
              disabled={!!editingCoa || !!linkedRequestId}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Industrial Chemical Formulation A"
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Test parameters dynamic list */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Laboratory Test Parameters</h3>
            
            <div className="space-y-3">
              {testParams.map((param, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-3 items-stretch">
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      value={param.parameter}
                      onChange={(e) => handleParamChange(idx, 'parameter', e.target.value)}
                      placeholder="Parameter (e.g. Purity %)"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      value={param.specification}
                      onChange={(e) => handleParamChange(idx, 'specification', e.target.value)}
                      placeholder="Specification Target (e.g. >= 99.5%)"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      value={param.result}
                      onChange={(e) => handleParamChange(idx, 'result', e.target.value)}
                      placeholder="Lab Result (e.g. 99.7%)"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="w-32">
                    <select
                      value={param.status}
                      onChange={(e) => handleParamChange(idx, 'status', e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                      <option value="NA">N/A</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveParam(idx)}
                    className="p-2 border border-slate-200 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0 flex items-center justify-center"
                    title="Remove Line"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddParam}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-2"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Add Test Parameter</span>
            </button>
          </div>

          {/* Builder Controls */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              onClick={() => { setShowForm(false); setEditingCoa(null); navigate('/portal/qa-team/coa-builder', { replace: true }); }}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmitCOA('Draft')}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSubmitCOA('Approved')}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Approve & Send to Sales</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Analytical Certificates (COA) Log</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">Audit active quality assurance certifications, batch results, and lab specifications logs.</p>
        </div>
        {user?.role !== 'executive' && (
          <button
            onClick={() => {
              setEditingCoa(null);
              setLinkedRequestId('');
              setSelectedQuoteId('');
              setProductName('');
              setBatchNo(`BATCH-${Date.now().toString().slice(-4)}`);
              setTestParams([
                { parameter: 'Purity', specification: '>= 99%', result: '', status: 'Pass' },
                { parameter: 'Moisture', specification: '<= 0.5%', result: '', status: 'Pass' }
              ]);
              setShowForm(true);
            }}
            className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New COA Log</span>
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={coas}
        searchKeys={['coa_no', 'quote_no', 'product', 'batch_no']}
        searchPlaceholder="Search certificates history..."
        filters={[
          { label: 'Status', accessor: 'status', options: ['Draft', 'Approved'] }
        ]}
        exportFileName="qa_coa_certificates.csv"
      />
    </div>
  );
}
