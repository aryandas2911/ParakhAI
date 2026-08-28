"use client";

import React, { useState, useEffect } from "react";
import { Bell, HelpCircle, Menu, CheckCircle2, Server, ServerOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { checkBackendHealth, HealthStatusResponse } from "@/lib/api";

interface TopHeaderProps {
  onMenuClick?: () => void;
  title?: string;
}

export default function TopHeader({
  onMenuClick,
  title = "Legal Metrology - Compliance Engine",
}: TopHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [apiStatus, setApiStatus] = useState<"checking" | "connected" | "offline">("checking");
  const [apiInfo, setApiInfo] = useState<HealthStatusResponse | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      const data = await checkBackendHealth();
      if (isMounted) {
        if (data && data.status === "ok") {
          setApiStatus("connected");
          setApiInfo(data);
        } else {
          setApiStatus("offline");
          setApiInfo(null);
        }
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-6 lg:px-8 shadow-xs">
      {/* Left Title & Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 tracking-tight">
          {title}
        </h2>
      </div>

      {/* Right Utilities Section */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Backend API Connection Status Badge */}
        <div
          id="api-status-badge"
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            apiStatus === "connected"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : apiStatus === "checking"
              ? "bg-slate-50 text-slate-600 border-slate-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
          title={
            apiInfo
              ? `${apiInfo.service} v${apiInfo.version}`
              : "FastAPI Backend connection status"
          }
        >
          <span
            className={`w-2 h-2 rounded-full ${
              apiStatus === "connected"
                ? "bg-emerald-500 animate-pulse"
                : apiStatus === "checking"
                ? "bg-slate-400 animate-pulse"
                : "bg-amber-500"
            }`}
          />
          <span className="text-[11px] font-semibold select-none">
            {apiStatus === "connected"
              ? "Backend API Connected"
              : apiStatus === "checking"
              ? "Checking API..."
              : "Backend Offline"}
          </span>
        </div>
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            id="btn-notifications"
            className="relative p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {/* Notification Badge with #FFCC70 gold accent */}
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFCC70] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#20638b] border border-[#FFCC70]" />
            </span>
          </button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 rounded-xl bg-white p-4 shadow-xl border border-slate-100 z-50"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-800">
                    Notifications
                  </h4>
                  <span className="text-[11px] font-semibold text-[#20638b] bg-[#e0f2fe] px-2 py-0.5 rounded-full">
                    2 New
                  </span>
                </div>
                <div className="py-2 space-y-2.5">
                  <div className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/70 transition-colors text-left text-xs cursor-pointer">
                    <p className="font-medium text-slate-800">
                      Non-compliance detected in INSP-8820
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      MRP declaration font size violation — 10 mins ago
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/70 transition-colors text-left text-xs cursor-pointer">
                    <p className="font-medium text-slate-800">
                      Inspection INSP-8819 requires manual review
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Net quantity ambiguous — 35 mins ago
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-[#20638b] hover:underline font-medium cursor-pointer"
                  >
                    Mark all as read
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Help Icon */}
        <div className="relative">
          <button
            onClick={() => setShowHelpModal(!showHelpModal)}
            id="btn-help"
            className="p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            aria-label="Help & Documentation"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showHelpModal && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-72 rounded-xl bg-white p-4 shadow-xl border border-slate-100 z-50 text-left"
              >
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <HelpCircle className="w-4 h-4 text-[#20638b]" />
                  <h4 className="text-sm font-semibold text-slate-800">
                    Compliance Engine Help
                  </h4>
                </div>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  Automated Legal Metrology inspection based on the Packaged
                  Commodities Rules, 2011.
                </p>
                <div className="mt-3 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Problem Statement ID: 26034
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2">
          <div className="relative group cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-[#20638b] flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-100 shadow-xs overflow-hidden">
              <span className="select-none">JS</span>
            </div>
            {/* Online indicator */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-tight">
              Officer J. Smith
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Lead Inspector
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
