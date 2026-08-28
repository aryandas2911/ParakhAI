"use client";

import React from "react";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";

const productCategories = [
  "Food & Beverages",
  "Edible Oils",
  "Cosmetics & Personal Care",
  "Packaged Commodities",
  "Detergents & Cleaning",
  "Electronics & Hardware",
  "Agricultural Produce",
];

interface InspectionDetailsCardProps {
  category: string;
  onCategoryChange: (val: string) => void;
  identifier: string;
  onIdentifierChange: (val: string) => void;
  location: string;
  onLocationChange: (val: string) => void;
}

export default function InspectionDetailsCard({
  category,
  onCategoryChange,
  identifier,
  onIdentifierChange,
  location,
  onLocationChange,
}: InspectionDetailsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-xl bg-white shadow-xs border border-slate-100/90 p-6 h-full"
    >
      <h3 className="text-base font-bold text-slate-800 tracking-tight mb-5">
        Inspection Details
      </h3>

      <div className="space-y-5">
        {/* Product Category */}
        <div>
          <label
            htmlFor="product-category"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Product Category <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="product-category"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="auth-input w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none appearance-none cursor-pointer pr-10"
            >
              <option value="">Select Category...</option>
              {productCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Product Identifier */}
        <div>
          <label
            htmlFor="product-identifier"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Product Identifier{" "}
            <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            id="product-identifier"
            type="text"
            value={identifier}
            onChange={(e) => onIdentifierChange(e.target.value)}
            placeholder="e.g., EAN, UPC, Batch No."
            className="auth-input w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none"
          />
        </div>

        {/* Inspection Location */}
        <div>
          <label
            htmlFor="inspection-location"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Inspection Location{" "}
            <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="inspection-location"
              type="text"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="Current Location"
              className="auth-input w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
