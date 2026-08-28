"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface InspectionFooterBarProps {
  isAnalyzing: boolean;
  onAnalyze: () => void;
  hasImages: boolean;
}

export default function InspectionFooterBar({
  isAnalyzing,
  onAnalyze,
  hasImages,
}: InspectionFooterBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="flex items-center justify-between rounded-xl bg-white shadow-xs border border-slate-100/90 px-5 sm:px-6 py-4"
    >
      {/* Cancel Button */}
      <Link
        href="/dashboard"
        id="btn-cancel-inspection"
        className="inline-flex items-center px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
      >
        Cancel
      </Link>

      {/* Analyze Images Button */}
      <motion.button
        whileHover={!isAnalyzing && hasImages ? { scale: 1.02 } : {}}
        whileTap={!isAnalyzing && hasImages ? { scale: 0.98 } : {}}
        type="button"
        id="btn-analyze-images"
        onClick={onAnalyze}
        disabled={isAnalyzing || !hasImages}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#20638b] text-white text-sm font-semibold shadow-sm hover:bg-[#184f70] active:bg-[#13445e] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <span>Analyze Images</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
