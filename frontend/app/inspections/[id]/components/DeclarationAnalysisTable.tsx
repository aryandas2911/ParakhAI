"use client";

import React from "react";
import { CheckCircle2, XCircle, Pencil } from "lucide-react";
import { motion } from "framer-motion";

export interface DeclarationRow {
  id: string;
  field: string;
  extractedValue: string;
  status: "verified" | "requires_review" | "not_detected";
  confidence: number;
}

interface DeclarationAnalysisTableProps {
  declarations?: DeclarationRow[];
  onEditRow?: (row: DeclarationRow) => void;
}

const defaultDeclarations: DeclarationRow[] = [
  {
    id: "dec-1",
    field: "Product Name",
    extractedValue: "Tata Salt",
    status: "verified",
    confidence: 98,
  },
  {
    id: "dec-2",
    field: "MRP",
    extractedValue: "₹30",
    status: "verified",
    confidence: 85,
  },
  {
    id: "dec-3",
    field: "Net Quantity",
    extractedValue: "1 kg",
    status: "verified",
    confidence: 96,
  },
  {
    id: "dec-4",
    field: "Manufacturer",
    extractedValue: "ABC Foods",
    status: "verified",
    confidence: 94,
  },
  {
    id: "dec-5",
    field: "Date",
    extractedValue: "July 2026",
    status: "verified",
    confidence: 92,
  },
  {
    id: "dec-6",
    field: "Consumer Care",
    extractedValue: "Not detected",
    status: "not_detected",
    confidence: 40,
  },
];

function getStatusBadge(status: DeclarationRow["status"]) {
  switch (status) {
    case "verified":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100/80">
          <CheckCircle2 className="w-3 h-3" />
          Verified
        </span>
      );
    case "requires_review":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100/80">
          Requires Review
        </span>
      );
    case "not_detected":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-red-50 text-red-600 border border-red-100/80">
          <XCircle className="w-3 h-3" />
          Not Detected
        </span>
      );
  }
}

function getConfidenceColor(confidence: number) {
  if (confidence >= 90) return "text-emerald-600";
  if (confidence >= 70) return "text-amber-600";
  return "text-red-500";
}

export default function DeclarationAnalysisTable({
  declarations = defaultDeclarations,
  onEditRow,
}: DeclarationAnalysisTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-xl bg-white shadow-xs border border-slate-100/90 overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-50">
        <h3 className="text-base font-bold text-slate-800 tracking-tight">
          Declaration Analysis
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th
                scope="col"
                className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
              >
                Field
              </th>
              <th
                scope="col"
                className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center"
              >
                Conf.
              </th>
              <th
                scope="col"
                className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center w-12"
              >
                {/* Edit */}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {declarations.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.15 + index * 0.04 }}
                className={`group transition-colors ${
                  row.status === "not_detected"
                    ? "bg-red-50/30 hover:bg-red-50/50"
                    : "hover:bg-slate-50/60"
                }`}
              >
                {/* Field Name & Extracted Value */}
                <td className="py-3.5 px-5">
                  <p
                    className={`text-sm font-semibold ${
                      row.status === "not_detected"
                        ? "text-red-700"
                        : "text-slate-800"
                    }`}
                  >
                    {row.field}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${
                      row.status === "not_detected"
                        ? "text-red-500 italic"
                        : "text-slate-500"
                    }`}
                  >
                    {row.extractedValue}
                  </p>
                </td>

                {/* Status Badge */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {getStatusBadge(row.status)}
                </td>

                {/* Confidence */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <span
                    className={`text-sm font-bold ${getConfidenceColor(row.confidence)}`}
                  >
                    {row.confidence}%
                  </span>
                </td>

                {/* Edit Action */}
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => onEditRow?.(row)}
                    className="p-1.5 rounded-md text-slate-300 hover:text-[#20638b] hover:bg-slate-100 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    aria-label={`Edit ${row.field}`}
                    title={`Edit ${row.field}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
