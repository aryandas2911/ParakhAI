"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FileText, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { fetchInspectionById, type InspectionData } from "@/lib/api";
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
  const params = useParams();
  const { session } = useAuth();
  const inspectionId = params.id as string;

  const [inspection, setInspection] = useState<InspectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Evidence Viewer Modal state
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [evidenceInitialIndex, setEvidenceInitialIndex] = useState(0);

  // Edit Declaration Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDeclaration, setEditingDeclaration] =
    useState<DeclarationRow | null>(null);

  // Declaration data state (mutable by officer edits)
  const [declarations, setDeclarations] = useState<DeclarationRow[]>([]);

  // Fetch inspection data
  useEffect(() => {
    if (!session?.access_token || !inspectionId) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      const data = await fetchInspectionById(session.access_token, inspectionId);
      if (!data) {
        setError("Inspection not found or you are not authorized to view it.");
      } else {
        setInspection(data);
      }
      setLoading(false);
    };

    load();
  }, [session?.access_token, inspectionId]);

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
      const indexMap: Record<string, number> = {
        "finding-1": 1,
        "finding-2": 2,
      };
      handleViewEvidence(indexMap[findingId] ?? 0);
    },
    [handleViewEvidence]
  );

  // Generate report
  const handleGenerateReport = useCallback(() => {
    router.push("/reports/RPT-LM-CE-2026-0042");
  }, [router]);

  // Loading state
  if (loading) {
    return (
      <AppShell title="Legal Metrology - Compliance Engine">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          <span className="ml-2 text-sm text-slate-500">Loading inspection...</span>
        </div>
      </AppShell>
    );
  }

  // Error state
  if (error || !inspection) {
    return (
      <AppShell title="Legal Metrology - Compliance Engine">
        <div className="rounded-xl bg-white shadow-xs border border-slate-100/90 px-5 py-16 text-center">
          <p className="text-sm font-semibold text-slate-600">{error || "Inspection not found."}</p>
          <button
            onClick={() => router.push("/inspections")}
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-lg bg-[#20638b] text-white text-sm font-semibold shadow-sm hover:bg-[#184f70] transition-colors"
          >
            Back to Inspections
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Legal Metrology - Compliance Engine">
      {/* Page Header & Alert Banner */}
      <ComplianceHeader
        inspectionId={inspection.inspection_id}
        productName={inspection.product_name || "Untitled Product"}
        category={inspection.category || "N/A"}
        violationCount={0}
      />

      {/* Main Content: Evidence Frame (Left) + Analysis (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column - Evidence Frame */}
        <div className="lg:col-span-5 flex flex-col">
          <EvidenceFrameCard
            imageSrc="/images/sample/front_package.jpg"
            imageAlt={`${inspection.product_name || "Product"} - Front Package`}
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
