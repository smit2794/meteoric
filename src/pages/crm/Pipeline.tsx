import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, ChevronRight, Eye, RefreshCw } from 'lucide-react';
import { Lead } from '../../data/mockLeads';

export default function Pipeline() {
  const { leads, updateLead } = useAppData();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();

  const stages = [
    { key: 'New', label: 'New Lead' },
    { key: 'Contacted', label: 'Contacted' },
    { key: 'Qualified', label: 'Qualified Opportunity' },
    { key: 'Proposal', label: 'Proposal / Quote Sent' },
    { key: 'Won', label: 'Closed - Won' },
    { key: 'Lost', label: 'Closed - Lost' }
  ] as const;

  const moveStage = (lead: Lead, direction: number) => {
    if (user?.role === 'executive') {
      showError('You do not have permission to change lead status.');
      return;
    }
    const currentIndex = stages.findIndex(s => s.key === lead.status);
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= stages.length) return;

    const nextStage = stages[nextIndex].key;
    updateLead(lead.id, { status: nextStage });
    showSuccess(`Moved ${lead.name} to ${stages[nextIndex].label}.`);
  };

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Sales Pipeline Board</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">Manage leads progression through pipeline stages from New contacts to Won accounts.</p>
        </div>
        <button
          className="p-2 border border-slate-200 hover:bg-slate-50 bg-white rounded-lg text-slate-600 transition-colors shadow-2xs"
          title="Refresh Board (No-op in demo)"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1200px] h-[600px] items-stretch">
          
          {stages.map(stage => {
            const stageLeads = leads.filter(l => l.status === stage.key);
            const totalValue = stageLeads.length;

            return (
              <div 
                key={stage.key} 
                className="w-80 bg-slate-100/70 border border-slate-200/50 rounded-2xl p-4 flex flex-col min-w-[280px]"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">{stage.label}</h3>
                  <span className="text-[10px] font-bold bg-white text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full shadow-2xs">
                    {totalValue}
                  </span>
                </div>

                {/* Cards List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {stageLeads.map(lead => (
                    <div 
                      key={lead.id} 
                      className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow space-y-3"
                    >
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs leading-snug line-clamp-1">{lead.name}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{lead.company}</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-2 border-t border-slate-50">
                        <span>Source: {lead.source}</span>
                        <span className="text-indigo-600 cursor-pointer flex items-center gap-0.5" onClick={() => navigate(`/crm/leads/${lead.id}`)}>
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </span>
                      </div>

                      {/* Direction Toggles */}
                      {user?.role !== 'executive' && (
                        <div className="flex items-center justify-between pt-1">
                          <button
                            disabled={stage.key === 'New'}
                            onClick={() => moveStage(lead, -1)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Shift</span>
                          <button
                            disabled={stage.key === 'Lost'}
                            onClick={() => moveStage(lead, 1)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="text-center py-12 text-[10px] text-slate-400 font-semibold">
                      Empty column.
                    </div>
                  )}
                </div>

              </div>
            );
          })}

        </div>
      </div>

    </div>
  );
}
