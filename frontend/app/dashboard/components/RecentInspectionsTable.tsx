"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface InspectionRow {
  id: string;
  reportId?: string;
  product: string;
  packageType?: string;
  status: "Compliant" | "Non-Compliant" | "Requires Manual Review";
  inspector: string;
  date: string;
  reportGenerated: boolean;
}

const inspectionsData: InspectionRow[] = [
  {
    id: "INSP-8821",
    product: "Premium Basmati Rice 5kg",
    status: "Compliant",
    inspector: "J. Smith",
    date: "2023-10-27",
    reportGenerated: false,
  },
  {
    id: "INSP-8820",
    reportId: "RPT-LM-CE-2026-0042",
    product: "Sunflower Oil 1L PET",
    status: "Non-Compliant",
    inspector: "A. Davis",
    date: "2023-10-27",
    reportGenerated: true,
  },
  {
    id: "INSP-8819",
    product: "Almond Nuts 500g Pack",
    status: "Requires Manual Review",
    inspector: "M. Patel",
    date: "2023-10-26",
    reportGenerated: false,
  },
  {
    id: "INSP-8818",
    reportId: "RPT-LM-CE-2026-0039",
    product: "Washing Powder 2kg",
    status: "Compliant",
    inspector: "J. Smith",
    date: "2023-10-26",
    reportGenerated: true,
  },
];

export default function RecentInspectionsTable() {
  const getStatusBadge = (status: InspectionRow["status"]) => {
    switch (status) {
      case "Compliant":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-[#e0f2fe] text-[#0369a1]">
            Compliant
          </span>
        );
      case "Non-Compliant":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-600">
            Non-Compliant
          </span>
        );
      case "Requires Manual Review":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-[#FFF3D6] text-[#B45309] border border-[#FFCC70]/50">
            Requires Manual Review
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-xl bg-white shadow-xs border border-slate-100/90 overflow-hidden flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-slate-50">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
          Recent Inspections
        </h3>
        <Link
          href="/inspections"
          id="link-view-all-inspections"
          className="text-xs sm:text-sm font-semibold text-[#20638b] hover:text-[#184f70] hover:underline transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm text-slate-700 border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th scope="col" className="py-3.5 px-5 sm:px-6">
                Inspection ID
              </th>
              <th scope="col" className="py-3.5 px-4 sm:px-5">
                Product
              </th>
              <th scope="col" className="py-3.5 px-4 sm:px-5">
                Status
              </th>
              <th scope="col" className="py-3.5 px-4 sm:px-5">
                Inspector
              </th>
              <th scope="col" className="py-3.5 px-4 sm:px-5">
                Date
              </th>
              <th scope="col" className="py-3.5 px-5 sm:px-6 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {inspectionsData.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                className="hover:bg-slate-50/60 transition-colors group"
              >
                <td className="py-4 px-5 sm:px-6 font-medium text-slate-700 whitespace-nowrap text-xs sm:text-sm">
                  {row.id}
                </td>
                <td className="py-4 px-4 sm:px-5 font-normal text-slate-800 max-w-[200px] sm:max-w-xs truncate text-xs sm:text-sm">
                  {row.product}
                </td>
                <td className="py-4 px-4 sm:px-5 whitespace-nowrap">
                  {getStatusBadge(row.status)}
                </td>
                <td className="py-4 px-4 sm:px-5 font-normal text-slate-600 whitespace-nowrap text-xs sm:text-sm">
                  {row.inspector}
                </td>
                <td className="py-4 px-4 sm:px-5 font-normal text-slate-500 whitespace-nowrap text-xs sm:text-sm">
                  {row.date}
                </td>
                <td className="py-4 px-5 sm:px-6 text-right whitespace-nowrap">
                  {row.reportGenerated ? (
                    <Link
                      href={`/reports/${row.reportId || row.id}`}
                      className="text-xs font-semibold text-[#20638b] hover:text-[#184f70] hover:underline transition-colors"
                    >
                      View Report
                    </Link>
                  ) : (
                    <Link
                      href={`/inspections/${row.id.toLowerCase()}`}
                      className="text-xs font-semibold text-slate-600 hover:text-[#20638b] hover:underline transition-colors"
                    >
                      View Inspection
                    </Link>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
