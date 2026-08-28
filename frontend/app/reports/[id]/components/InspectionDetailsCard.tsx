"use client";

import React from "react";
import { FileCheck, Calendar, User, Image as ImageIcon, ShieldAlert, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface InspectionDetailsCardProps {
  inspectionId?: string;
  inspectionDate?: string;
  inspectorName?: string;
  imageCount?: number;
  status?: "Non-Compliant" | "Compliant" | "Requires Review";
  reportStatus?: "Generated" | "Pending" | "Archived";
}

export default function InspectionDetailsCard({
  inspectionId = "LM-CE-2026-0042",
  inspectionDate = "27 Aug 2026",
  inspectorName = "Officer J. Smith",
  imageCount = 3,
  status = "Non-Compliant",
  reportStatus = "Generated",
}: InspectionDetailsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-xl bg-white shadow-xs border border-slate-100/90 overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-[#20638b]" />
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Inspection Details
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 font-mono">
          DOC-VERIFIED
        </span>
      </div>

      {/* Key-Value Table */}
      <div className="p-5 space-y-3.5">
        <div className="flex items-center justify-between py-2 border-b border-slate-50 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="font-medium">Inspection ID</span>
          </div>
          <span className="font-bold text-slate-800 font-mono">{inspectionId}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-50 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Inspection Date</span>
          </div>
          <span className="font-semibold text-slate-700">{inspectionDate}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-50 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Inspector</span>
          </div>
          <span className="font-semibold text-slate-700">{inspectorName}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-50 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Evidence Images</span>
          </div>
          <span className="font-semibold text-slate-700">{imageCount} Files</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-50 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Inspection Status</span>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-50 text-red-600 border border-red-200/70">
            {status}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Report Status</span>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
            {reportStatus}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
