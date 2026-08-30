"use client";

import React, { useState } from "react";
import { X, Save, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DeclarationData {
  id: string;
  field: string;
  extractedValue: string;
  status: "verified" | "requires_review" | "not_detected";
  confidence: number;
}

interface EditDeclarationModalProps {
  isOpen: boolean;
  onClose: () => void;
  declaration: DeclarationData | null;
  onSave?: (updated: DeclarationData) => void;
}

export default function EditDeclarationModal({
  isOpen,
  onClose,
  declaration,
  onSave,
}: EditDeclarationModalProps) {
  const [editedValue, setEditedValue] = useState(
    declaration?.extractedValue ?? ""
  );
  const [editedStatus, setEditedStatus] = useState<DeclarationData["status"]>(
    declaration?.status ?? "verified"
  );

  // Reset local state when declaration changes
  React.useEffect(() => {
    if (declaration) {
      setEditedValue(declaration.extractedValue);
      setEditedStatus(declaration.status);
    }
  }, [declaration]);

  const handleSave = () => {
    if (declaration) {
      onSave?.({
        ...declaration,
        extractedValue: editedValue,
        status: editedStatus,
      });
    }
    onClose();
  };

  const handleReset = () => {
    if (declaration) {
      setEditedValue(declaration.extractedValue);
      setEditedStatus(declaration.status);
    }
  };

  if (!declaration) return null;

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
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{
              duration: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                  Edit Declaration
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Override the AI-extracted value for{" "}
                  <span className="font-semibold text-[#20638b]">
                    {declaration.field}
                  </span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close edit modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Field Name (read-only) */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Field
                </label>
                <div className="px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-600">
                  {declaration.field}
                </div>
              </div>

              {/* Extracted Value (editable) */}
              <div>
                <label
                  htmlFor="edit-value"
                  className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5"
                >
                  Extracted Value
                </label>
                <input
                  id="edit-value"
                  type="text"
                  value={editedValue}
                  onChange={(e) => setEditedValue(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:border-[#20638b] focus:ring-2 focus:ring-[#20638b]/10 outline-none transition-all"
                  placeholder="Enter corrected value..."
                />
              </div>

              {/* Verification Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Verification Status
                </label>
                <div className="flex gap-2">
                  {(
                    [
                      {
                        value: "verified",
                        label: "Verified",
                        color: "emerald",
                      },
                      {
                        value: "requires_review",
                        label: "Requires Review",
                        color: "amber",
                      },
                      {
                        value: "not_detected",
                        label: "Not Detected",
                        color: "red",
                      },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setEditedStatus(option.value)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        editedStatus === option.value
                          ? option.color === "emerald"
                            ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                            : option.color === "amber"
                              ? "bg-amber-50 border-amber-300 text-amber-700"
                              : "bg-red-50 border-red-300 text-red-700"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Confidence (read-only) */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 font-medium">
                  AI Confidence:
                </span>
                <span
                  className={`text-sm font-bold ${
                    declaration.confidence >= 90
                      ? "text-emerald-600"
                      : declaration.confidence >= 70
                        ? "text-amber-600"
                        : "text-red-500"
                  }`}
                >
                  {declaration.confidence}%
                </span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-[#20638b] hover:bg-[#184f70] transition-colors cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
