import { memo } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Spinner } from './Spinner';
import { Button } from './Button';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  pagination?: PaginationProps;
  onRowClick?: (item: T) => void;
  className?: string;
}

const DataTableInner = <T extends { id: string | number }>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No data found',
  pagination,
  onRowClick,
  className,
}: DataTableProps<T>) => {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="glass overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border-white/40 ring-1 ring-white/10">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-slate-200/40">
            <thead className="bg-white/60 backdrop-blur-xl border-b border-white/20">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={cn(
                      'px-8 py-6 text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-200/60',
                      column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left',
                      column.className
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-transparent">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Spinner size="md" />
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] animate-pulse">Syncing Operational Data...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <svg className="w-12 h-12 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">{emptyMessage}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      'hover:bg-white hover:shadow-2xl hover:scale-[1.01] hover:z-10 transition-all duration-500 group relative',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {columns.map((column, index) => (
                      <td
                        key={index}
                        className={cn(
                          'px-8 py-6 whitespace-nowrap text-sm text-slate-600 font-bold tracking-tight group-hover:text-slate-900 transition-colors',
                          column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left',
                          column.className
                        )}
                      >
                        {typeof column.accessor === 'function'
                          ? column.accessor(item)
                          : (item[column.accessor] as ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8 px-4 mt-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
            Sighted <span className="text-slate-900 drop-shadow-sm">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> —{' '}
            <span className="text-slate-900 drop-shadow-sm">{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}</span> of{' '}
            <span className="text-slate-900 drop-shadow-sm">{pagination.totalItems}</span> Units
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              className="h-11 px-6 border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              PREV
            </Button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-2">
               {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                 let pageNum = pagination.currentPage - 2 + i;
                 if (pagination.currentPage <= 2) pageNum = i + 1;
                 if (pagination.currentPage >= pagination.totalPages - 1) pageNum = pagination.totalPages - 4 + i;
                 
                 if (pageNum > 0 && pageNum <= pagination.totalPages) {
                    const isActive = pagination.currentPage === pageNum;
                    return (
                     <button
                       key={pageNum}
                       onClick={() => pagination.onPageChange(pageNum)}
                       className={cn(
                         "w-11 h-11 rounded-[1.25rem] text-[10px] font-black transition-all duration-300 border",
                         isActive 
                           ? "bg-white/20 text-white shadow-2xl shadow-indigo-500/20 border-white/30 scale-110 z-10" 
                           : "text-white/30 border-transparent hover:bg-white/10 hover:text-white"
                       )}
                     >
                       {pageNum}
                     </button>
                    );
                 }
                 return null;
               })}
            </div>
 
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              className="h-11 px-6 border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900"
            >
              NEXT
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export const DataTable = (memo(DataTableInner) as unknown) as typeof DataTableInner;
