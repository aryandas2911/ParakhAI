"use client";

import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface ComplianceHeaderProps {
  inspectionId?: string;
  productName?: string;
  category?: string;
  violationCount?: number;
}

export default function ComplianceHeader({
  inspectionId = "LM-2026-00042",
  productName = "Tata Salt",
  category = "Packaged Food",
  violationCount = 3,
}: ComplianceHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Title & Sub-header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight"
        >
          Product Analysis
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mt-1.5 text-sm text-slate-500 leading-relaxed"
        >
          <span className="font-medium text-slate-600">Inspection ID:</span>{" "}
          <span className="text-[#20638b] font-semibold">{inspectionId}</span>
          <span className="mx-2 text-slate-300">•</span>
          <span className="font-medium text-slate-600">Product:</span>{" "}
          <span className="text-[#20638b] font-semibold">{productName}</span>
          <span className="mx-2 text-slate-300">•</span>
          <span className="font-medium text-slate-600">Category:</span>{" "}
          <span className="text-slate-700">{category}</span>
        </motion.p>
      </div>

      {/* Non-Compliant Alert Banner */}
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="relative flex items-start gap-3.5 px-5 py-4 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50/90 via-yellow-50/70 to-amber-50/50 overflow-hidden"
      >
        {/* Subtle left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-amber-500 rounded-l-xl" />

        <div className="flex-shrink-0 mt-0.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-amber-900 tracking-tight">
            NON-COMPLIANT
          </p>
          <p className="text-xs text-amber-700/90 mt-0.5 leading-relaxed">
            {violationCount} potential violation{violationCount !== 1 ? "s" : ""}{" "}
            detected.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
