"use client";

import React from "react";
import { CheckCircle2, XCircle, AlertCircle, FileText } from "lucide-react";
import { motion } from "framer-motion";

export interface DeclarationItem {
  field: string;
  extractedValue: string;
  status: "Verified" | "Requires Review" | "Not Detected";
  confidence: number;
}

interface DeclarationVerificationTableProps {
  declarations?: DeclarationItem[];
}

const defaultDeclarations: DeclarationItem[] = [
  {
    field: "Product Name",
    extractedValue: "Premium Basmati Rice",
    status: "Verified",
    confidence: 98,
  },
  {
    field: "MRP",
    extractedValue: "₹260",
    status: "Requires Review",
    confidence: 85,
  },
  {
    field: "Net Quantity",
    extractedValue: "5 kg",
    status: "Verified",
    confidence: 96,
  },
  {
    field: "Manufacturer",
    extractedValue: "Aarav Foods Pvt. Ltd.",
    status: "Verified",
    confidence: 94,
  },
  {
    field: "Consumer Care",
    extractedValue: "Not detected",
    status: "Not Detected",
    confidence: 40,
  },
];

function getStatusBadge(status: DeclarationItem["status"]) {
  switch (status) {
    case "Verified":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <CheckCircle2 className="w-3 h-3" />
          Verified
        </span>
      );
    case "Requires Review":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
          <AlertCircle className="w-3 h-3" />
          Requires Review
        </span>
      );
    case "Not Detected":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200/80">
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

export default function DeclarationVerificationTable({
  declarations = defaultDeclarations,
}: DeclarationVerificationTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-xl bg-white shadow-xs border border-slate-100/90 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#20638b]" />
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">
            Declaration Verification Table
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {declarations.length} Mandatory Declarations
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th scope="col" className="py-3 px-5">
                Field
              </th>
              <th scope="col" className="py-3 px-4">
                Extracted Value
              </th>
              <th scope="col" className="py-3 px-4">
                Status
              </th>
              <th scope="col" className="py-3 px-5 text-right">
                Confidence
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {declarations.map((item, index) => (
              <tr
                key={item.field}
                className={`transition-colors ${
                  item.status === "Not Detected"
                    ? "bg-red-50/20 hover:bg-red-50/40"
                    : "hover:bg-slate-50/60"
                }`}
              >
                <td className="py-3.5 px-5 font-semibold text-slate-800 text-xs sm:text-sm whitespace-nowrap">
                  {item.field}
                </td>
                <td className="py-3.5 px-4 font-normal text-slate-700 text-xs sm:text-sm">
                  <span
                    className={
                      item.status === "Not Detected"
                        ? "text-red-600 font-medium italic"
                        : "text-slate-800"
                    }
                  >
                    {item.extractedValue}
                  </span>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>
                <td className="py-3.5 px-5 text-right whitespace-nowrap">
                  <span
                    className={`text-xs sm:text-sm font-bold font-mono ${getConfidenceColor(
                      item.confidence
                    )}`}
                  >
                    {item.confidence}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
