"use client";

import React, { useRef, useState, useCallback } from "react";
import { Camera, Upload } from "lucide-react";
import { motion } from "framer-motion";

interface ImageCaptureZoneProps {
  onFilesAdded: (files: File[]) => void;
  onOpenCamera?: () => void;
}

export default function ImageCaptureZone({ onFilesAdded, onOpenCamera }: ImageCaptureZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type === "image/jpeg" || f.type === "image/png"
      );
      if (files.length > 0) onFilesAdded(files);
    },
    [onFilesAdded]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) onFilesAdded(files);
    e.target.value = "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 }}
      className={`rounded-xl border-2 border-dashed p-6 sm:p-8 flex flex-col items-center justify-center text-center h-full transition-all duration-200 ${
        isDragOver
          ? "border-[#20638b] bg-[#eef6fa] scale-[1.01]"
          : "border-slate-200 bg-white/70 hover:bg-slate-50/50"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Dual Action Tiles */}
      <div className="flex items-center gap-4 mb-6">
        {/* Capture Image Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => onOpenCamera ? onOpenCamera() : cameraInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2.5 w-32 h-28 sm:w-36 sm:h-32 rounded-xl bg-[#20638b] text-white shadow-sm hover:bg-[#184f70] transition-colors cursor-pointer"
        >
          <Camera className="w-7 h-7" />
          <span className="text-xs font-semibold">Capture Image</span>
        </motion.button>

        {/* Upload Images Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2.5 w-32 h-28 sm:w-36 sm:h-32 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
        >
          <Upload className="w-7 h-7 text-slate-500" />
          <span className="text-xs font-semibold">Upload Images</span>
        </motion.button>
      </div>

      {/* Subtext */}
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
        Add multiple views of the same product. Include the front, back, side,
        or other views containing mandatory declarations.
      </p>
    </motion.div>
  );
}
