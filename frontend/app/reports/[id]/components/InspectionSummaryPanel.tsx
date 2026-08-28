"use client";

import React from "react";
import { AlertTriangle, Info, Scale } from "lucide-react";
import { motion } from "framer-motion";

interface InspectionSummaryPanelProps {
  status?: string;
  violationsDetected?: number;
}

export default function InspectionSummaryPanel({
  status = "NON-COMPLIANT",
  violationsDetected = 3,
}: InspectionSummaryPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="rounded-xl bg-white shadow-xs border border-slate-100/90 overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
        <Scale className="w-4 h-4 text-[#20638b]" />
        <h3 className="text-sm font-bold text-slate-800 tracking-tight">
          Inspection Result Summary
        </h3>
      </div>

      <div className="p-5 space-y-3.5">
        {/* Status Text Block */}
        <div className="p-4 rounded-lg bg-red-50/50 border border-red-200/80">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-900 tracking-tight">
                Overall Status: <span className="underline decoration-red-400">{status}</span>
              </p>
              <p className="text-xs text-red-800/90 mt-1 leading-relaxed">
                Automated legal metrology verification detected <span className="font-bold">{violationsDetected} non-compliant declaration items</span> that fail mandatory requirements under the Legal Metrology (Packaged Commodities) Rules, 2011. Notice of inspection review has been flagged for enforcement action.
              </p>
            </div>
          </div>
        </div>

        {/* Official Legal Disclaimer */}
        <div className="flex items-start gap-2 text-xs text-slate-500 pt-1">
          <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-semibold text-slate-600">Disclaimer:</span> These findings are generated via AI-assisted OCR and deterministic rule validation. They serve as a compliance assistance record and are subject to final verification by authorized Legal Metrology enforcement officers before statutory proceedings.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
