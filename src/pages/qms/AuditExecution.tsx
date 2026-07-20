import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function AuditExecution() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { audits, updateAuditChecklist, addNC, demoRole } = useAppData();
  const { hasActionPermission } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [audit, setAudit] = useState<any>(null);
  const [checklist, setChecklist] = useState<any[]>([]);
  
  const canEdit = hasActionPermission('qms', 'edit');

  // NC Modal Form State
  const [ncModalOpen, setNcModalOpen] = useState(false);
  const [ncData, setNcData] = useState({
    description: '',
    department: '',
    due_date: new Date(Date.now() + 15*24*60*60*1000).toISOString().split('T')[0], // 15 days default
    assigned_name: `${demoRole} User`
  });

  useEffect(() => {
    if (id) {
      const found = audits.find(a => String(a.id) === String(id));
      if (found) {
        setAudit(found);
        setChecklist(found.checklist || []);
        setNcData(prev => ({
          ...prev,
          department: found.department
        }));
      }
    }
  }, [id, audits]);

  const handleStatusChange = (index: number, val: string) => {
    const updated = [...checklist];
    updated[index].status = val;
    setChecklist(updated);
  };

  const handleCommentChange = (index: number, val: string) => {
    const updated = [...checklist];
    updated[index].comment = val;
    setChecklist(updated);
  };

  const handleSaveChecklist = (auditStatus: any = 'In Progress') => {
    if (!audit) return;
    try {
      updateAuditChecklist(audit.id, checklist, auditStatus);
      showSuccess(`Audit checklist saved as ${auditStatus}.`);
      if (auditStatus === 'Completed') {
        navigate('/portal/qms-team/audits');
      }
    } catch (err) {
      showError('Failed to save checklist.');
    }
  };

  const handleRaiseNC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!audit) return;
    try {
      addNC({
        description: ncData.description,
        department: ncData.department,
        due_date: ncData.due_date,
        assigned_name: ncData.assigned_name
      } as any);
      showSuccess(`Non-Conformance raised successfully.`);
      setNcModalOpen(false);
      setNcData(prev => ({ ...prev, description: '' }));
    } catch (err) {
      showError('Failed to raise Non-Conformance.');
    }
  };

  if (!audit) {
    return (
      <div className="text-center py-12">
        <h3 className="text-sm font-bold text-slate-800">Audit record not found</h3>
        <button onClick={() => navigate(-1)} className="mt-4 text-xs font-semibold text-indigo-600">Go Back</button>
      </div>
    );
  }

  const isCompleted = audit.status === 'Completed';

  return (
    <div className="space-y-6 max-w-5xl select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 border border-slate-200 hover:bg-slate-50 bg-white rounded-lg transition-all text-slate-600 shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit Checklist Execution</span>
            <h1 className="text-lg font-bold text-slate-800 mt-0.5">{audit.audit_id}: {audit.department} Audit</h1>
          </div>
        </div>

        {/* Controls */}
        {!isCompleted && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNcModalOpen(true)}
              disabled={!canEdit}
              className={`flex items-center gap-1 px-3 py-2 border rounded-lg shadow-sm text-xs font-semibold ${canEdit ? 'border-rose-200 hover:bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200'}`}
            >
              <AlertCircle className="w-4 h-4" />
              <span>Raise NC</span>
            </button>
            <button
              onClick={() => handleSaveChecklist('In Progress')}
              disabled={!canEdit}
              className={`flex items-center gap-1 px-3 py-2 border rounded-lg shadow-sm text-xs font-semibold ${canEdit ? 'border-slate-200 hover:bg-slate-50 text-slate-700' : 'bg-slate-50 text-slate-400 cursor-not-allowed'}`}
            >
              <Save className="w-4 h-4" />
              <span>Save Progress</span>
            </button>
            <button
              onClick={() => handleSaveChecklist('Completed')}
              disabled={!canEdit}
              className={`flex items-center gap-1 px-3.5 py-2 text-white text-xs font-semibold rounded-lg shadow-sm ${canEdit ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-300 cursor-not-allowed'}`}
            >
              <CheckCircle className="w-4.5 h-4.5" />
              <span>Submit Audit</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Inspection Checklist</h3>
        
        <div className="divide-y divide-slate-100 font-medium text-slate-700">
          {checklist.map((item, idx) => (
            <div key={idx} className="py-4 flex flex-col md:flex-row gap-4 items-stretch justify-between">
              <div className="flex-1 pr-4 space-y-1">
                <span className="text-xs text-slate-400 font-bold block">Inspection Item {idx + 1}</span>
                <p className="text-sm font-bold text-slate-800 leading-snug">{item.item}</p>
              </div>

              {/* Input Comments & Status Toggles */}
              <div className="flex flex-col md:flex-row gap-3 items-center shrink-0">
                <input
                  type="text"
                  disabled={isCompleted || !canEdit}
                  value={item.comment || ''}
                  onChange={(e) => handleCommentChange(idx, e.target.value)}
                  placeholder="Observation notes..."
                  className="text-xs px-3.5 py-2 w-72 border border-slate-200 rounded-lg bg-white disabled:bg-slate-50 focus:outline-none"
                />

                {/* Status Toggles */}
                <div className="flex border border-slate-200 rounded-lg overflow-hidden shrink-0">
                  {['Pass', 'Fail', 'NA'].map(state => {
                    const isSelected = item.status === state;
                    let activeColor = 'bg-slate-200 text-slate-700';
                    if (state === 'Pass') activeColor = 'bg-emerald-600 text-white';
                    if (state === 'Fail') activeColor = 'bg-rose-600 text-white';

                    return (
                      <button
                        key={state}
                        type="button"
                        disabled={isCompleted || !canEdit}
                        onClick={() => handleStatusChange(idx, state)}
                        className={`px-3 py-1.5 text-xs font-bold transition-all ${
                          isSelected ? activeColor : 'bg-white hover:bg-slate-50 text-slate-600'
                        } ${(!canEdit || isCompleted) && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {state}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Raise NC Modal */}
      <Modal isOpen={ncModalOpen} onClose={() => setNcModalOpen(false)} title="Raise Compliance Non-Conformance (NC)">
        <form onSubmit={handleRaiseNC} className="space-y-4">
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex gap-3 text-rose-800 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-rose-900 font-bold mb-0.5">Audit Deviation Identified:</strong>
              Use this form to log a Non-Conformance report linked directly to observations identified during this department audit.
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Deviation Description</label>
            <textarea
              required
              rows={4}
              value={ncData.description}
              onChange={(e) => setNcData({ ...ncData, description: e.target.value })}
              placeholder="Describe the failure or compliance deviation in detail..."
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Department</label>
              <input
                type="text"
                disabled
                value={ncData.department}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Corrective Action Due Date</label>
              <input
                type="date"
                required
                value={ncData.due_date}
                onChange={(e) => setNcData({ ...ncData, due_date: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Assign CAPA Owner</label>
            <input
              type="text"
              disabled
              value={ncData.assigned_name}
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setNcModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canEdit}
              className="px-4 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Raise NC Report
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
