import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, Download, Search } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor?: string | ((row: T) => any);
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface FilterOption {
  label: string;
  accessor: string;
  options: string[];
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data?: T[];
  searchPlaceholder?: string;
  searchKeys?: string[];
  filters?: FilterOption[];
  exportFileName?: string;
  actions?: React.ReactNode;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data = [],
  searchPlaceholder = 'Search records...',
  searchKeys = [],
  filters = [],
  exportFileName = 'export.csv',
  actions
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const handleFilterChange = (accessor: string, val: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [accessor]: val
    }));
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (key?: string | ((row: T) => any)) => {
    if (!key || typeof key === 'function') return; // Cannot sort by function accessor easily
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Process data (filter -> search -> sort)
  const processedData = useMemo(() => {
    let result = [...data];

    // 1. Dropdown Filters
    Object.entries(selectedFilters).forEach(([accessor, value]) => {
      if (value && value !== 'All') {
        result = result.filter(item => {
          const itemVal = item[accessor];
          return String(itemVal).toLowerCase() === String(value).toLowerCase();
        });
      }
    });

    // 2. Search Text
    if (searchQuery && searchKeys.length > 0) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item =>
        searchKeys.some(key => {
          const val = item[key as string];
          return val && String(val).toLowerCase().includes(lowerQuery);
        })
      );
    }

    // 3. Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key as string];
        const valB = b[sortConfig.key as string];

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        const strA = typeof valA === 'string' ? valA.toLowerCase() : valA;
        const strB = typeof valB === 'string' ? valB.toLowerCase() : valB;

        if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, selectedFilters, searchQuery, searchKeys, sortConfig]);

  // Pagination bounds
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Export CSV handler
  const exportToCSV = () => {
    if (processedData.length === 0) return;
    
    // Header row
    const headers = columns.map(c => `"${c.header}"`).join(',');
    
    // Value rows
    const rows = processedData.map(row => 
      columns.map(col => {
        let val = '';
        if (typeof col.accessor === 'function') {
          val = col.accessor(row);
        } else {
          val = col.accessor ? row[col.accessor as string] : '';
        }
        
        // Escape quotes
        val = val === null || val === undefined ? '' : String(val).replace(/"/g, '""');
        return `"${val}"`;
      }).join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', exportFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Controls Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col md:flex-row md:items-center gap-3">
          {/* Search bar */}
          {searchKeys.length > 0 && (
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="pl-9 pr-4 py-2 w-full text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          )}

          {/* Dynamic Dropdown Filters */}
          {filters.map(filter => (
            <div key={filter.accessor} className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{filter.label}:</span>
              <select
                value={selectedFilters[filter.accessor] || 'All'}
                onChange={(e) => handleFilterChange(filter.accessor, e.target.value)}
                className="py-1.5 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="All">All {filter.label}s</option>
                {filter.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Actions & Export buttons */}
        <div className="flex items-center gap-2">
          {actions}
          <button
            onClick={exportToCSV}
            disabled={processedData.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50/50">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  onClick={() => col.sortable && handleSort(col.accessor)}
                  className={`px-6 py-3.5 font-semibold text-slate-600 ${col.sortable ? 'cursor-pointer select-none hover:bg-slate-100' : ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      sortConfig.key === col.accessor ? (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-slate-800" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-800" />
                      ) : (
                        <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-50/50 transition-colors">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 text-slate-700 font-medium whitespace-nowrap">
                      {col.render ? col.render(row) : (col.accessor ? row[col.accessor as string] : '')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400 font-medium">
                  No records found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-500 font-medium">
            Showing <span className="font-semibold text-slate-700">{Math.min(processedData.length, (currentPage - 1) * pageSize + 1)}</span> to{' '}
            <span className="font-semibold text-slate-700">{Math.min(processedData.length, currentPage * pageSize)}</span> of{' '}
            <span className="font-semibold text-slate-700">{processedData.length}</span> records
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                  currentPage === i + 1
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
