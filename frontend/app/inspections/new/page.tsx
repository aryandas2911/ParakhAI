"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { createProduct, createInspection } from "@/lib/api";
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
  const { session } = useAuth();

  // Form state
  const [category, setCategory] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [location, setLocation] = useState("");

  // Image state
  const [images, setImages] = useState<ProductImage[]>(defaultImages);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Camera modal state
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Error state
  const [formError, setFormError] = useState<string | null>(null);

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

  const handleAnalyze = async () => {
    if (!session?.access_token) return;

    if (!category || !identifier.trim() || !manufacturer.trim()) {
      setFormError("Please fill in all required fields (Product Name, Category, Manufacturer).");
      return;
    }

    setFormError(null);
    setIsAnalyzing(true);

    try {
      const product = await createProduct(session.access_token, {
        product_name: identifier.trim(),
        category,
        manufacturer: manufacturer.trim(),
      });

      if (!product) {
        setFormError("Failed to create product. Please try again.");
        setIsAnalyzing(false);
        return;
      }

      const inspection = await createInspection(session.access_token, {
        product_id: product.product_id,
      });

      if (!inspection) {
        setFormError("Failed to create inspection. Please try again.");
        setIsAnalyzing(false);
        return;
      }

      router.push(`/inspections/${inspection.inspection_id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred while creating the inspection. Please try again.";
      setFormError(message);
      setIsAnalyzing(false);
    }
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

      {/* Error Banner */}
      {formError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      {/* Top Grid: Details (Left) + Capture Zone (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-5 flex flex-col">
          <InspectionDetailsCard
            category={category}
            onCategoryChange={setCategory}
            identifier={identifier}
            onIdentifierChange={setIdentifier}
            manufacturer={manufacturer}
            onManufacturerChange={setManufacturer}
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
