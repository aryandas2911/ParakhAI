import AppShell from "@/components/layout/AppShell";
import type { Metadata } from "next";
import { HelpCircle, BookOpen, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Help & Documentation — LM-CE | Legal Metrology Compliance Engine",
  description:
    "Guidelines, rules database reference, and help documentation for Legal Metrology Packaged Commodities enforcement.",
};

export default function HelpPage() {
  return (
    <AppShell title="Legal Metrology - Compliance Engine">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Help & Documentation
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
            Legal Metrology (Packaged Commodities) Rules, 2011 standard reference and operator guide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-xl bg-white border border-slate-100 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#eef6fa] text-[#20638b] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Rule 6: Mandatory Declarations</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every package must bear product name, net quantity, retail sale price (MRP), date of manufacture/packing, and consumer care details.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-100 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#eef6fa] text-[#20638b] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Rule 12: Font Size Standards</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Minimum height of numeral declarations: 1mm (≤50g), 2mm (50g–200g), 4mm (200g–1kg), 6mm (above 1kg).
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-100 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#eef6fa] text-[#20638b] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Inspection & Reporting</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              AI verification flags non-compliance. Inspectors can review findings, override OCR extractions, and generate digital inspection reports.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
