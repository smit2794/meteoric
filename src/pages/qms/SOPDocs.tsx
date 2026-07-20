import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { Plus, Download, CheckCircle } from 'lucide-react';

export default function SOPDocs() {
  const { qmsDocuments, addQmsDocument, acknowledgeQmsDoc, demoRole } = useAppData();
  const { hasActionPermission } = useAuth();
  const { showSuccess, showError } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'SOP',
    version: '1.0',
    owner_name: `${demoRole} User`,
    last_reviewed: new Date().toISOString().split('T')[0],
    next_review: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0] // 1 yr review
  });

  const canCreate = hasActionPermission('qms', 'create');

  const handleAcknowledge = (id: number) => {
    try {
      acknowledgeQmsDoc(id);
      showSuccess('QMS document reading acknowledged.');
    } catch (err) {
      showError('Failed to record acknowledgment.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addQmsDocument({
        title: formData.title,
        category: formData.category,
        version: formData.version,
        owner_name: formData.owner_name,
        last_reviewed: formData.last_reviewed,
        next_review: formData.next_review
      } as any);
      showSuccess('QMS SOP document published successfully.');
      setModalOpen(false);
      setFormData({ ...formData, title: '' });
    } catch (err) {
      showError('Failed to upload document.');
    }
  };

  const columns = [
    { header: 'Document Name', accessor: 'title', sortable: true, render: (row: any) => <span className="font-bold text-slate-800">{row.title}</span> },
    { header: 'Category', accessor: 'category', sortable: true },
    { header: 'Version', accessor: 'version', sortable: true },
    { header: 'Owner', accessor: 'owner_name', sortable: true },
    { header: 'Last Reviewed', accessor: 'last_reviewed', sortable: true },
    { header: 'Next Review Date', accessor: 'next_review', sortable: true },
    {
      header: 'Actions',
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="p-1 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
          {row.acknowledged ? (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Acknowledged</span>
            </span>
          ) : (
            <button
              onClick={() => handleAcknowledge(row.id)}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded"
            >
              Acknowledge Read
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">QMS SOP & Document Control</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">Audit active QMS standard operating procedures (SOP), checklists, and form templates for Meteoric Biopharmaceuticals.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          disabled={!canCreate}
          className={`flex items-center gap-1 px-3 py-2 text-white text-xs font-semibold rounded-lg shadow-sm ${canCreate ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-300 cursor-not-allowed'}`}
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={qmsDocuments}
        searchKeys={['title', 'category', 'owner_name']}
        searchPlaceholder="Search SOP documentation..."
        filters={[
          { label: 'Category', accessor: 'category', options: ['SOP', 'Quality Policy', 'Form Template'] }
        ]}
        exportFileName="qms_sop_documents.csv"
      />

      {/* Upload SOP Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Upload QMS Document / SOP">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Document Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Calibration SOP for Lab Balance"
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="SOP">Standard Operating Procedure (SOP)</option>
                <option value="Quality Policy">Quality Policy</option>
                <option value="Form Template">Form Template</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Owner / Author</label>
              <input
                type="text"
                disabled
                value={formData.owner_name}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Last Reviewed Date</label>
              <input
                type="date"
                required
                value={formData.last_reviewed}
                onChange={(e) => setFormData({ ...formData, last_reviewed: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Next Review Date</label>
              <input
                type="date"
                required
                value={formData.next_review}
                onChange={(e) => setFormData({ ...formData, next_review: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Version Ref</label>
            <input
              type="text"
              required
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              placeholder="e.g. 1.0"
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
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
              Publish SOP
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
