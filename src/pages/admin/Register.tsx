import React, { useState, useEffect, useRef } from 'react';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Plus, PenTool, Trash2 } from 'lucide-react';

export default function Register() {
  const { register, addRegisterEntry, updateRegisterEntry } = useAppData();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const { showSuccess, showError } = useToast();

  const mockUsersList = [
    { id: '1', name: 'Admin User', role: 'Admin' },
    { id: '2', name: 'Dr. Dev Karve', role: 'R&D Head' },
    { id: '3', name: 'Nirmal Vyas', role: 'Exports Manager' },
    { id: '4', name: 'IT Technician', role: 'IT Support' }
  ];

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Inward' as 'Inward' | 'Outward',
    description: '',
    from_party: '',
    to_party: '',
    purpose: '',
    received_by: 'Admin User',
    signature_url: ''
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleOpenEdit = (entry: any) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.date,
      type: entry.type,
      description: entry.description,
      from_party: entry.from_party,
      to_party: entry.to_party,
      purpose: entry.purpose,
      received_by: entry.received_by,
      signature_url: entry.signature_url || ''
    });
    setModalOpen(true);
  };

  useEffect(() => {
    if (!formData.received_by) {
      setFormData(prev => ({ ...prev, received_by: mockUsersList[0].name }));
    }
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
  };

  useEffect(() => {
    if (modalOpen) {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }, 200);
    }
  }, [modalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const canvas = canvasRef.current;
      let signatureBase64 = formData.signature_url || '';
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        // Only override if user actually drew something (not blank canvas)
        if (dataUrl !== 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwA') {
          signatureBase64 = dataUrl;
        }
      }

      if (editingEntry) {
        updateRegisterEntry(editingEntry.id, { ...formData, signature_url: signatureBase64 });
        showSuccess('Register entry updated.');
      } else {
        await addRegisterEntry({ ...formData, signature_url: signatureBase64 });
        showSuccess('Inward/Outward register entry logged.');
      }

      setModalOpen(false);
      setEditingEntry(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'Inward',
        description: '',
        from_party: '',
        to_party: '',
        purpose: '',
        received_by: 'Admin User',
        signature_url: ''
      });
    } catch (err) {
      showError('Failed to save register entry.');
    }
  };

  const columns = [
    { header: 'Date', accessor: 'date', sortable: true },
    { header: 'Item / Document', accessor: 'description', sortable: true, render: (row: any) => <span className="font-bold text-slate-800">{row.description}</span> },
    { header: 'From Party', accessor: 'from_party', sortable: true },
    { header: 'To Party', accessor: 'to_party', sortable: true },
    { header: 'Purpose of Entry', accessor: 'purpose' },
    { header: 'Received By', accessor: 'received_by_name', sortable: true },
    {
      header: 'Signature Acknowledged',
      render: (row: any) => (
        row.signature_url ? (
          <img src={row.signature_url} alt="signature" className="h-8 max-w-[100px] border border-slate-100 rounded bg-slate-50 object-contain p-0.5" />
        ) : (
          <span className="text-slate-400 font-semibold text-xs">No signature</span>
        )
      )
    },
    {
      header: 'Actions',
      render: (row: any) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1 hover:bg-slate-100 rounded text-indigo-600 transition-colors"
            title="Update Entry"
          >
            <PenTool className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Meteoric Inward/Outward Register</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Audit physical files, files transmittal ledger, and capture digital e-signatures for custody verification.</p>
      </div>

      <DataTable
        columns={columns}
        data={register || []}
        searchKeys={['description', 'from_party', 'to_party', 'received_by_name']}
        searchPlaceholder="Search register..."
        exportFileName="meteoric_transmittal_register.csv"
        actions={
          canEdit ? (
            <button
              onClick={() => { setEditingEntry(null); setFormData({ date: new Date().toISOString().split('T')[0], type: 'Inward', description: '', from_party: '', to_party: '', purpose: '', received_by: 'Admin User', signature_url: '' }); setModalOpen(true); }}
              className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Entry</span>
            </button>
          ) : undefined
        }
      />

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingEntry(null); }} title={editingEntry ? 'Edit Register Entry' : 'Log Register Entry with Signature'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Register Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Custodian Signee</label>
              <select
                value={formData.received_by}
                onChange={(e) => setFormData({ ...formData, received_by: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {mockUsersList.map((u) => (
                  <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Item / Document Description</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Chemical Analysis Ledger Book 2026"
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">From Party (Originator)</label>
              <input
                type="text"
                required
                value={formData.from_party}
                onChange={(e) => setFormData({ ...formData, from_party: e.target.value })}
                placeholder="e.g. Audit Auditor Team"
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">To Party (Destination)</label>
              <input
                type="text"
                required
                value={formData.to_party}
                onChange={(e) => setFormData({ ...formData, to_party: e.target.value })}
                placeholder="e.g. QA Laboratory Shelf A"
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Purpose of Transmittal</label>
            <input
              type="text"
              required
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="e.g. Scheduled annual safety review"
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <PenTool className="w-3.5 h-3.5" />
                <span>Draw E-Signature Custodian</span>
              </label>
              <button
                type="button"
                onClick={clearSignature}
                className="text-[10px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear Signature</span>
              </button>
            </div>
            
            <div className="border-2 border-dashed border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 relative cursor-crosshair">
              <canvas
                ref={canvasRef}
                width={440}
                height={120}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[120px]"
              />
              <span className="absolute bottom-2 right-3 text-[9px] text-slate-400 font-bold select-none pointer-events-none uppercase">Sign inside box</span>
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
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              Log Entry
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
