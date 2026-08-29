"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";


interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

// navItems defined below...


const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Inspections",
    href: "/inspections",
    icon: ClipboardCheck,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    label: "Help",
    href: "/help",
    icon: HelpCircle,
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push("/auth");
  };


  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-100 select-none">
      {/* Header Logo */}
      <div className="p-6 pb-5 flex items-center justify-between border-b border-slate-50">
        <div>
          <Link href="/dashboard" className="group block">
            <h1 className="text-2xl font-black tracking-tight text-[#20638b] group-hover:opacity-95 transition-opacity">
              LM-CE
            </h1>
            <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mt-0.5">
              Compliance Engine
            </p>
          </Link>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href)) ||
            (item.href === "/dashboard" && pathname === "/");

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => onClose && onClose()}
              className={`group relative flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#eef6fa] text-[#20638b] font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#20638b] rounded-r-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive
                    ? "text-[#20638b]"
                    : "text-slate-400 group-hover:text-slate-600"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Logout Button */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          id="btn-sidebar-logout"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50/70 transition-all duration-200 cursor-pointer group"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50"
          >
            {content}
          </motion.div>
        </div>
      )}
    </>
  );
}
