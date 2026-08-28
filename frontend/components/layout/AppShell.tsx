"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppShell({
  children,
  title = "Legal Metrology - Compliance Engine",
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[#f8fafc]">
      {/* Universal Sidebar */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Layout Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Universal Top Header */}
        <TopHeader
          title={title}
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
