"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import ReportHeader from "./components/ReportHeader";
import ProductDetailsCard from "./components/ProductDetailsCard";
import InspectionDetailsCard from "./components/InspectionDetailsCard";
import DeclarationVerificationTable from "./components/DeclarationVerificationTable";
import ComplianceFindingsGrid from "./components/ComplianceFindingsGrid";
import SupportingEvidencePanel from "./components/SupportingEvidencePanel";
import InspectionSummaryPanel from "./components/InspectionSummaryPanel";
import ReportFooterBar from "./components/ReportFooterBar";

export default function ComplianceInspectionReportPage() {
  return (
    <AppShell title="Legal Metrology - Compliance Engine">
      <div className="space-y-6 pb-6">
        {/* Header Bar & Amber Warning Callout */}
        <ReportHeader
          reportId="RPT-LM-CE-2026-0042"
          inspectionId="LM-CE-2026-0042"
          generatedDate="27 Aug 2026"
          violationCount={3}
        />

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Product Details + Inspection Metadata */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            <ProductDetailsCard
              name="Premium Basmati Rice"
              brand="Aarav Foods Pvt. Ltd."
              category="Packaged Food"
              thumbnailSrc="/images/sample/front_package.jpg"
              productId="PRD-99201"
              netQuantity="5 kg"
              mrp="₹260"
            />
            <InspectionDetailsCard
              inspectionId="LM-CE-2026-0042"
              inspectionDate="27 Aug 2026"
              inspectorName="Officer J. Smith"
              imageCount={3}
              status="Non-Compliant"
              reportStatus="Generated"
            />
          </div>

          {/* Right Column: Declarations + Findings + Evidence + Result Summary */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            <DeclarationVerificationTable />
            <ComplianceFindingsGrid />
            <SupportingEvidencePanel
              evidenceNumber="Evidence 01"
              imageSrc="/images/sample/back_declarations.jpg"
              description="Back label — declaration region"
              timestamp="27 Aug 2026, 14:15 IST"
              captureDevice="Metrology HD Scanner v2.4"
            />
            <InspectionSummaryPanel
              status="NON-COMPLIANT"
              violationsDetected={3}
            />
          </div>
        </div>

        {/* Sticky Action Footer Bar */}
        <ReportFooterBar reportId="RPT-LM-CE-2026-0042" />
      </div>
    </AppShell>
  );
}
