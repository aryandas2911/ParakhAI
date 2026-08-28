"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface ComplianceFinding {
  id: string;
  itemNumber: string;
  title: string;
  subtext: string;
  severity: "high" | "medium" | "low";
  rule: string;
}

interface ComplianceFindingsCardProps {
  findings?: ComplianceFinding[];
  onViewEvidence?: (findingId: string) => void;
}

const defaultFindings: ComplianceFinding[] = [
  {
    id: "finding-1",
    itemNumber: "01",
    title: "Consumer-care declaration",
    subtext: '"Not detected"',
    severity: "high",
    rule: "PCA Rule 6(1)",
  },
  {
    id: "finding-2",
    itemNumber: "02",
    title: "MRP declaration",
    subtext: '"Format requires review"',
    severity: "medium",
    rule: "PCA Rule 18",
  },
];

function getSeverityStyles(severity: ComplianceFinding["severity"]) {
  switch (severity) {
    case "high":
      return {
        border: "border-red-300/80",
        bg: "bg-red-50/40",
        badgeBg: "bg-red-600",
        badgeText: "text-white",
        titleColor: "text-red-900",
        subtextColor: "text-red-600",
        ruleColor: "text-red-400",
        label: "HIGH SEVERITY",
      };
    case "medium":
      return {
        border: "border-amber-300/80",
        bg: "bg-amber-50/40",
        badgeBg: "bg-amber-500",
        badgeText: "text-white",
        titleColor: "text-amber-900",
        subtextColor: "text-amber-600",
        ruleColor: "text-amber-400",
        label: "MEDIUM SEVERITY",
      };
    case "low":
      return {
        border: "border-blue-200/80",
        bg: "bg-blue-50/40",
        badgeBg: "bg-blue-500",
        badgeText: "text-white",
        titleColor: "text-blue-900",
        subtextColor: "text-blue-600",
        ruleColor: "text-blue-400",
        label: "LOW SEVERITY",
      };
  }
}

export default function ComplianceFindingsCard({
  findings = defaultFindings,
  onViewEvidence,
}: ComplianceFindingsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-xl bg-white shadow-xs border border-slate-100/90 overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-50">
        <h3 className="text-base font-bold text-slate-800 tracking-tight">
          Compliance Findings
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Potential violations requiring attention
        </p>
      </div>

      {/* Findings List */}
      <div className="p-5 space-y-4">
        {findings.map((finding, index) => {
          const styles = getSeverityStyles(finding.severity);
          return (
            <motion.div
              key={finding.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.35 + index * 0.08 }}
              className={`relative rounded-lg border-l-4 ${styles.border} ${styles.bg} p-4 transition-all duration-200 hover:shadow-sm`}
            >
              {/* Top row: Title + Severity Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold ${styles.titleColor}`}>
                    {finding.title}
                  </p>
                  <p
                    className={`text-xs mt-1 font-medium italic ${styles.subtextColor}`}
                  >
                    {finding.subtext}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${styles.badgeBg} ${styles.badgeText}`}
                >
                  {styles.label}
                </span>
              </div>

              {/* Bottom row: Rule + View Evidence */}
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200/40">
                <span className={`text-xs font-medium ${styles.ruleColor}`}>
                  Rule: {finding.rule}
                </span>
                <button
                  onClick={() => onViewEvidence?.(finding.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#20638b] hover:text-[#184f70] hover:underline transition-colors cursor-pointer"
                >
                  View Evidence
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
