import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Send, CheckCircle, AlertOctagon, UserPlus, Clock } from 'lucide-react';
import Modal from '../../components/Modal';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tickets, updateTicketStatus, assignTicket, addTicketComment } = useAppData();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const ticket = useMemo(() => tickets.find(t => t.id === Number(id)), [tickets, id]);

  const [commentText, setCommentText] = useState('');
  
  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigneeId, setAssigneeId] = useState('');

  // Hardcoded tech users
  const techs = [
    { id: 2, name: 'Smit Patel', role: 'IT Manager' },
    { id: 3, name: 'Tech Support', role: 'ittech' }
  ];

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !ticket) return;

    try {
      addTicketComment(ticket.id, commentText);
      setCommentText('');
      showSuccess('Comment added successfully.');
    } catch (err) {
      showError('Failed to post comment.');
    }
  };

  const handleResolve = () => {
    if (!ticket) return;
    try {
      updateTicketStatus(ticket.id, 'Resolved');
      showSuccess('Ticket status updated to Resolved.');
    } catch (err) {
      showError('Failed to resolve ticket.');
    }
  };

  const handleEscalate = () => {
    if (!ticket) return;
    try {
      updateTicketStatus(ticket.id, 'In Progress');
      showSuccess('Ticket escalated. Notifications sent to department managers.');
    } catch (err) {
      showError('Failed to escalate ticket.');
    }
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !assigneeId) return;
    try {
      const tech = techs.find(t => t.id.toString() === assigneeId);
      if (tech) {
        assignTicket(ticket.id, tech.id, tech.name);
        showSuccess('Ticket reassigned.');
      }
      setAssignModalOpen(false);
    } catch (err) {
      showError('Failed to assign ticket.');
    }
  };

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h3 className="text-sm font-bold text-slate-800">Ticket not found</h3>
        <button onClick={() => navigate(-1)} className="mt-4 text-xs font-semibold text-indigo-600">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl select-none">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 border border-slate-200 hover:bg-slate-50 bg-white rounded-lg transition-all text-slate-600 shadow-2xs">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ticket.category} Ticketing Engine</span>
          <h1 className="text-lg font-bold text-slate-800 mt-0.5">{ticket.ticket_id}: {ticket.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Incident Details</h3>
            <p className="text-sm text-slate-700 leading-relaxed font-semibold whitespace-pre-wrap">{ticket.description}</p>
            <div className="text-[11px] text-slate-400 font-semibold pt-2.5 border-t border-slate-100 flex items-center gap-4">
              <span>Raised by: <strong>{ticket.raised_by_name}</strong> </span>
              <span>•</span>
              <span>Opened: {new Date(ticket.created_at).toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[400px]">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Activity log & comments</h3>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 flex items-center justify-center text-xs font-bold text-slate-600">
                      {comment.user_name.charAt(0)}
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex-1 text-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-slate-800">{comment.user_name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{new Date(comment.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-600 font-semibold leading-relaxed">{comment.comment}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">No comments posted yet.</div>
              )}
            </div>

            <form onSubmit={handleSendComment} className="flex gap-2 border-t border-slate-100 pt-3">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post a reply or status update..."
                className="flex-1 text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button 
                type="submit" 
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition-colors shrink-0"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Management</h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-400 font-semibold">Current Status</span>
                <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                  ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' :
                  ticket.status === 'In Progress' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                }`}>{ticket.status}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-400 font-semibold">Priority Severity</span>
                <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                  ticket.priority === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-100 border' :
                  ticket.priority === 'High' ? 'bg-amber-50 text-amber-700 border-amber-100 border' : 'bg-indigo-50 text-indigo-700 border-indigo-100 border'
                }`}>{ticket.priority}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-400 font-semibold">Assigned Technician</span>
                <span className="font-bold text-slate-800">{ticket.assigned_to_name || <span className="text-slate-400">Unassigned</span>}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400 font-semibold">SLA Deadline</span>
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(ticket.sla_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && user?.role !== 'executive' && (
                <button
                  onClick={handleResolve}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark as Resolved</span>
                </button>
              )}
              
              {user?.role !== 'executive' && (
                <button
                  onClick={handleEscalate}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 font-semibold text-xs rounded-xl transition-colors"
                >
                  <AlertOctagon className="w-4 h-4" />
                  <span>Escalate Incident</span>
                </button>
              )}

              {user?.role !== 'executive' && (
                <button
                  onClick={() => { setAssigneeId(ticket.assigned_to?.toString() || ''); setAssignModalOpen(true); }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Reassign Staff</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Reassign Staff">
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Select IT staff member</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">Unassigned</option>
              {techs.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              Confirm Reassign
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
