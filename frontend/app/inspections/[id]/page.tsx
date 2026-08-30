"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { FileText, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import {
  fetchInspectionById,
  fetchInspectionImages,
  fetchInspectionOcr,
  deleteInspectionImage,
  processInspection,
  type InspectionData,
  type InspectionImageData,
  type ProcessingResult,
  type OcrImageResult,
} from "@/lib/api";
import ComplianceHeader from "./components/ComplianceHeader";
import EvidenceFrameCard from "./components/EvidenceFrameCard";
import DeclarationAnalysisTable from "./components/DeclarationAnalysisTable";
import VisualChecksCard from "./components/VisualChecksCard";
import ComplianceFindingsCard from "./components/ComplianceFindingsCard";
import OcrTextCard from "./components/OcrTextCard";
import EvidenceViewerModal from "./components/EvidenceViewerModal";
import EditDeclarationModal from "./components/EditDeclarationModal";

export default function ComplianceAnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const { session } = useAuth();
  const inspectionId = params.id as string;

  const [inspection, setInspection] = useState<InspectionData | null>(null);
  const [images, setImages] = useState<InspectionImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Evidence Viewer Modal state
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [evidenceInitialIndex, setEvidenceInitialIndex] = useState(0);

  // Evidence frame navigation state
  const [frameImageIndex, setFrameImageIndex] = useState(0);

  // Edit Declaration Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDeclaration, setEditingDeclaration] =
    useState<{ id: string; field: string; extractedValue: string; status: "verified" | "requires_review" | "not_detected"; confidence: number } | null>(null);

  // OCR state
  const [ocrImages, setOcrImages] = useState<OcrImageResult[]>([]);
  const [ocrLoading, setOcrLoading] = useState(false);

  // Declaration data state — populated from OCR (empty until extraction step)
  const [declarations, setDeclarations] = useState<{ id: string; field: string; extractedValue: string; status: "verified" | "requires_review" | "not_detected"; confidence: number }[]>([]);

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

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
        // Fetch images
        const imgs = await fetchInspectionImages(session.access_token, inspectionId);
        setImages(imgs);
      }
      setLoading(false);
    };

    load();
  }, [session?.access_token, inspectionId]);

  // Auto-process images once they finish loading
  const hasAutoProcessed = useRef(false);
  useEffect(() => {
    if (!session?.access_token || !inspectionId) return;
    if (loading || images.length === 0 || hasAutoProcessed.current) return;

    hasAutoProcessed.current = true;

    const autoProcess = async () => {
      setProcessing(true);
      setProcessingError(null);
      try {
        const result = await processInspection(session.access_token, inspectionId);
        setProcessingResult(result);
        if (result.ocr_images) {
          setOcrImages(result.ocr_images);
        }
      } catch (err) {
        setProcessingError(err instanceof Error ? err.message : "Auto-processing failed.");
      } finally {
        setProcessing(false);
      }
    };

    autoProcess();
  }, [session?.access_token, inspectionId, loading, images.length]);

  // Fetch stored OCR results on load (if already processed previously)
  useEffect(() => {
    if (!session?.access_token || !inspectionId) return;
    if (loading || hasAutoProcessed.current) return;

    const loadOcr = async () => {
      setOcrLoading(true);
      const ocr = await fetchInspectionOcr(session.access_token!, inspectionId);
      if (ocr && ocr.images.length > 0) {
        setOcrImages(ocr.images);
      }
      setOcrLoading(false);
    };

    loadOcr();
  }, [session?.access_token, inspectionId, loading]);

  // Open evidence viewer
  const handleViewEvidence = useCallback((initialIndex?: number) => {
    setEvidenceInitialIndex(initialIndex ?? 0);
    setEvidenceModalOpen(true);
  }, []);

  // Open edit modal
  const handleEditRow = useCallback((row: { id: string; field: string; extractedValue: string; status: "verified" | "requires_review" | "not_detected"; confidence: number }) => {
    setEditingDeclaration(row);
    setEditModalOpen(true);
  }, []);

  // Save edited declaration
  const handleSaveEdit = useCallback((updated: { id: string; field: string; extractedValue: string; status: "verified" | "requires_review" | "not_detected"; confidence: number }) => {
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

  // Process images
  const handleProcessImages = useCallback(async () => {
    if (!session?.access_token || !inspectionId || processing) return;
    setProcessing(true);
    setProcessingError(null);
    setProcessingResult(null);
    try {
      const result = await processInspection(session.access_token, inspectionId);
      setProcessingResult(result);
      if (result.ocr_images) {
        setOcrImages(result.ocr_images);
      }
    } catch (err) {
      setProcessingError(err instanceof Error ? err.message : "Processing failed.");
    } finally {
      setProcessing(false);
    }
  }, [session?.access_token, inspectionId, processing]);

  // Delete image handler
  const handleDeleteImage = useCallback(
    async (imageId: string) => {
      if (!session?.access_token || !inspectionId) return;
      const ok = await deleteInspectionImage(
        session.access_token,
        inspectionId,
        imageId
      );
      if (ok) {
        setImages((prev) => prev.filter((img) => img.image_id !== imageId));
      }
    },
    [session?.access_token, inspectionId]
  );

  // Map images to EvidenceViewerModal format, attaching OCR blocks per image
  const evidenceImages = images.map((img) => {
    const ocrMatch = ocrImages.find((o) => o.image_id === img.image_id);
    return {
      src: img.signed_url,
      label: img.image_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      ocrBlocks: ocrMatch?.blocks,
    };
  });

  // Primary image for the frame card
  const primaryImage = images.length > 0 ? images[0] : null;

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
            imageSrc={evidenceImages[frameImageIndex]?.src}
            imageAlt={evidenceImages[frameImageIndex]?.label || "Product Image"}
            images={evidenceImages}
            currentIndex={frameImageIndex}
            onNavigate={setFrameImageIndex}
            onViewEvidence={() => handleViewEvidence(frameImageIndex)}
          />
        </div>

        {/* Right Column - Declaration Analysis + Visual Checks + Findings */}
        <div className="lg:col-span-7 flex flex-col space-y-5">
          <DeclarationAnalysisTable
            declarations={declarations}
            onEditRow={handleEditRow}
          />
          <OcrTextCard
            ocrImages={ocrImages}
            loading={ocrLoading || processing}
          />
          <VisualChecksCard />
          <ComplianceFindingsCard
            onViewEvidence={handleFindingEvidence}
          />
        </div>
      </div>

      {/* Uploaded Images Section */}
      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-xl bg-white shadow-xs border border-slate-100/90 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Uploaded Images ({images.length})
            </h3>
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img.image_id} className="relative group">
                <img
                  src={img.signed_url}
                  alt={img.image_type}
                  className="w-full h-32 object-cover rounded-lg border border-slate-100"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleViewEvidence(
                      images.findIndex((i) => i.image_id === img.image_id)
                    )}
                    className="px-2 py-1 text-[10px] font-semibold text-white bg-white/20 rounded hover:bg-white/30 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteImage(img.image_id)}
                    className="px-2 py-1 text-[10px] font-semibold text-red-200 bg-red-500/30 rounded hover:bg-red-500/50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
                <span className="absolute bottom-1 left-1 text-[9px] font-medium text-white bg-black/50 px-1.5 py-0.5 rounded">
                  {img.image_type.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Footer Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
        className="flex items-center justify-between rounded-xl bg-white shadow-xs border border-slate-100/90 px-5 sm:px-6 py-4"
      >
        {/* Processing Status */}
        <div className="flex-1 min-w-0">
          {processing && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing &amp; OCR running...</span>
            </div>
          )}
          {processingError && (
            <p className="text-sm font-medium text-red-600">{processingError}</p>
          )}
          {processingResult && !processing && (
            <p className="text-sm text-slate-600">
              Processed{" "}
              <span className="font-semibold text-emerald-600">
                {processingResult.processed_images}
              </span>
              /{processingResult.total_images} images
              {processingResult.failed_images > 0 && (
                <span className="text-red-500 ml-1">
                  ({processingResult.failed_images} failed)
                </span>
              )}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {images.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleProcessImages}
              disabled={processing}
              id="btn-process-images"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 hover:text-[#20638b] active:bg-slate-100 transition-all duration-200 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5m-4.25-11.396c.251.023.501.05.75.082M12 21a8.966 8.966 0 0 0 5.982-2.275M12 21a8.966 8.966 0 0 1-5.982-2.275M15.75 3.186a24.284 24.284 0 0 1 2.293.094m-6.293.094A24.284 24.284 0 0 0 9.467 3.186m6.293.094c.183.042.365.083.546.124m-.546-.124a24.284 24.284 0 0 1-2.293-.094" />
                </svg>
              )}
              <span>{processing ? "Processing..." : "Process Images"}</span>
            </motion.button>
          )}
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
        </div>
      </motion.div>

      {/* Modals */}
      <EvidenceViewerModal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        initialIndex={evidenceInitialIndex}
        images={evidenceImages.length > 0 ? evidenceImages : undefined}
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
