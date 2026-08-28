"use client";

import React from "react";
import { motion } from "framer-motion";

interface MetricItem {
  id: string;
  label: string;
  value: number;
  valueColor: string;
  accentBorder: string;
}

const metrics: MetricItem[] = [
  {
    id: "metric-today",
    label: "Inspections Today",
    value: 24,
    valueColor: "text-slate-800",
    accentBorder: "border-t-[#20638b]",
  },
  {
    id: "metric-compliant",
    label: "Compliant",
    value: 18,
    valueColor: "text-[#20638b]", // Primary dark teal / clean matching screenshot
    accentBorder: "border-t-emerald-500",
  },
  {
    id: "metric-non-compliant",
    label: "Non-Compliant",
    value: 4,
    valueColor: "text-red-600",
    accentBorder: "border-t-red-500",
  },
  {
    id: "metric-review",
    label: "Requires Manual Review",
    value: 2,
    valueColor: "text-amber-500",
    accentBorder: "border-t-[#FFCC70]",
  },
];

export default function MetricCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.08 }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className={`relative rounded-xl bg-white p-5 sm:p-6 shadow-xs hover:shadow-md border border-slate-100/90 transition-all duration-200 cursor-default`}
        >
          <h3 className="text-xs sm:text-sm font-medium text-slate-500 tracking-wide">
            {metric.label}
          </h3>
          <p className={`mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight ${metric.valueColor}`}>
            {metric.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
