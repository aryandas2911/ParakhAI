"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut, RotateCcw, Eye, Maximize2, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { motion } from "framer-motion";

interface EvidenceFrameCardProps {
  imageSrc?: string;
  imageAlt?: string;
  images?: { src: string; label: string }[];
  currentIndex?: number;
  onNavigate?: (index: number) => void;
  onViewEvidence?: () => void;
}

export default function EvidenceFrameCard({
  imageSrc,
  imageAlt = "Product Image",
  images = [],
  currentIndex = 0,
  onNavigate,
  onViewEvidence,
}: EvidenceFrameCardProps) {
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.25, 1);
      if (newZoom === 1) setPanOffset({ x: 0, y: 0 });
      return newZoom;
    });
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return;
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    },
    [zoom, panOffset]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      const maxPan = ((zoom - 1) * 200);
      const newX = Math.max(-maxPan, Math.min(maxPan, e.clientX - panStart.x));
      const newY = Math.max(-maxPan, Math.min(maxPan, e.clientY - panStart.y));
      setPanOffset({ x: newX, y: newY });
    },
    [isPanning, panStart, zoom]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-xl bg-white shadow-xs border border-slate-100/90 overflow-hidden flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Evidence Frame
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomIn}
            id="btn-zoom-in"
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#20638b] hover:bg-slate-50 transition-colors cursor-pointer"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            id="btn-zoom-out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#20638b] hover:bg-slate-50 transition-colors cursor-pointer"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            id="btn-zoom-reset"
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#20638b] hover:bg-slate-50 transition-colors cursor-pointer"
            aria-label="Reset zoom"
            title="Reset view"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Image Canvas with Bounding Boxes */}
      <div
        ref={containerRef}
        className="relative flex-1 bg-slate-50 overflow-hidden select-none"
        style={{
          cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "default",
          minHeight: 340,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative w-full h-full flex items-center justify-center transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
          }}
        >
          {/* Product Image */}
          <div className="relative w-full h-full min-h-[340px]">
            {imageSrc ? (
              imageSrc.startsWith("http") ? (
                <img
                  src={imageSrc}
                  alt={imageAlt}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
              ) : (
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  className="object-contain pointer-events-none"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              )
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <ImageOff className="w-12 h-12 text-slate-300" />
                <span className="text-xs font-medium text-slate-400">No image uploaded</span>
              </div>
            )}
          </div>
        </div>

        {/* Zoom Level Indicator */}
        {zoom > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/70 text-white text-[10px] font-semibold backdrop-blur-sm"
          >
            <Maximize2 className="w-3 h-3 inline mr-1 -mt-0.5" />
            {Math.round(zoom * 100)}%
          </motion.div>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && onNavigate && (
          <>
            <button
              onClick={() => onNavigate(currentIndex > 0 ? currentIndex - 1 : images.length - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 text-slate-700 hover:bg-white hover:shadow-lg transition-all cursor-pointer z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate(currentIndex < images.length - 1 ? currentIndex + 1 : 0)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 text-slate-700 hover:bg-white hover:shadow-lg transition-all cursor-pointer z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            {/* Image Counter */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-slate-900/70 text-white text-[10px] font-semibold backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* View Evidence Button */}
      <div className="px-5 py-4 border-t border-slate-50 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onViewEvidence}
          id="btn-view-evidence"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 hover:text-[#20638b] transition-all duration-200 cursor-pointer shadow-xs"
        >
          <Eye className="w-4 h-4" />
          <span>View Evidence</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
