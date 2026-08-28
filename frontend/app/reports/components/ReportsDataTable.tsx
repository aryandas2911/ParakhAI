"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ReportHistoryItem } from "../data/reportsData";

interface ReportsDataTableProps {
  data: ReportHistoryItem[];
}

function getStatusBadge(status: ReportHistoryItem["status"]) {
  switch (status) {
    case "Non-Compliant":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-[#ffe4e6] text-[#e11d48]">
          Non-Compliant
        </span>
      );
    case "Compliant":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-[#dcfce7] text-[#15803d]">
          Compliant
        </span>
      );
    case "Requires Review":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-[#fef9c3] text-[#a16207]">
          Requires Review
        </span>
      );
  }
}

function getFindingsText(item: ReportHistoryItem) {
  if (item.findingsSeverity === "violations") {
    return <span className="font-medium text-[#e11d48]">{item.findings}</span>;
  }
  if (item.findingsSeverity === "review") {
    return <span className="font-medium text-[#d97706]">{item.findings}</span>;
  }
  return <span className="text-slate-500 font-normal">{item.findings}</span>;
}

export default function ReportsDataTable({ data }: ReportsDataTableProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-slate-200/80 p-12 text-center">
        <p className="text-sm font-semibold text-slate-700">
          No matching inspection records found
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Try changing your search query or resetting filters.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th scope="col" className="py-3.5 px-5">
                INSPECTION ID
              </th>
              <th scope="col" className="py-3.5 px-4">
                PRODUCT
              </th>
              <th scope="col" className="py-3.5 px-4">
                CATEGORY
              </th>
              <th scope="col" className="py-3.5 px-4">
                STATUS
              </th>
              <th scope="col" className="py-3.5 px-4">
                INSPECTOR
              </th>
              <th scope="col" className="py-3.5 px-4">
                DATE
              </th>
              <th scope="col" className="py-3.5 px-4">
                FINDINGS
              </th>
              <th scope="col" className="py-3.5 px-5 text-right">
                ACTION
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80">
            {data.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
                className="hover:bg-slate-50/70 transition-colors group"
              >
                {/* Inspection ID */}
                <td className="py-4 px-5 whitespace-nowrap">
                  <Link
                    href={`/reports/${row.reportId || row.id}`}
                    className="font-medium text-[#20638b] hover:underline"
                  >
                    {row.id}
                  </Link>
                </td>

                {/* Product */}
                <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap text-xs sm:text-sm">
                  {row.product}
                </td>

                {/* Category */}
                <td className="py-4 px-4 font-normal text-slate-600 whitespace-nowrap text-xs sm:text-sm">
                  {row.category}
                </td>

                {/* Status Badge */}
                <td className="py-4 px-4 whitespace-nowrap">
                  {getStatusBadge(row.status)}
                </td>

                {/* Inspector */}
                <td className="py-4 px-4 font-normal text-slate-700 whitespace-nowrap text-xs sm:text-sm">
                  {row.inspector}
                </td>

                {/* Date */}
                <td className="py-4 px-4 font-normal text-slate-600 whitespace-nowrap text-xs sm:text-sm">
                  {row.date}
                </td>

                {/* Findings */}
                <td className="py-4 px-4 whitespace-nowrap text-xs sm:text-sm">
                  {getFindingsText(row)}
                </td>

                {/* Action */}
                <td className="py-4 px-5 text-right whitespace-nowrap">
                  <Link
                    href={`/reports/${row.reportId || row.id}`}
                    className="font-semibold text-xs text-[#20638b] hover:text-[#184f70] hover:underline transition-colors"
                  >
                    View
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
