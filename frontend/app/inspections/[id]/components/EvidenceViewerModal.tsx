"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OcrBlock {
  text: string;
  confidence: number;
  bounding_box: number[][];
}

interface EvidenceImage {
  src: string;
  label: string;
  ocrBlocks?: OcrBlock[];
}

interface EvidenceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  images?: EvidenceImage[];
  initialIndex?: number;
}

const defaultImages: EvidenceImage[] = [];

function ImageWithBoxes({
  src,
  label,
  ocrBlocks,
  zoom,
}: {
  src: string;
  label: string;
  ocrBlocks?: OcrBlock[];
  zoom: number;
}) {
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = useCallback(() => {
    if (imgRef.current) {
      setNaturalSize({
        w: imgRef.current.naturalWidth,
        h: imgRef.current.naturalHeight,
      });
    }
  }, []);

  const hasBoxes = ocrBlocks && ocrBlocks.length > 0 && naturalSize;

  return (
    <div className="relative inline-block">
      {src.startsWith("http") ? (
        <img
          ref={imgRef}
          src={src}
          alt={label}
          className="object-contain max-w-full max-h-[60vh]"
          onLoad={handleLoad}
        />
      ) : (
        <Image
          src={src}
          alt={label}
          width={800}
          height={600}
          className="object-contain max-w-full max-h-[60vh]"
          priority
          onLoad={handleLoad}
        />
      )}

      {/* OCR Bounding Box Overlay */}
      {hasBoxes && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${naturalSize.w} ${naturalSize.h}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {ocrBlocks.map((block, i) => {
            if (!block.bounding_box || block.bounding_box.length < 4) return null;
            const points = block.bounding_box
              .map((p) => `${p[0]},${p[1]}`)
              .join(" ");
            return (
              <g key={i}>
                <polygon
                  points={points}
                  fill="rgba(32, 99, 139, 0.08)"
                  stroke="#20638b"
                  strokeWidth={2 / zoom}
                  strokeLinejoin="round"
                />
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

export default function EvidenceViewerModal({
  isOpen,
  onClose,
  images = defaultImages,
  initialIndex = 0,
}: EvidenceViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setZoom(1);
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setZoom(1);
  }, [images.length]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.3, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.3, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  const currentImage = images[currentIndex];
  const showBoxes = currentImage?.ocrBlocks && currentImage.ocrBlocks.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-10 w-full max-w-5xl max-h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                  Evidence Viewer
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentImage?.label} — Image {currentIndex + 1} of{" "}
                  {images.length}
                  {showBoxes && (
                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full bg-[#20638b]/10 text-[#20638b] text-[10px] font-bold">
                      {currentImage!.ocrBlocks!.length} text regions
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-1 py-0.5 bg-white">
                  <button
                    onClick={handleZoomOut}
                    className="p-1.5 rounded text-slate-400 hover:text-[#20638b] hover:bg-slate-50 transition-colors cursor-pointer"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold text-slate-600 min-w-[40px] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-1.5 rounded text-slate-400 hover:text-[#20638b] hover:bg-slate-50 transition-colors cursor-pointer"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="p-1.5 rounded text-slate-400 hover:text-[#20638b] hover:bg-slate-50 transition-colors cursor-pointer"
                    aria-label="Reset zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close evidence viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image Area */}
            <div className="flex-1 relative bg-slate-900 overflow-auto flex items-center justify-center min-h-[400px]">
              {currentImage && (
                <div
                  className="relative transition-transform duration-200 ease-out"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "center center",
                  }}
                >
                  <ImageWithBoxes
                    src={currentImage.src}
                    label={currentImage.label}
                    ocrBlocks={currentImage.ocrBlocks}
                    zoom={zoom}
                  />
                </div>
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 text-slate-700 hover:bg-white hover:shadow-lg transition-all cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 text-slate-700 hover:bg-white hover:shadow-lg transition-all cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Zoom Level Indicator */}
              {zoom !== 1 && (
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/70 text-white text-[10px] font-semibold backdrop-blur-sm">
                  <Maximize2 className="w-3 h-3 inline mr-1 -mt-0.5" />
                  {Math.round(zoom * 100)}%
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-50 border-t border-slate-100">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentIndex(i);
                      setZoom(1);
                    }}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      i === currentIndex
                        ? "border-[#20638b] shadow-md ring-1 ring-[#20638b]/30"
                        : "border-slate-200 hover:border-slate-300 opacity-60 hover:opacity-90"
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={img.label}
                      fill
                      className="object-cover"
                      sizes="56px"
                      unoptimized={img.src.startsWith("http")}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
