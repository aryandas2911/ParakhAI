import AppShell from "@/components/layout/AppShell";
import SettingsContent from "./SettingsContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — LM-CE | Legal Metrology Compliance Engine",
  description:
    "Manage application settings, user preferences, and compliance rule configurations.",
};

export default function SettingsPage() {
  return (
    <AppShell title="Legal Metrology - Compliance Engine">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Settings
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
          Manage your account, preferences, and system configuration.
        </p>
      </div>

      <SettingsContent />
    </AppShell>
  );
}
