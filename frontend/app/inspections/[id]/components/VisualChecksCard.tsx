"use client";

import { CheckCircle2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface VisualCheck {
  id: string;
  label: string;
  status: "pass" | "review" | "fail";
}

interface VisualChecksCardProps {
  checks?: VisualCheck[];
}

const defaultChecks: VisualCheck[] = [
  { id: "vc-1", label: "Readability", status: "pass" },
  { id: "vc-2", label: "Declaration Visibility", status: "pass" },
  { id: "vc-3", label: "Font Size", status: "review" },
];

function getCheckBadge(status: VisualCheck["status"]) {
  switch (status) {
    case "pass":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100/80">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Pass
        </span>
      );
    case "review":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100/80">
          <AlertTriangle className="w-3.5 h-3.5" />
          Review
        </span>
      );
    case "fail":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-red-50 text-red-600 border border-red-100/80">
          Fail
        </span>
      );
  }
}

export default function VisualChecksCard({
  checks = defaultChecks,
}: VisualChecksCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="rounded-xl bg-white shadow-xs border border-slate-100/90 overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-50">
        <h3 className="text-base font-bold text-slate-800 tracking-tight">
          Visual Checks
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Automated readability & placement analysis
        </p>
      </div>

      {/* Checks List */}
      <div className="p-5 space-y-3">
        {checks.map((check, index) => (
          <motion.div
            key={check.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: 0.3 + index * 0.06 }}
            className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
              check.status === "review"
                ? "border-amber-200/70 bg-amber-50/30"
                : check.status === "fail"
                  ? "border-red-200/70 bg-red-50/30"
                  : "border-slate-100 bg-slate-50/30 hover:bg-slate-50/60"
            }`}
          >
            <span
              className={`text-sm font-medium ${
                check.status === "review"
                  ? "text-amber-800"
                  : check.status === "fail"
                    ? "text-red-700"
                    : "text-slate-700"
              }`}
            >
              {check.label}
            </span>
            {getCheckBadge(check.status)}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
