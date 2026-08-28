"use client";

import React from "react";
import { AlertTriangle, Tag, Scale, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

interface FindingItem {
  id: string;
  label: string;
  percentage: number;
  icon: React.ElementType;
  barColor: string;
  iconColor: string;
}

const findings: FindingItem[] = [
  {
    id: "missing-declaration",
    label: "Missing Declaration",
    percentage: 32,
    icon: AlertTriangle,
    barColor: "bg-[#FFCC70]",
    iconColor: "text-amber-500",
  },
  {
    id: "mrp-issue",
    label: "MRP Issue",
    percentage: 28,
    icon: Tag,
    barColor: "bg-[#20638b]",
    iconColor: "text-[#20638b]",
  },
  {
    id: "net-quantity",
    label: "Net Quantity Issue",
    percentage: 24,
    icon: Scale,
    barColor: "bg-[#38bdf8]",
    iconColor: "text-sky-500",
  },
  {
    id: "other",
    label: "Other",
    percentage: 16,
    icon: MoreHorizontal,
    barColor: "bg-slate-300",
    iconColor: "text-slate-400",
  },
];

export default function CommonFindingsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-xl bg-white shadow-xs border border-slate-100/90 p-4 sm:p-6 flex flex-col justify-between h-full"
    >
      <div>
        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight pb-4 border-b border-slate-50">
          Common Findings
        </h3>

        {/* Itemized Rows */}
        <div className="mt-5 space-y-4">
          {findings.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${item.iconColor} flex-shrink-0`} />
                    <span className="font-medium text-slate-700">
                      {item.label}
                    </span>
                  </div>
                  <span className="font-bold text-slate-800">
                    {item.percentage}%
                  </span>
                </div>

                {/* Progress bar with subtle animation */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                    className={`h-full rounded-full ${item.barColor}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Note */}
      <div className="mt-6 pt-3 border-t border-slate-50 text-[11px] text-slate-400 text-center">
        Aggregated across all recorded inspections
      </div>
    </motion.div>
  );
}
