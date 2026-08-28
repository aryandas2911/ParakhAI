"use client";

import React from "react";
import Image from "next/image";
import { Package, Tag, Scale, IndianRupee, Layers } from "lucide-react";
import { motion } from "framer-motion";

interface ProductDetailsCardProps {
  name?: string;
  brand?: string;
  category?: string;
  thumbnailSrc?: string;
  productId?: string;
  netQuantity?: string;
  mrp?: string;
}

export default function ProductDetailsCard({
  name = "Premium Basmati Rice",
  brand = "Aarav Foods Pvt. Ltd.",
  category = "Packaged Food",
  thumbnailSrc = "/images/sample/front_package.jpg",
  productId = "PRD-99201",
  netQuantity = "5 kg",
  mrp = "₹260",
}: ProductDetailsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-xl bg-white shadow-xs border border-slate-100/90 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[#20638b]" />
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Product Details
          </h3>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#eef6fa] text-[#20638b] border border-[#20638b]/20">
          {category}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Product Media & Title block */}
        <div className="flex items-start gap-4">
          <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
            <Image
              src={thumbnailSrc}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 80px, 96px"
              priority
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-base font-bold text-slate-800 leading-snug">
              {name}
            </h4>
            <p className="text-xs font-medium text-slate-500 mt-1">
              {brand}
            </p>
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
              <Tag className="w-3 h-3 text-slate-400" />
              <span>ID: {productId}</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Scale className="w-3.5 h-3.5 text-[#20638b]" />
              <span>Net Quantity</span>
            </div>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {netQuantity}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <IndianRupee className="w-3.5 h-3.5 text-[#20638b]" />
              <span>Declared MRP</span>
            </div>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {mrp}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
