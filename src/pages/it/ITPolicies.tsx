import React, { useState } from 'react';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { FileText, Download, CheckCircle, Plus, Eye } from 'lucide-react';

interface PolicyDocument {
  id: number;
  title: string;
  version: string;
  category: string;
  last_updated: string;
  uploaded_by_name: string;
  file_url: string;
  acknowledged: number; // 0 or 1
}

const initialDocs: PolicyDocument[] = [
  { id: 1, title: 'Meteoric Employee Security Guidelines', version: '2.1', category: 'Security Policy', last_updated: '2026-05-12', uploaded_by_name: 'Smit Patel', file_url: '/docs/security.pdf', acknowledged: 1 },
  { id: 2, title: 'Remote Work VPN Setup SOP', version: '1.4', category: 'IT SOP', last_updated: '2026-06-01', uploaded_by_name: 'IT Dept', file_url: '/docs/vpn_setup.pdf', acknowledged: 0 }
];

export default function ITPolicies() {
  const [docs, setDocs] = useState<PolicyDocument[]>(initialDocs);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    version: '1.0',
    category: 'IT SOP',
    file_url: '/docs/dummy.pdf'
  });

  const handleAcknowledge = (id: number) => {
    try {
      setDocs(docs.map(d => d.id === id ? { ...d, acknowledged: 1 } : d));
      showSuccess('Policy reading acknowledged.');
    } catch (err) {
      showError('Failed to acknowledge document.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newDoc: PolicyDocument = {
        id: Date.now(),
        title: formData.title,
        version: formData.version,
        category: formData.category,
        last_updated: new Date().toISOString(),
        uploaded_by_name: user?.name || 'Admin',
        file_url: formData.file_url,
        acknowledged: 0
      };
      setDocs([newDoc, ...docs]);
      showSuccess('IT Policy document uploaded successfully.');
      setModalOpen(false);
      setFormData({ title: '', version: '1.0', category: 'IT SOP', file_url: '/docs/dummy.pdf' });
    } catch (err) {
      showError('Failed to upload document.');
    }
  };

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">IT Policies & SOP Repository</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">Access central IT security documents, compliance guides, and standard operating procedures (SOPs) for Meteoric Biopharmaceuticals.</p>
        </div>
        {user?.role !== 'executive' && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.map(doc => (
          <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">
                  {doc.category}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Version: {doc.version}
                </span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug">
                {doc.title}
              </h3>
              <p className="text-[10px] font-semibold text-slate-400">
                Last Updated: {new Date(doc.last_updated).toLocaleDateString()} by {doc.uploaded_by_name || 'Admin'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <a
                  href={doc.file_url}
                  download
                  className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors inline-block"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </a>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors inline-block"
                  title="View PDF"
                >
                  <Eye className="w-4 h-4" />
                </a>
              </div>

              {doc.acknowledged > 0 ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <CheckCircle className="w-4.5 h-4.5" />
                  <span>Acknowledged</span>
                </span>
              ) : (
                <button
                  onClick={() => handleAcknowledge(doc.id)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Mark as Read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Upload Policy / SOP Document">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Document Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Employee Security Guidelines"
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Document Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="IT SOP">IT SOP</option>
                <option value="Security Policy">Security Policy</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Version</label>
              <input
                type="text"
                required
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="e.g. 1.0"
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Mock File Link / URL</label>
            <input
              type="text"
              required
              value={formData.file_url}
              onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              Publish SOP
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
