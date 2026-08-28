"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Plus, ClipboardCheck, FileText, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";

interface InspectionRow {
  id: string;
  reportId?: string;
  product: string;
  category: string;
  status: "compliant" | "non-compliant" | "requires_review";
  date: string;
  reportGenerated: boolean;
}

const recentInspections: InspectionRow[] = [
  {
    id: "LM-CE-2026-0042",
    reportId: "RPT-LM-CE-2026-0042",
    product: "Tata Salt",
    category: "Packaged Food",
    status: "non-compliant",
    date: "27 Aug 2026",
    reportGenerated: true,
  },
  {
    id: "LM-CE-2026-0041",
    reportId: "RPT-LM-CE-2026-0041",
    product: "Sunflower Oil 1L",
    category: "Edible Oil",
    status: "compliant",
    date: "26 Aug 2026",
    reportGenerated: true,
  },
  {
    id: "LM-CE-2026-0040",
    product: "Almond Nuts 500g",
    category: "Dry Fruits",
    status: "requires_review",
    date: "25 Aug 2026",
    reportGenerated: false,
  },
  {
    id: "LM-CE-2026-0039",
    reportId: "RPT-LM-CE-2026-0039",
    product: "Washing Powder 2kg",
    category: "Detergents",
    status: "compliant",
    date: "24 Aug 2026",
    reportGenerated: true,
  },
];

function getStatusBadge(status: "compliant" | "non-compliant" | "requires_review") {
  switch (status) {
    case "compliant":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100/80">
          Compliant
        </span>
      );
    case "non-compliant":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-red-50 text-red-600 border border-red-100/80">
          Non-Compliant
        </span>
      );
    case "requires_review":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100/80">
          Requires Review
        </span>
      );
  }
}

export default function InspectionsPage() {
  return (
    <AppShell title="Legal Metrology - Compliance Engine">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Inspections
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage, verify declarations, and review compliance inspection reports
          </p>
        </div>
        <Link
          href="/inspections/new"
          id="btn-new-inspection-page"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#20638b] text-white text-sm font-semibold shadow-sm hover:bg-[#184f70] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Inspection
        </Link>
      </div>

      {/* Inspections List */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-xl bg-white shadow-xs border border-slate-100/90 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 tracking-tight">
            All Inspections
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {recentInspections.length} Total Records
          </span>
        </div>

        <div className="divide-y divide-slate-50">
          {recentInspections.map((inspection, index) => (
            <motion.div
              key={inspection.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-5 gap-3 hover:bg-slate-50/60 transition-colors group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[#eef6fa] flex items-center justify-center flex-shrink-0 text-[#20638b]">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {inspection.product}
                    </p>
                    <span className="text-xs font-medium text-slate-400 font-mono">
                      ({inspection.id})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Category: <span className="text-slate-700 font-medium">{inspection.category}</span> · Date: {inspection.date}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                {getStatusBadge(inspection.status)}

                {/* Mutually exclusive: View Report if generated, otherwise View Inspection */}
                {inspection.reportGenerated ? (
                  <Link
                    href={`/reports/${inspection.reportId || inspection.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#20638b] text-white text-xs font-semibold hover:bg-[#184f70] transition-colors shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Report</span>
                  </Link>
                ) : (
                  <Link
                    href={`/inspections/${inspection.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 hover:text-[#20638b] transition-colors"
                  >
                    <span>View Inspection</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AppShell>
  );
}
