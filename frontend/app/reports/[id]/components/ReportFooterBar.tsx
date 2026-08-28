"use client";

import React, { useState } from "react";
import { Printer, Download, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ReportFooterBarProps {
  reportId?: string;
  onPrint?: () => void;
}

export default function ReportFooterBar({
  reportId = "RPT-LM-CE-2026-0042",
  onPrint,
}: ReportFooterBarProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    // Simulate generation and invoke native print-to-PDF
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadSuccess(true);
      window.print();
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="sticky bottom-4 z-20 flex items-center justify-between rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/90 px-5 sm:px-6 py-3.5 print:hidden"
    >
      <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
        <span className="font-semibold text-slate-700">Digital Record:</span>
        <span className="font-mono text-slate-500">{reportId}</span>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {/* Outline Print Button */}
        <button
          onClick={handlePrint}
          id="btn-print-report"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 hover:text-[#20638b] transition-all cursor-pointer shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Print Report</span>
        </button>

        {/* Primary Download PDF Button */}
        <motion.button
          whileHover={!isDownloading ? { scale: 1.02 } : {}}
          whileTap={!isDownloading ? { scale: 0.98 } : {}}
          onClick={handleDownloadPDF}
          id="btn-download-pdf"
          disabled={isDownloading}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#20638b] text-white text-sm font-semibold shadow-sm hover:bg-[#184f70] active:bg-[#13445e] transition-all disabled:opacity-75 cursor-pointer"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Preparing PDF...</span>
            </>
          ) : downloadSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Opening Print / PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
