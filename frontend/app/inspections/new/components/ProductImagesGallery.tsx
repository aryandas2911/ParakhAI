"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { X, CameraIcon, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ProductImage {
  id: string;
  src: string;
  label: string;
  isDefault?: boolean;
}

interface ProductImagesGalleryProps {
  images: ProductImage[];
  onRemoveImage: (id: string) => void;
  onAddFiles: (files: File[]) => void;
}

export default function ProductImagesGallery({
  images,
  onRemoveImage,
  onAddFiles,
}: ProductImagesGalleryProps) {
  const addInputRef = useRef<HTMLInputElement>(null);

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) onAddFiles(files);
    e.target.value = "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-xl bg-white shadow-xs border border-slate-100/90 p-5 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <h3 className="text-base font-bold text-slate-800 tracking-tight">
            Product Images
          </h3>
          <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-md bg-[#e0f2fe] text-[11px] font-bold text-[#0369a1]">
            {images.length}
          </span>
        </div>

        <input
          ref={addInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleAddFiles}
        />
        <button
          type="button"
          onClick={() => addInputRef.current?.click()}
          className="text-xs sm:text-sm font-semibold text-[#20638b] hover:text-[#184f70] hover:underline transition-colors cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Image
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <AnimatePresence mode="popLayout">
          {images.map((img) => (
            <motion.div
              key={img.id}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25 }}
              className="relative group aspect-[4/3] rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shadow-xs hover:shadow-md transition-shadow"
            >
              <Image
                src={img.src}
                alt={img.label}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

              {/* Remove button */}
              <button
                type="button"
                onClick={() => onRemoveImage(img.id)}
                className="absolute top-2 right-2 p-1 rounded-full bg-white/90 text-slate-600 hover:text-red-600 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                aria-label={`Remove ${img.label}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Label tag */}
              <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-[10px] font-semibold text-white drop-shadow-md leading-tight">
                  {img.label}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Placeholder Tile */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => addInputRef.current?.click()}
          className="aspect-[4/3] rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-[#20638b] hover:border-[#20638b]/40 hover:bg-[#eef6fa]/50 transition-all cursor-pointer"
        >
          <CameraIcon className="w-6 h-6" />
          <span className="text-[10px] font-semibold tracking-wide">
            Add Photo
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
