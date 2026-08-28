"use client";

import React from "react";
import { Plus, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ActionHeroCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-xl bg-white p-6 sm:p-7 shadow-xs border border-slate-100/80"
    >

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="max-w-2xl">
          <p className="text-sm sm:text-base font-normal text-slate-700 leading-relaxed">
            Inspect packaged commodities, verify mandatory declarations, and
            identify potential non-compliance with evidence-backed checks.
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-shrink-0"
        >
          <Link
            href="/inspections/new"
            id="btn-start-inspection"
            className="inline-flex items-center gap-2.5 rounded-lg bg-[#20638b] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#184f70] active:bg-[#13445e] transition-all duration-200 cursor-pointer group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300 text-[#FFCC70]" />
            <span>Start New Inspection</span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
