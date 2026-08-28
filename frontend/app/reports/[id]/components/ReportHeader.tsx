"use client";

import React from "react";
import { AlertTriangle, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";

interface ReportHeaderProps {
  reportId?: string;
  inspectionId?: string;
  generatedDate?: string;
  violationCount?: number;
}

export default function ReportHeader({
  reportId = "RPT-LM-CE-2026-0042",
  inspectionId = "LM-CE-2026-0042",
  generatedDate = "27 Aug 2026",
  violationCount = 3,
}: ReportHeaderProps) {
  const [copied, setCopied] = React.useState(false);

  const copyReportId = () => {
    navigator.clipboard.writeText(reportId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Title & Sub-bar Details */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight"
        >
          Compliance Inspection Report
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500"
        >
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-slate-600">Report ID:</span>
            <span className="font-semibold text-[#20638b] font-mono">{reportId}</span>
            <button
              onClick={copyReportId}
              className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors print:hidden"
              title="Copy Report ID"
              aria-label="Copy Report ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <span className="text-slate-300">•</span>
          <div>
            <span className="font-medium text-slate-600">Inspection ID:</span>{" "}
            <span className="font-semibold text-slate-700">{inspectionId}</span>
          </div>
          <span className="text-slate-300">•</span>
          <div>
            <span className="font-medium text-slate-600">Generated:</span>{" "}
            <span className="text-slate-700">{generatedDate}</span>
          </div>
        </motion.div>
      </div>

      {/* Amber Non-Compliant Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="relative flex items-start gap-3.5 px-5 py-4 rounded-xl border border-amber-200/90 bg-gradient-to-r from-amber-50/90 via-yellow-50/70 to-amber-50/50 overflow-hidden shadow-xs"
      >
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500 rounded-l-xl" />
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100/90 flex items-center justify-center">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-amber-900 tracking-tight">
            NON-COMPLIANT
          </p>
          <p className="text-xs text-amber-700/90 mt-0.5 leading-relaxed font-medium">
            {violationCount} potential violation{violationCount !== 1 ? "s" : ""} detected during automated verification.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
