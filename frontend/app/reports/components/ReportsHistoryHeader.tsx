"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ReportsHistoryHeader() {
  return (
    <div className="space-y-1">
      <motion.h1
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"
      >
        Inspection History
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="text-sm text-slate-500 leading-relaxed"
      >
        Search and review previous inspections, findings, evidence, and reports.
      </motion.p>
    </div>
  );
}
