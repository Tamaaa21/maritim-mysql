"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  onItemsPerPageChange?: (count: number) => void;
}

export default function AdminPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = totalItems ? Math.min(totalItems, (currentPage - 1) * (itemsPerPage || 1) + 1) : 0;
  const endItem = totalItems ? Math.min(totalItems, currentPage * (itemsPerPage || 1)) : 0;

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const total = totalPages;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(total - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < total - 2) pages.push("...");
      pages.push(total);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
      {totalItems && (
        <span className="text-xs text-gray-500 font-medium order-2 sm:order-1">
          Menampilkan {startItem}–{endItem} dari {totalItems} data
        </span>
      )}

      <div className="flex items-center gap-2 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          <ChevronLeft size={14} />
        </button>

        {getPageNumbers().map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-xs text-gray-400 font-medium">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                p === currentPage
                  ? "bg-[#003399] text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          <ChevronRight size={14} />
        </button>

        {onItemsPerPageChange && itemsPerPage && (
          <select
            value={itemsPerPage}
            onChange={(e) => {
              onItemsPerPageChange(parseInt(e.target.value, 10));
              onPageChange(1);
            }}
            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs bg-white text-gray-600 focus:outline-none"
          >
            <option value={10}>10 data</option>
            <option value={20}>20 data</option>
            <option value={50}>50 data</option>
          </select>
        )}
      </div>
    </div>
  );
}
