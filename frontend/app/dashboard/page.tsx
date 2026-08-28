import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import ActionHeroCard from "./components/ActionHeroCard";
import MetricCards from "./components/MetricCards";
import RecentInspectionsTable from "./components/RecentInspectionsTable";
import CommonFindingsCard from "./components/CommonFindingsCard";

export const metadata: Metadata = {
  title: "Dashboard — LM-CE | Legal Metrology Compliance Engine",
  description:
    "Overview of Legal Metrology compliance inspections, daily statistics, recent inspection records, and common compliance findings.",
};

export default function DashboardPage() {
  return (
    <AppShell title="Legal Metrology - Compliance Engine">
      {/* 1. Action Hero Card */}
      <ActionHeroCard />

      {/* 2. Key Metric Summary Cards (4-Grid) */}
      <MetricCards />

      {/* 3. Bottom Split Section: Recent Inspections (2/3) + Common Findings (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-9 flex flex-col">
          <RecentInspectionsTable />
        </div>
        <div className="lg:col-span-3 flex flex-col">
          <CommonFindingsCard />
        </div>
      </div>
    </AppShell>
  );
}
