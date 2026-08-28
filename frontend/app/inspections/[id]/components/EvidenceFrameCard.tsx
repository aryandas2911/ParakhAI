"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut, RotateCcw, Eye, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";

interface BoundingBox {
  id: string;
  label: string;
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
  color?: string;
}

interface EvidenceFrameCardProps {
  imageSrc?: string;
  imageAlt?: string;
  boundingBoxes?: BoundingBox[];
  onViewEvidence?: () => void;
}

const defaultBoundingBoxes: BoundingBox[] = [
  {
    id: "bb-1",
    label: "Label Region",
    x: 18,
    y: 52,
    width: 38,
    height: 30,
    color: "rgba(239, 68, 68, 0.7)",
  },
  {
    id: "bb-2",
    label: "Product Name",
    x: 25,
    y: 35,
    width: 28,
    height: 10,
    color: "rgba(239, 68, 68, 0.5)",
  },
];

export default function EvidenceFrameCard({
  imageSrc = "/images/sample/front_package.jpg",
  imageAlt = "Tata Salt - Front Package",
  boundingBoxes = defaultBoundingBoxes,
  onViewEvidence,
}: EvidenceFrameCardProps) {
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredBox, setHoveredBox] = useState<string | null>(null);
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
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-contain pointer-events-none"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />

            {/* Bounding Box Overlays */}
            {boundingBoxes.map((box) => (
              <div
                key={box.id}
                className="absolute transition-all duration-300 ease-out"
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                  border: `2px solid ${box.color || "rgba(239, 68, 68, 0.7)"}`,
                  backgroundColor:
                    hoveredBox === box.id
                      ? "rgba(239, 68, 68, 0.15)"
                      : "rgba(239, 68, 68, 0.06)",
                  borderRadius: "3px",
                  boxShadow:
                    hoveredBox === box.id
                      ? "0 0 12px rgba(239, 68, 68, 0.3)"
                      : "none",
                }}
                onMouseEnter={() => setHoveredBox(box.id)}
                onMouseLeave={() => setHoveredBox(null)}
              >
                {/* Bounding box label */}
                {hoveredBox === box.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-6 left-0 px-2 py-0.5 bg-red-600 text-white text-[10px] font-semibold rounded shadow-sm whitespace-nowrap z-10"
                  >
                    {box.label}
                  </motion.div>
                )}
                {/* Corner markers */}
                <div className="absolute -top-[3px] -left-[3px] w-2 h-2 border-t-2 border-l-2 border-red-500 rounded-tl-sm" />
                <div className="absolute -top-[3px] -right-[3px] w-2 h-2 border-t-2 border-r-2 border-red-500 rounded-tr-sm" />
                <div className="absolute -bottom-[3px] -left-[3px] w-2 h-2 border-b-2 border-l-2 border-red-500 rounded-bl-sm" />
                <div className="absolute -bottom-[3px] -right-[3px] w-2 h-2 border-b-2 border-r-2 border-red-500 rounded-br-sm" />
              </div>
            ))}
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
