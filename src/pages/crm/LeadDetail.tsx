import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Phone, Mail, Building, Clock, MessageSquare, Plus } from 'lucide-react';
import Modal from '../../components/Modal';
import { LeadInteraction } from '../../data/mockLeads';

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  const { leads, addLeadInteraction } = useAppData();
  const { user } = useAuth();
  
  const lead = leads.find(l => String(l.id) === id);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Note Form Fields
  const [noteType, setNoteType] = useState<LeadInteraction['type']>('Call');
  const [noteText, setNoteText] = useState('');

  const handleLogInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !lead) return;

    addLeadInteraction(lead.id, noteType, noteText);
    showSuccess('Interaction log updated.');
    setNoteText('');
    setModalOpen(false);
  };

  if (!lead) {
    return (
      <div className="text-center py-12">
        <h3 className="text-sm font-bold text-slate-800">Lead not found</h3>
        <button onClick={() => navigate(-1)} className="mt-4 text-xs font-semibold text-indigo-600">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 border border-slate-200 hover:bg-slate-50 bg-white rounded-lg transition-all text-slate-600 shadow-2xs">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lead Profile Timeline</span>
            <h1 className="text-lg font-bold text-slate-800 mt-0.5">{lead.name}</h1>
          </div>
        </div>

        {/* Builder Route */}
        {user?.role !== 'executive' && (
          <button
            onClick={() => navigate(`/crm/quotations/new?leadId=${lead.id}&customer=${encodeURIComponent(lead.name + ' (' + lead.company + ')')}`)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quotation</span>
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Interactions / Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Notes description card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leads Summary Notes</h3>
            <p className="text-sm text-slate-700 leading-relaxed font-semibold whitespace-pre-wrap">{lead.notes || 'No description notes logged.'}</p>
          </div>

          {/* Timeline interactions */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 flex flex-col h-[400px]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interaction History</h3>
              {user?.role !== 'executive' && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Log Call / Note
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              {lead.interactions && lead.interactions.length > 0 ? (
                lead.interactions.map(log => (
                  <div key={log.id} className="flex gap-4 items-start text-xs">
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-600 shrink-0">
                      {log.type === 'Call' ? <Phone className="w-4.5 h-4.5 text-blue-500" /> :
                       log.type === 'Email' ? <Mail className="w-4.5 h-4.5 text-purple-500" /> :
                       log.type === 'Meeting' ? <Building className="w-4.5 h-4.5 text-emerald-500" /> :
                       <MessageSquare className="w-4.5 h-4.5 text-slate-400" />}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-800">{log.type} entry</span>
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(log.created_at).toLocaleString()}</span>
                        </span>
                      </div>
                      <p className="text-slate-600 font-semibold leading-relaxed bg-slate-50/50 border border-slate-100/50 p-2.5 rounded-xl">{log.notes}</p>
                      <span className="text-[10px] text-slate-400 font-semibold block">Logged by {log.user_name}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">No interaction history.</div>
              )}
            </div>

          </div>

        </div>

        {/* Right: Contact Profile card */}
        <div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs text-slate-600">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Profile Card</h3>
            
            <div className="space-y-4">
              <div className="flex gap-3 items-center">
                <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0 flex items-center justify-center font-bold text-slate-500 text-sm">
                  {lead.name.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{lead.name}</h4>
                  <span className="text-[10px] font-semibold text-slate-400">{lead.company}</span>
                </div>
              </div>

              <div className="space-y-2.5 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-700">{lead.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-700">{lead.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-700">{lead.company}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Stage</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase border border-indigo-100">{lead.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Rep Assigned</span>
                  <span className="font-bold text-slate-700">{lead.assigned_rep || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Source Refer</span>
                  <span className="font-bold text-slate-700">{lead.source}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Log Interaction Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Log Client Contact Interaction">
        <form onSubmit={handleLogInteraction} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Interaction Type</label>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value as LeadInteraction['type'])}
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="Call">Phone Call</option>
              <option value="Email">Email transmittal</option>
              <option value="Meeting">In-Person Meeting</option>
              <option value="Note">General Note</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Conversation / Notes</label>
            <textarea
              required
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Record the details of the conversation..."
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
              Log Interaction
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
