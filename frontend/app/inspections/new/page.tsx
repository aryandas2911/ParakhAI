"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import InspectionDetailsCard from "./components/InspectionDetailsCard";
import ImageCaptureZone from "./components/ImageCaptureZone";
import ProductImagesGallery, {
  type ProductImage,
} from "./components/ProductImagesGallery";
import InspectionFooterBar from "./components/InspectionFooterBar";
import CameraCaptureModal from "./components/CameraCaptureModal";

// Default sample product images
const defaultImages: ProductImage[] = [
  {
    id: "default-1",
    src: "/images/sample/back_declarations.jpg",
    label: "Back Declarations",
    isDefault: true,
  },
  {
    id: "default-2",
    src: "/images/sample/front_package.jpg",
    label: "Front Package",
    isDefault: true,
  },
  {
    id: "default-3",
    src: "/images/sample/barcode_mrp.jpg",
    label: "Barcode & MRP",
    isDefault: true,
  },
];

export default function NewInspectionPage() {
  const router = useRouter();

  // Form state
  const [category, setCategory] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [location, setLocation] = useState("");

  // Image state
  const [images, setImages] = useState<ProductImage[]>(defaultImages);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Camera modal state
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleAddFiles = useCallback((files: File[]) => {
    const newImages: ProductImage[] = files.map((file, i) => ({
      id: `upload-${Date.now()}-${i}`,
      src: URL.createObjectURL(file),
      label: file.name.replace(/\.[^.]+$/, ""),
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => {
      const removed = prev.find((img) => img.id === id);
      if (removed && !removed.isDefault && removed.src.startsWith("blob:")) {
        URL.revokeObjectURL(removed.src);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate analysis processing, then navigate to compliance analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      router.push("/inspections/LM-2026-00042");
    }, 2500);
  };

  // Camera modal handlers
  const handleOpenCamera = useCallback(() => {
    setIsCameraOpen(true);
  }, []);

  const handleCameraCaptured = useCallback((file: File) => {
    const newImage: ProductImage = {
      id: `captured-${Date.now()}`,
      src: URL.createObjectURL(file),
      label: "Captured Label",
    };
    setImages((prev) => [...prev, newImage]);
  }, []);

  return (
    <AppShell title="Legal Metrology - Compliance Engine">
      {/* Header Area */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Start a New Inspection
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
          Capture clear images of the product and its mandatory declarations for
          verification.
        </p>
      </div>

      {/* Top Grid: Details (Left) + Capture Zone (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-5 flex flex-col">
          <InspectionDetailsCard
            category={category}
            onCategoryChange={setCategory}
            identifier={identifier}
            onIdentifierChange={setIdentifier}
            location={location}
            onLocationChange={setLocation}
          />
        </div>
        <div className="lg:col-span-7 flex flex-col">
          <ImageCaptureZone
            onFilesAdded={handleAddFiles}
            onOpenCamera={handleOpenCamera}
          />
        </div>
      </div>

      {/* Product Images Gallery */}
      <ProductImagesGallery
        images={images}
        onRemoveImage={handleRemoveImage}
        onAddFiles={handleAddFiles}
      />

      {/* Footer Actions */}
      <InspectionFooterBar
        isAnalyzing={isAnalyzing}
        onAnalyze={handleAnalyze}
        hasImages={images.length > 0}
      />

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onImageCaptured={handleCameraCaptured}
      />
    </AppShell>
  );
}
