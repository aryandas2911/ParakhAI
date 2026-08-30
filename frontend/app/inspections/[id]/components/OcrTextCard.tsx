"use client";

import React from "react";
import { FileText, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { OcrImageResult } from "@/lib/api";

interface OcrTextCardProps {
  ocrImages?: OcrImageResult[];
  loading?: boolean;
}

function getConfidenceBadge(confidence: number) {
  if (confidence >= 0.9) return "text-emerald-600";
  if (confidence >= 0.7) return "text-amber-600";
  return "text-red-500";
}

export default function OcrTextCard({ ocrImages = [], loading = false }: OcrTextCardProps) {
  const allBlocks = ocrImages.flatMap((img) =>
    img.blocks.map((b) => ({ ...b, image_id: img.image_id }))
  );

  const hasError = ocrImages.some((img) => img.status === "failed");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-xl bg-white shadow-xs border border-slate-100/90 overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-50">
        <h3 className="text-base font-bold text-slate-800 tracking-tight">
          Extracted Text (OCR)
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {loading
            ? "Running OCR..."
            : allBlocks.length > 0
              ? `${allBlocks.length} text region${allBlocks.length === 1 ? "" : "s"} detected`
              : "No text detected"}
        </p>
      </div>

      {/* Content */}
      <div className="p-5">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
            <span>Running OCR on images...</span>
          </div>
        )}

        {!loading && hasError && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>OCR failed for one or more images.</span>
          </div>
        )}

        {!loading && allBlocks.length === 0 && !hasError && (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
            <FileText className="w-4 h-4" />
            <span>No text regions detected in uploaded images.</span>
          </div>
        )}

        {!loading && allBlocks.length > 0 && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {allBlocks.map((block, idx) => (
              <motion.div
                key={`${block.image_id}-${idx}`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100"
              >
                <p className="text-sm text-slate-800 font-medium flex-1 break-words">
                  {block.text}
                </p>
                <span
                  className={`text-xs font-bold shrink-0 ${getConfidenceBadge(block.confidence)}`}
                >
                  {Math.round(block.confidence * 100)}%
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
