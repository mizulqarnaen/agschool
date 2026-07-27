import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Table = ({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'No records found.',
  enablePagination = true,
  initialPageSize = 10
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Reset to page 1 whenever underlying data or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, pageSize]);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const displayedData = enablePagination
    ? data.slice(startIndex, endIndex)
    : data;

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs font-semibold uppercase text-slate-400 bg-slate-900/90 border-b border-slate-800">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className={`px-6 py-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              [1, 2, 3, 4, 5].map((n) => (
                <tr key={n} className="animate-pulse">
                  {columns.map((_, i) => (
                    <td key={i} className="px-6 py-4">
                      <div className="h-4 bg-slate-800/60 rounded w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : displayedData && displayedData.length > 0 ? (
              displayedData.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className="hover:bg-slate-900/40 transition-colors">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`px-6 py-4 ${col.cellClassName || ''}`}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {enablePagination && !loading && totalItems > 0 && (
        <div className="px-6 py-3.5 bg-slate-900/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              Menampilkan <span className="font-bold text-white">{totalItems > 0 ? startIndex + 1 : 0}</span> - <span className="font-bold text-white">{endIndex}</span> dari <span className="font-bold text-cyan-400">{totalItems}</span> data
            </span>
            <div className="flex items-center gap-1.5 ml-2 border-l border-slate-800 pl-3">
              <span className="text-slate-400">Per Halaman:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </button>

            <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg font-bold text-cyan-300">
              Halaman {currentPage} / {totalPages}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <span className="hidden sm:inline">Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
