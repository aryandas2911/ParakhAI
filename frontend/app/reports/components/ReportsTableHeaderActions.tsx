"use client";

import React, { useState } from "react";
import { Download, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { ReportHistoryItem } from "../data/reportsData";

interface ReportsTableHeaderActionsProps {
  totalCount: number;
  dataToExport: ReportHistoryItem[];
}

export default function ReportsTableHeaderActions({
  totalCount,
  dataToExport,
}: ReportsTableHeaderActionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportCSV = () => {
    setIsExporting(true);

    setTimeout(() => {
      // Generate CSV content with BOM for Excel UTF-8 compatibility
      const headers = [
        "INSPECTION ID",
        "REPORT ID",
        "PRODUCT",
        "CATEGORY",
        "STATUS",
        "INSPECTOR",
        "DATE",
        "FINDINGS",
        "CONFIDENCE",
      ];

      const csvRows = [
        headers.join(","),
        ...dataToExport.map((row) =>
          [
            `"${row.id}"`,
            `"${row.reportId}"`,
            `"${row.product.replace(/"/g, '""')}"`,
            `"${row.category}"`,
            `"${row.status}"`,
            `"${row.inspector}"`,
            `"${row.date}"`,
            `"${row.findings}"`,
            `"${row.confidence}%"`,
          ].join(",")
        ),
      ];

      const csvString = "\uFEFF" + csvRows.join("\r\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `LM-CE-Reports-Repository-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2500);
    }, 600);
  };

  return (
    <div className="flex items-center justify-end pt-1">
      {/* Export CSV Button */}
      <motion.button
        whileHover={!isExporting ? { scale: 1.02 } : {}}
        whileTap={!isExporting ? { scale: 0.98 } : {}}
        onClick={handleExportCSV}
        id="btn-export-csv"
        disabled={isExporting || totalCount === 0}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-[#20638b] transition-all shadow-2xs cursor-pointer disabled:opacity-50"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#20638b]" />
            <span>Exporting...</span>
          </>
        ) : exportSuccess ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700">Exported!</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
