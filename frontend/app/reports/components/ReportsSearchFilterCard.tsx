"use client";

import React, { useState } from "react";
import { Search, SlidersHorizontal, X, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ReportFilterState {
  searchQuery: string;
  status: string;
  category: string;
  dateRange: string;
  violationType: string;
  inspector: string;
  minConfidence: number;
}

interface ReportsSearchFilterCardProps {
  filters: ReportFilterState;
  onFilterChange: (key: keyof ReportFilterState, value: any) => void;
  onResetFilters: () => void;
}

export default function ReportsSearchFilterCard({
  filters,
  onFilterChange,
  onResetFilters,
}: ReportsSearchFilterCardProps) {
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const hasActiveFilters =
    filters.searchQuery !== "" ||
    filters.status !== "All Statuses" ||
    filters.category !== "All Categories" ||
    filters.dateRange !== "Last 30 Days" ||
    filters.violationType !== "All Types" ||
    filters.inspector !== "All Inspectors" ||
    filters.minConfidence > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="rounded-2xl bg-white border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4"
    >
      {/* 1. Large Search Bar */}
      <div className="relative w-full">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onFilterChange("searchQuery", e.target.value)}
          placeholder="Search product, inspection ID, or manufacturer"
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#20638b] focus:ring-2 focus:ring-[#20638b]/10 transition-all shadow-2xs"
        />
        {filters.searchQuery && (
          <button
            onClick={() => onFilterChange("searchQuery", "")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. 5 Dropdown Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
        {/* Status */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-700 tracking-tight">
            Status
          </label>
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => onFilterChange("status", e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#20638b] focus:ring-1 focus:ring-[#20638b] transition-all cursor-pointer pr-8"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Compliant">Compliant</option>
              <option value="Non-Compliant">Non-Compliant</option>
              <option value="Requires Review">Requires Review</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Product Category */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-700 tracking-tight">
            Product Category
          </label>
          <div className="relative">
            <select
              value={filters.category}
              onChange={(e) => onFilterChange("category", e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#20638b] focus:ring-1 focus:ring-[#20638b] transition-all cursor-pointer pr-8"
            >
              <option value="All Categories">All Categories</option>
              <option value="Packaged Food">Packaged Food</option>
              <option value="Household">Household</option>
              <option value="Edible Oil">Edible Oil</option>
              <option value="Beverages">Beverages</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-700 tracking-tight">
            Date Range
          </label>
          <div className="relative">
            <select
              value={filters.dateRange}
              onChange={(e) => onFilterChange("dateRange", e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#20638b] focus:ring-1 focus:ring-[#20638b] transition-all cursor-pointer pr-8"
            >
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 90 Days">Last 90 Days</option>
              <option value="All Time">All Time</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Violation Type */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-700 tracking-tight">
            Violation Type
          </label>
          <div className="relative">
            <select
              value={filters.violationType}
              onChange={(e) => onFilterChange("violationType", e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#20638b] focus:ring-1 focus:ring-[#20638b] transition-all cursor-pointer pr-8"
            >
              <option value="All Types">All Types</option>
              <option value="Consumer Care">Consumer Care Missing</option>
              <option value="MRP Format">MRP Declaration Mismatch</option>
              <option value="Net Quantity">Net Quantity Formatting</option>
              <option value="Font Size">Font Size Standard</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Inspector */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-700 tracking-tight">
            Inspector
          </label>
          <div className="relative">
            <select
              value={filters.inspector}
              onChange={(e) => onFilterChange("inspector", e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#20638b] focus:ring-1 focus:ring-[#20638b] transition-all cursor-pointer pr-8"
            >
              <option value="All Inspectors">All Inspectors</option>
              <option value="J. Smith">J. Smith</option>
              <option value="A. Davis">A. Davis</option>
              <option value="M. Patel">M. Patel</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 3. More Filters & Reset Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <button
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            showMoreFilters
              ? "bg-[#eef6fa] border-[#20638b] text-[#20638b]"
              : "bg-slate-100/80 hover:bg-slate-200/80 border-slate-200 text-slate-700"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>More Filters</span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Expandable Advanced Options */}
      <AnimatePresence>
        {showMoreFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pt-3 border-t border-slate-100"
          >
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Min OCR Confidence Threshold: {filters.minConfidence}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="95"
                  step="5"
                  value={filters.minConfidence}
                  onChange={(e) =>
                    onFilterChange("minConfidence", Number(e.target.value))
                  }
                  className="w-full accent-[#20638b] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0% (All)</span>
                  <span>50%</span>
                  <span>95% (High Accuracy Only)</span>
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <span className="text-[11px] text-slate-500 leading-relaxed">
                  Compliance verification conducted under <span className="font-semibold text-slate-700">Legal Metrology (Packaged Commodities) Rules, 2011</span>. Filter updates table in real-time.
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
