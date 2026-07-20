import React, { useState } from 'react';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Download, Share2, Eye, RotateCcw } from 'lucide-react';

export default function SalesCOA() {
  const { coas, coaRequests, approveCoa } = useAppData();
  const { hasActionPermission } = useAuth();
  const { showSuccess, showWarning } = useToast();
  
  const [selectedCoa, setSelectedCoa] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareVendor, setShareVendor] = useState('');

  // We only show approved COAs that can be shared/received
  const approvedCoas = coas.filter(c => c.status === 'Approved');

  const handleDownload = (coaNo: string) => {
    showSuccess(`Downloading Certificate of Analysis ${coaNo} as PDF...`);
  };

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareVendor) return;
    showSuccess(`Successfully shared COA ${selectedCoa.coa_no} with vendor ${shareVendor}.`);
    setShareModalOpen(false);
    setShareVendor('');
  };

  const columns = [
    { header: 'COA Number', accessor: 'coa_no', sortable: true },
    { header: 'Product Name', accessor: 'product', sortable: true },
    { header: 'Batch Number', accessor: 'batch_no', sortable: true },
    { header: 'Linked Quotation', accessor: 'quote_no', sortable: true },
    { header: 'Status', accessor: 'status', render: () => <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">Approved</span> },
    {
      header: 'Actions',
      render: (row: any) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setSelectedCoa(row); setViewModalOpen(true); }}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDownload(row.coa_no)}
            className="p-1.5 hover:bg-slate-100 rounded text-indigo-600 transition-colors"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setSelectedCoa(row); setShareModalOpen(true); }}
            className="p-1.5 hover:bg-slate-100 rounded text-sky-600 transition-colors"
            title="Share with Vendor"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Sales COA Management</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Receive, review, download, and share analytical Certificates of Analysis (COA) with customers/vendors.</p>
      </div>

      <DataTable
        columns={columns}
        data={approvedCoas}
        searchPlaceholder="Search approved COAs..."
        searchKeys={['coa_no', 'product', 'batch_no', 'quote_no']}
        exportFileName="sales_coa_registry.csv"
      />

      {/* View Modal */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title={`View Certificate: ${selectedCoa?.coa_no}`}>
        {selectedCoa && (
          <div className="space-y-4 text-xs font-semibold text-slate-600">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Product</span>
                <span className="text-slate-800 text-sm font-extrabold">{selectedCoa.product}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Batch Number</span>
                <span className="text-slate-800 text-sm font-extrabold">{selectedCoa.batch_no}</span>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="space-y-2">
              <span className="text-slate-400 uppercase tracking-wider text-[9px] block">Analytical Test Parameters</span>
              <div className="border border-slate-100 rounded-lg overflow-hidden divide-y divide-slate-100">
                {selectedCoa.test_params?.map((p: any, idx: number) => (
                  <div key={idx} className="p-2 flex items-center justify-between hover:bg-slate-50/50">
                    <div>
                      <span className="text-slate-800 block">{p.parameter}</span>
                      <span className="text-[10px] text-slate-400">Spec: {p.specification}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-800 block font-bold">{p.result}</span>
                      <span className={`text-[9px] px-1 rounded font-bold ${p.status === 'Pass' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Share Modal */}
      <Modal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} title={`Share COA: ${selectedCoa?.coa_no}`}>
        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Recipient Vendor/Customer Name</label>
            <input
              type="text"
              required
              value={shareVendor}
              onChange={(e) => setShareVendor(e.target.value)}
              placeholder="e.g. Silva BioFoods Ltd"
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShareModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              Share Certificate
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
