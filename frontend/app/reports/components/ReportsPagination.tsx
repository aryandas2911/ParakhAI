"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ReportsPaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function ReportsPagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
}: ReportsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500 select-none">
      {/* Left Text */}
      <div>
        Showing <span className="font-semibold text-slate-700">{startItem}</span> to{" "}
        <span className="font-semibold text-slate-700">{endItem}</span> of{" "}
        <span className="font-semibold text-slate-700">{totalItems}</span> entries
      </div>

      {/* Right Pagination Controls */}
      <div className="flex items-center gap-1 self-end sm:self-auto">
        {/* Prev */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#20638b] text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Next */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
