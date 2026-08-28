"use client";

import React, { useEffect, useState } from "react";

// ─── Animated OCR Bounding Box ───
function OcrBoundingBox({
  label,
  value,
  top,
  left,
  width,
  delay,
  color,
}: {
  label: string;
  value: string;
  top: string;
  left: string;
  width: string;
  delay: string;
  color: string;
}) {
  return (
    <div
      className="absolute animate-box-pulse"
      style={{ top, left, width, animationDelay: delay }}
    >
      <div
        className="rounded border-2 px-2 py-1 backdrop-blur-sm"
        style={{ borderColor: color, backgroundColor: `${color}15` }}
      >
        <span
          className="block text-[9px] font-bold uppercase tracking-wider"
          style={{ color }}
        >
          {label}
        </span>
        <span className="block text-xs font-semibold text-white/90">
          {value}
        </span>
      </div>
    </div>
  );
}

// ─── Animated Compliance Check Item ───
function ComplianceCheckItem({
  text,
  status,
  delay,
}: {
  text: string;
  status: "pass" | "fail" | "warn";
  delay: string;
}) {
  const statusConfig = {
    pass: {
      icon: (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
      color: "text-emerald-400",
      bg: "bg-emerald-400/15",
    },
    fail: {
      icon: (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      color: "text-red-400",
      bg: "bg-red-400/15",
    },
    warn: {
      icon: (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3l9.5 16.5H2.5L12 3z" />
        </svg>
      ),
      color: "text-amber-400",
      bg: "bg-amber-400/15",
    },
  };

  const cfg = statusConfig[status];

  return (
    <div
      className="flex items-center gap-2 opacity-0 animate-fade-in-up"
      style={{ animationDelay: delay }}
    >
      <span className={`flex items-center justify-center h-5 w-5 rounded-full ${cfg.bg} ${cfg.color}`}>
        {cfg.icon}
      </span>
      <span className="text-xs text-slate-300">{text}</span>
    </div>
  );
}

// ─── Floating Particle ───
function FloatingParticle({ size, x, y, duration, delay }: { size: number; x: string; y: string; duration: string; delay: string }) {
  return (
    <div
      className="absolute rounded-full bg-sky-400/20 animate-float-up"
      style={{
        width: size,
        height: size,
        left: x,
        bottom: y,
        animationDuration: duration,
        animationDelay: delay,
      }}
    />
  );
}

// ─── Hero Section Component ───
export default function HeroShowcase() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Scan", "Extract", "Validate", "Report"];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#0c1a2e] p-5 xl:p-8">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Floating particles */}
      <FloatingParticle size={4} x="10%" y="20%" duration="7s" delay="0s" />
      <FloatingParticle size={6} x="30%" y="10%" duration="9s" delay="1s" />
      <FloatingParticle size={3} x="55%" y="30%" duration="6s" delay="2s" />
      <FloatingParticle size={5} x="75%" y="15%" duration="8s" delay="0.5s" />
      <FloatingParticle size={4} x="85%" y="40%" duration="7s" delay="3s" />
      <FloatingParticle size={3} x="20%" y="50%" duration="10s" delay="1.5s" />

      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-sky-500/5 blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4 max-w-lg">
        {/* Logo Mark */}
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-sm font-semibold tracking-widest uppercase">
            LM-CE Platform
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-center text-xl xl:text-2xl font-bold leading-tight tracking-tight text-white">
          AI-Powered Legal Metrology
          <br />
          <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
            Compliance Verification System
          </span>
        </h1>

        {/* ── Animated Product Label Scan Demo ── */}
        <div className="relative w-full max-w-md">
          {/* Product label mockup */}
          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 animate-glow-pulse overflow-hidden">
            {/* Simulated label header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="h-2.5 w-28 rounded bg-white/20 mb-2" />
                <div className="h-2 w-20 rounded bg-white/10" />
              </div>
              <div className="px-2 py-0.5 rounded-full bg-sky-400/20 border border-sky-400/30">
                <span className="text-[10px] font-bold text-sky-300 tracking-wider">SCANNING</span>
              </div>
            </div>

            {/* Simulated label body lines */}
            <div className="space-y-2 mb-2">
              <div className="h-1.5 w-full rounded bg-white/8" />
              <div className="h-1.5 w-3/4 rounded bg-white/8" />
              <div className="h-1.5 w-5/6 rounded bg-white/8" />
              <div className="h-1.5 w-2/3 rounded bg-white/8" />
              <div className="h-1.5 w-full rounded bg-white/8" />
            </div>

            {/* Scanning line */}
            <div className="absolute left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-scan-line shadow-[0_0_15px_rgba(56,189,248,0.5)]" />

            {/* OCR Bounding Boxes */}
            <OcrBoundingBox label="MRP" value="₹ 299.00" top="22%" left="60%" width="35%" delay="0s" color="#38bdf8" />
            <OcrBoundingBox label="Net Weight" value="500g" top="42%" left="5%" width="30%" delay="0.8s" color="#2dd4bf" />
            <OcrBoundingBox label="Mfg Date" value="Jul 2026" top="62%" left="50%" width="40%" delay="1.6s" color="#a78bfa" />
            <OcrBoundingBox label="Manufacturer" value="ABC Foods Pvt. Ltd" top="78%" left="5%" width="55%" delay="2.4s" color="#fb923c" />
          </div>
        </div>

        {/* ── Pipeline Steps ── */}
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between gap-1 px-2">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center gap-1">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-500 ${i <= activeStep
                        ? "bg-gradient-to-br from-sky-400 to-teal-400 text-white shadow-lg shadow-sky-500/30 scale-110"
                        : "bg-white/10 text-white/40"
                      }`}
                  >
                    {i < activeStep ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-semibold tracking-wide transition-colors duration-300 ${i <= activeStep ? "text-sky-300" : "text-white/30"
                      }`}
                  >
                    {step}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 mx-1 mb-3">
                    <div className="h-[2px] w-10 xl:w-14 rounded bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded bg-gradient-to-r from-sky-400 to-teal-400 transition-all duration-700"
                        style={{ width: i < activeStep ? "100%" : "0%" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Compliance Check Results ── */}
        <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-3">
          <div className="flex items-center gap-2 mb-2">
            <svg className="h-4 w-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-semibold text-white/70 tracking-wide uppercase">
              Rule Engine Results
            </span>
          </div>
          <div className="space-y-1.5 stagger-children">
            <ComplianceCheckItem text="MRP Declaration — Present & Valid" status="pass" delay="0.2s" />
            <ComplianceCheckItem text="Net Quantity — Format Verified" status="pass" delay="0.4s" />
            <ComplianceCheckItem text="Manufacturing Date — Present" status="pass" delay="0.6s" />
            <ComplianceCheckItem text="Font Size — Below Minimum (2.1mm)" status="warn" delay="0.8s" />
            <ComplianceCheckItem text="Consumer Care — Missing" status="fail" delay="1.0s" />
          </div>
        </div>

        {/* ── Feature Highlight Cards ── */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-md">
          {[
            {
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
              ),
              title: "Smart Scan",
              desc: "OCR & Vision AI",
            },
            {
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              ),
              title: "Rule Engine",
              desc: "LM Rules 2011",
            },
            {
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              ),
              title: "Reports",
              desc: "PDF & Evidence",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-2.5 transition-all duration-300 hover:bg-white/10 hover:border-sky-400/30 cursor-default"
            >
              <div className="text-sky-400 group-hover:text-teal-300 transition-colors duration-300">
                {feature.icon}
              </div>
              <span className="text-[11px] font-semibold text-white/80">{feature.title}</span>
              <span className="text-[10px] text-slate-500">{feature.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a1628] to-transparent" />
    </div>
  );
}
