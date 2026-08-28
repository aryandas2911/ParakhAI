"use client";

import React from "react";
import { AlertOctagon, AlertTriangle, ExternalLink, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export interface FindingCardItem {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  rule: string;
}

interface ComplianceFindingsGridProps {
  findings?: FindingCardItem[];
}

const defaultFindings: FindingCardItem[] = [
  {
    id: "f-1",
    severity: "high",
    title: "Consumer-care declaration missing",
    description:
      "Consumer care telephone number, address, or email was not detected on the principal display panel.",
    rule: "Rule 6(1)(d), LMPC Rules 2011",
  },
  {
    id: "f-2",
    severity: "medium",
    title: "MRP declaration mismatch",
    description:
      "MRP format is missing the statutory '(inclusive of all taxes)' suffix or has improper spacing.",
    rule: "Rule 6(1)(e), LMPC Rules 2011",
  },
  {
    id: "f-3",
    severity: "medium",
    title: "Net quantity formatting",
    description:
      "Numeral height does not satisfy the minimum mandatory 4mm font standard for 5kg packaged commodity.",
    rule: "Rule 12, LMPC Rules 2011",
  },
];

export default function ComplianceFindingsGrid({
  findings = defaultFindings,
}: ComplianceFindingsGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-red-600" />
          <span>Compliance Findings ({findings.length})</span>
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          Automated Rule-Based Evaluation
        </span>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {findings.map((item, idx) => {
          const isHigh = item.severity === "high";

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 + idx * 0.06 }}
              className={`rounded-xl border p-4 flex flex-col justify-between transition-all bg-white shadow-xs ${isHigh
                  ? "border-red-200 border-t-4 border-t-red-600 bg-gradient-to-b from-red-50/40 to-white"
                  : "border-amber-200 border-t-4 border-t-amber-500 bg-gradient-to-b from-amber-50/40 to-white"
                }`}
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${isHigh
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-800"
                      }`}
                  >
                    {isHigh ? (
                      <AlertOctagon className="w-3 h-3 text-red-600" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                    )}
                    {isHigh ? "High Severity" : "Medium Severity"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    #{idx + 1}
                  </span>
                </div>

                {/* Title */}
                <h4
                  className={`text-xs font-bold leading-snug ${isHigh ? "text-red-950" : "text-amber-950"
                    }`}
                >
                  {item.title}
                </h4>

                {/* Description */}
                <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Rule Link */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100/90 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium truncate max-w-[170px]" title={item.rule}>
                  {item.rule}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[#20638b] font-semibold text-[10px] hover:underline cursor-pointer">
                  Rule <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
