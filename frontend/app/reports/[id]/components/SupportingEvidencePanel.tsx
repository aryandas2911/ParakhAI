"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Eye, Shield, Calendar, Camera, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";

interface SupportingEvidencePanelProps {
  evidenceNumber?: string;
  imageSrc?: string;
  description?: string;
  timestamp?: string;
  captureDevice?: string;
}

export default function SupportingEvidencePanel({
  evidenceNumber = "Evidence 01",
  imageSrc = "/images/sample/back_declarations.jpg",
  description = "Back label — declaration region",
  timestamp = "27 Aug 2026, 14:15 IST",
  captureDevice = "Metrology HD Scanner v2.4",
}: SupportingEvidencePanelProps) {
  const [showLightbox, setShowLightbox] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-xl bg-white shadow-xs border border-slate-100/90 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#20638b]" />
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
              Supporting Evidence
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#20638b] bg-[#eef6fa] px-2.5 py-0.5 rounded-full">
            {evidenceNumber}
          </span>
        </div>

        {/* Evidence Content Split */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Left Canvas Preview with Bounding Box */}
          <div
            onClick={() => setShowLightbox(true)}
            className="sm:col-span-6 relative h-48 sm:h-52 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 cursor-pointer group"
          >
            <Image
              src={imageSrc}
              alt="Supporting Evidence"
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 50vw"
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-white/90 text-slate-800 text-xs font-semibold shadow-md">
                <Maximize2 className="w-3.5 h-3.5" />
                Inspect Full Resolution
              </span>
            </div>
          </div>

          {/* Right Metadata Block */}
          <div className="sm:col-span-6 space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Region Description
              </span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {description}
              </p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Optical OCR scan identified missing consumer care telephone/address fields in the designated statutory box.
              </p>
            </div>

            <div className="pt-2.5 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Captured At</span>
                </div>
                <span className="font-semibold text-slate-700">{timestamp}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Capture Scanner</span>
                </div>
                <span className="font-semibold text-slate-700 font-mono text-[11px]">{captureDevice}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800">
                {evidenceNumber}: {description}
              </h4>
              <button
                onClick={() => setShowLightbox(false)}
                className="px-3 py-1 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
            <div className="relative h-[65vh] w-full bg-slate-950 flex items-center justify-center">
              <Image
                src={imageSrc}
                alt="Evidence Full View"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
