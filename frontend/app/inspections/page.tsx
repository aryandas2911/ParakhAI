"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, ClipboardCheck, FileText, Search, Filter, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { fetchInspections, type InspectionData } from "@/lib/api";

function getStatusBadge(status: string) {
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
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-100/80">
          Pending
        </span>
      );
  }
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function InspectionsPage() {
  const { session } = useAuth();
  const [inspections, setInspections] = useState<InspectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.access_token) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      const data = await fetchInspections(session.access_token);
      setInspections(data);
      setLoading(false);
    };

    load();
  }, [session?.access_token]);

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

      {/* Error State */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          <span className="ml-2 text-sm text-slate-500">Loading inspections...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && inspections.length === 0 && (
        <div className="rounded-xl bg-white shadow-xs border border-slate-100/90 px-5 py-16 text-center">
          <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">No inspections yet</p>
          <p className="text-xs text-slate-400 mt-1">Create your first inspection to get started.</p>
          <Link
            href="/inspections/new"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-lg bg-[#20638b] text-white text-sm font-semibold shadow-sm hover:bg-[#184f70] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Inspection
          </Link>
        </div>
      )}

      {/* Inspections List */}
      {!loading && inspections.length > 0 && (
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
              {inspections.length} Total Records
            </span>
          </div>

          <div className="divide-y divide-slate-50">
            {inspections.map((inspection, index) => (
              <motion.div
                key={inspection.inspection_id}
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
                        {inspection.product_name || "Untitled Product"}
                      </p>
                      <span className="text-xs font-medium text-slate-400 font-mono">
                        ({inspection.inspection_id.slice(0, 8)})
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Category: <span className="text-slate-700 font-medium">{inspection.category || "N/A"}</span> · Date: {formatDate(inspection.inspection_date)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  {getStatusBadge(inspection.compliance_status)}

                  <Link
                    href={`/inspections/${inspection.inspection_id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 hover:text-[#20638b] transition-colors"
                  >
                    <span>View Inspection</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AppShell>
  );
}
