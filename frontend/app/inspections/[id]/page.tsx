"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import ComplianceHeader from "./components/ComplianceHeader";
import EvidenceFrameCard from "./components/EvidenceFrameCard";
import DeclarationAnalysisTable, {
  type DeclarationRow,
} from "./components/DeclarationAnalysisTable";
import VisualChecksCard from "./components/VisualChecksCard";
import ComplianceFindingsCard from "./components/ComplianceFindingsCard";
import EvidenceViewerModal from "./components/EvidenceViewerModal";
import EditDeclarationModal from "./components/EditDeclarationModal";

export default function ComplianceAnalysisPage() {
  const router = useRouter();

  // Evidence Viewer Modal state
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [evidenceInitialIndex, setEvidenceInitialIndex] = useState(0);

  // Edit Declaration Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDeclaration, setEditingDeclaration] =
    useState<DeclarationRow | null>(null);

  // Declaration data state (mutable by officer edits)
  const [declarations, setDeclarations] = useState<DeclarationRow[]>([
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
  ]);

  // Open evidence viewer
  const handleViewEvidence = useCallback((initialIndex?: number) => {
    setEvidenceInitialIndex(initialIndex ?? 0);
    setEvidenceModalOpen(true);
  }, []);

  // Open edit modal
  const handleEditRow = useCallback((row: DeclarationRow) => {
    setEditingDeclaration(row);
    setEditModalOpen(true);
  }, []);

  // Save edited declaration
  const handleSaveEdit = useCallback((updated: DeclarationRow) => {
    setDeclarations((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
  }, []);

  // Handle findings evidence click
  const handleFindingEvidence = useCallback(
    (findingId: string) => {
      // Map findings to relevant image index for evidence viewer
      const indexMap: Record<string, number> = {
        "finding-1": 1, // Back declarations for consumer care
        "finding-2": 2, // Barcode & MRP for MRP format
      };
      handleViewEvidence(indexMap[findingId] ?? 0);
    },
    [handleViewEvidence]
  );

  // Generate report (route to generated inspection report view)
  const handleGenerateReport = useCallback(() => {
    router.push("/reports/RPT-LM-CE-2026-0042");
  }, [router]);

  return (
    <AppShell title="Legal Metrology - Compliance Engine">
      {/* Page Header & Alert Banner */}
      <ComplianceHeader
        inspectionId="LM-2026-00042"
        productName="Tata Salt"
        category="Packaged Food"
        violationCount={3}
      />

      {/* Main Content: Evidence Frame (Left) + Analysis (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column - Evidence Frame */}
        <div className="lg:col-span-5 flex flex-col">
          <EvidenceFrameCard
            imageSrc="/images/sample/front_package.jpg"
            imageAlt="Tata Salt - Front Package"
            onViewEvidence={() => handleViewEvidence(0)}
          />
        </div>

        {/* Right Column - Declaration Analysis + Visual Checks + Findings */}
        <div className="lg:col-span-7 flex flex-col space-y-5">
          <DeclarationAnalysisTable
            declarations={declarations}
            onEditRow={handleEditRow}
          />
          <VisualChecksCard />
          <ComplianceFindingsCard
            onViewEvidence={handleFindingEvidence}
          />
        </div>
      </div>

      {/* Footer Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
        className="flex items-center justify-end rounded-xl bg-white shadow-xs border border-slate-100/90 px-5 sm:px-6 py-4"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerateReport}
          id="btn-generate-report"
          className="inline-flex items-center gap-2.5 px-7 py-3 rounded-lg bg-[#20638b] text-white text-sm font-semibold shadow-sm hover:bg-[#184f70] active:bg-[#13445e] transition-all duration-200 cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Generate Report</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>

      {/* Modals */}
      <EvidenceViewerModal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        initialIndex={evidenceInitialIndex}
      />
      <EditDeclarationModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        declaration={editingDeclaration}
        onSave={handleSaveEdit}
      />
    </AppShell>
  );
}
