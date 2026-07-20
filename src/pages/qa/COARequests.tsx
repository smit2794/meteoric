import React from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { PlusCircle } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { CoaRequest } from '../../data/mockCoas';

export default function COARequests() {
  const { coaRequests } = useAppData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const columns = [
    { header: 'Request ID', accessor: 'id', sortable: true, render: (row: CoaRequest) => <span className="font-bold text-slate-500">REQ-COA-{row.id}</span> },
    { header: 'Linked Quotation', accessor: 'quote_no', sortable: true },
    { header: 'Product Specification', accessor: 'product', sortable: true, render: (row: CoaRequest) => <span className="font-bold text-slate-800">{row.product}</span> },
    { header: 'Requested By', accessor: 'requested_by', sortable: true },
    { header: 'Date Requested', accessor: 'created_at', render: (row: CoaRequest) => <span>{new Date(row.created_at).toLocaleDateString()}</span> },
    {
      header: 'Request Status',
      accessor: 'status',
      sortable: true,
      render: (row: CoaRequest) => {
        let color = 'bg-slate-100 text-slate-500';
        if (row.status === 'Completed') color = 'bg-emerald-50 text-emerald-700';
        else if (row.status === 'In Progress') color = 'bg-amber-50 text-amber-700 animate-pulse';
        else if (row.status === 'Pending') color = 'bg-blue-50 text-blue-700';
        return <span className={`px-2 py-0.5 rounded text-xs font-bold ${color}`}>{row.status}</span>;
      }
    },
    {
      header: 'Actions',
      render: (row: CoaRequest) => {
        if (row.status === 'Completed') return <span className="text-emerald-600 font-bold text-xs">Completed</span>;
        
        return (
          user?.role !== 'executive' && (
            <button
              onClick={() => navigate(`/portal/qa-team/coa-builder?requestId=${row.id}&quoteId=${row.quotation_id}&product=${encodeURIComponent(row.product)}`)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Generate COA</span>
            </button>
          )
        );
      }
    }
  ];

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Analytical COA Requests</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Review active requests dispatched from the CRM sales department for quality test certification.</p>
      </div>

      <DataTable
        columns={columns}
        data={coaRequests}
        searchKeys={['quote_no', 'product', 'requested_by']}
        searchPlaceholder="Search requests..."
        filters={[
          { label: 'Status', accessor: 'status', options: ['Pending', 'In Progress', 'Completed'] }
        ]}
        exportFileName="qa_coa_requests.csv"
      />
    </div>
  );
}
