"use client";

import React, { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { createProduct, createInspection, uploadInspectionImage } from "@/lib/api";
import InspectionDetailsCard from "./components/InspectionDetailsCard";
import ImageCaptureZone from "./components/ImageCaptureZone";
import ProductImagesGallery, {
  type ProductImage,
} from "./components/ProductImagesGallery";
import InspectionFooterBar from "./components/InspectionFooterBar";
import CameraCaptureModal from "./components/CameraCaptureModal";

export default function NewInspectionPage() {
  const router = useRouter();
  const { session } = useAuth();

  // Form state
  const [category, setCategory] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [location, setLocation] = useState("");

  // Image state — store File objects alongside display data for upload
  const [images, setImages] = useState<ProductImage[]>([]);
  const imageFilesRef = useRef<Map<string, File>>(new Map());

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Camera modal state
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Error state
  const [formError, setFormError] = useState<string | null>(null);

  const handleAddFiles = useCallback((files: File[]) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    const validFiles = files.filter((f) => allowedTypes.includes(f.type));
    const newImages: ProductImage[] = validFiles.map((file, i) => {
      const id = `upload-${Date.now()}-${i}`;
      imageFilesRef.current.set(id, file);
      return {
        id,
        src: URL.createObjectURL(file),
        label: file.name.replace(/\.[^.]+$/, ""),
      };
    });
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    imageFilesRef.current.delete(id);
    setImages((prev) => {
      const removed = prev.find((img) => img.id === id);
      if (removed && removed.src.startsWith("blob:")) {
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

      // Upload non-default images to Supabase Storage
      const filesToUpload = images.filter(
        (img) => !img.isDefault && imageFilesRef.current.has(img.id)
      );

      if (filesToUpload.length > 0) {
        setUploadProgress(`Uploading ${filesToUpload.length} image(s)...`);
        for (const img of filesToUpload) {
          const file = imageFilesRef.current.get(img.id);
          if (!file) continue;
          try {
            await uploadInspectionImage(
              session.access_token,
              inspection.inspection_id,
              file
            );
          } catch (err) {
            console.error(`Failed to upload image ${img.label}:`, err);
          }
        }
        setUploadProgress(null);
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
    const id = `captured-${Date.now()}`;
    imageFilesRef.current.set(id, file);
    const newImage: ProductImage = {
      id,
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

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
          {uploadProgress}
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
