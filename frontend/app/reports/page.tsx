"use client";

import React, { useState, useMemo } from "react";
import AppShell from "@/components/layout/AppShell";
import ReportsHistoryHeader from "./components/ReportsHistoryHeader";
import ReportsSearchFilterCard, {
  type ReportFilterState,
} from "./components/ReportsSearchFilterCard";
import ReportsTableHeaderActions from "./components/ReportsTableHeaderActions";
import ReportsDataTable from "./components/ReportsDataTable";
import ReportsPagination from "./components/ReportsPagination";
import {
  REPORTS_REPOSITORY_DATA,
  type ReportHistoryItem,
} from "./data/reportsData";

const initialFilters: ReportFilterState = {
  searchQuery: "",
  status: "All Statuses",
  category: "All Categories",
  dateRange: "Last 30 Days",
  violationType: "All Types",
  inspector: "All Inspectors",
  minConfidence: 0,
};

export default function ReportsPage() {
  const [filters, setFilters] = useState<ReportFilterState>(initialFilters);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 4; // 4 items per page as specified

  const handleFilterChange = (key: keyof ReportFilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    return REPORTS_REPOSITORY_DATA.filter((item: ReportHistoryItem) => {
      // 1. Text Query Search (Product, ID, Manufacturer, Category)
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesProduct = item.product.toLowerCase().includes(query);
        const matchesId = item.id.toLowerCase().includes(query);
        const matchesReportId = item.reportId.toLowerCase().includes(query);
        const matchesManufacturer = item.manufacturer
          .toLowerCase()
          .includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);

        if (
          !matchesProduct &&
          !matchesId &&
          !matchesReportId &&
          !matchesManufacturer &&
          !matchesCategory
        ) {
          return false;
        }
      }

      // 2. Status Filter
      if (filters.status !== "All Statuses") {
        if (item.status !== filters.status) return false;
      }

      // 3. Category Filter
      if (filters.category !== "All Categories") {
        if (item.category !== filters.category) return false;
      }

      // 4. Inspector Filter
      if (filters.inspector !== "All Inspectors") {
        if (item.inspector !== filters.inspector) return false;
      }

      // 5. Violation Type Filter
      if (filters.violationType !== "All Types") {
        const matchesViolation = item.violationTypes.some((v) =>
          v.toLowerCase().includes(filters.violationType.toLowerCase())
        );
        if (!matchesViolation) return false;
      }

      // 6. Min Confidence Threshold
      if (filters.minConfidence > 0) {
        if (item.confidence < filters.minConfidence) return false;
      }

      return true;
    });
  }, [filters]);

  // Paginated dataset
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredData.slice(startIdx, startIdx + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <AppShell title="Compliance Engine">
      <div className="space-y-5 pb-8">
        {/* 1. Header */}
        <ReportsHistoryHeader />

        {/* 2. Search & Filter Panel */}
        <ReportsSearchFilterCard
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />

        {/* 3. Table Header Actions (Counter & Export CSV) */}
        <ReportsTableHeaderActions
          totalCount={filteredData.length}
          dataToExport={filteredData}
        />

        {/* 4. Inspection History Data Table */}
        <ReportsDataTable data={paginatedData} />

        {/* 5. Pagination Footer */}
        {filteredData.length > 0 && (
          <ReportsPagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={filteredData.length}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </AppShell>
  );
}
