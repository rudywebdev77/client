import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * TablePagination
 * ──────────────
 * Props:
 *   page        – current 1-based page number
 *   totalPages  – total number of pages
 *   total       – total record count
 *   pageSize    – records per page (5 or 10)
 *   onPageChange    – (newPage: number) => void
 *   onPageSizeChange – (newSize: number) => void
 */
export const TablePagination = ({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-800/80 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left – record count info */}
      <p className="text-xs text-slate-400 shrink-0">
        {total === 0 ? (
          'No records'
        ) : (
          <>
            Showing{' '}
            <span className="font-semibold text-white">{from}–{to}</span>{' '}
            of{' '}
            <span className="font-semibold text-white">{total}</span>{' '}
            records
          </>
        )}
      </p>

      {/* Right – page size selector + Prev / Next */}
      <div className="flex items-center gap-3">
        {/* Page size selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 whitespace-nowrap">Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs font-semibold text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
          </select>
        </div>

        {/* Prev / Next */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(page - 1, 1))}
            disabled={page === 1}
            title="Previous page"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPageChange(Math.min(page + 1, totalPages))}
            disabled={page === totalPages || totalPages === 0}
            title="Next page"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablePagination;
