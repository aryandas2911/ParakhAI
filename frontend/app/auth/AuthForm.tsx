"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type AuthTab = "signin" | "signup";

export default function AuthForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AuthTab>("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tab indicator animation
  const tabsRef = useRef<HTMLDivElement>(null);
  const signinTabRef = useRef<HTMLButtonElement>(null);
  const signupTabRef = useRef<HTMLButtonElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const activeRef = activeTab === "signin" ? signinTabRef : signupTabRef;
    if (activeRef.current && tabsRef.current) {
      const tabRect = activeRef.current.getBoundingClientRect();
      const containerRect = tabsRef.current.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  }, [activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call and redirect to dashboard
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-4 sm:px-6 lg:px-8 h-screen overflow-hidden">
      <div className="w-full max-w-md">
        {/* Auth Card */}
        <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 border border-slate-100">
          {/* ── Header / Branding ── */}
          <div className="text-center mb-3">
            <h2 className="text-3xl font-extrabold text-[#0f2b44] tracking-tight">
              LM-CE
            </h2>
            <p className="mt-1 text-xs font-semibold tracking-[0.25em] text-slate-400 uppercase">
              Legal Metrology – Compliance Engine
            </p>
            <div className="mt-3 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          </div>

          {/* ── Tabs ── */}
          <div className="relative mb-4" ref={tabsRef}>
            <div className="flex">
              <button
                ref={signinTabRef}
                id="tab-signin"
                type="button"
                onClick={() => {
                  setActiveTab("signin");
                  setShowPassword(false);
                }}
                className={`flex-1 py-3 text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                  activeTab === "signin"
                    ? "text-[#20638b]"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Sign In
              </button>
              <button
                ref={signupTabRef}
                id="tab-create-account"
                type="button"
                onClick={() => {
                  setActiveTab("signup");
                  setShowPassword(false);
                }}
                className={`flex-1 py-3 text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                  activeTab === "signup"
                    ? "text-[#20638b]"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Create Account
              </button>
            </div>
            {/* Underline track */}
            <div className="h-[2px] bg-slate-100 rounded-full">
              <div
                className="tab-indicator absolute bottom-0 h-[2px] rounded-full bg-[#20638b]"
                style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
              />
            </div>
          </div>

          {/* ── Form Content ── */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Heading */}
            <div className="mb-1">
              <h3 className="text-xl font-bold text-slate-800">
                {activeTab === "signup"
                  ? "Create your LM-CE Account"
                  : "Sign In to LM-CE"}
              </h3>
              <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                {activeTab === "signup"
                  ? "Register to access the compliance engine and manage inspection records."
                  : "Enter your credentials to access the inspection portal."}
              </p>
            </div>

            {/* Full Name — only on signup */}
            {activeTab === "signup" && (
              <div className="animate-fade-in-up">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  required
                  className="auth-input w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none"
                />
              </div>
            )}

            {/* Email */}
            <div className={activeTab === "signup" ? "animate-fade-in-up" : ""} style={activeTab === "signup" ? { animationDelay: "0.1s" } : {}}>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                {activeTab === "signup" ? "Official Email" : "Email"}
              </label>
              <input
                id="email"
                type="email"
                placeholder="official@agency.gov"
                required
                className="auth-input w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none"
              />
            </div>

            {/* Password */}
            <div className={activeTab === "signup" ? "animate-fade-in-up" : ""} style={activeTab === "signup" ? { animationDelay: "0.2s" } : {}}>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                {activeTab === "signup" ? "Set Password" : "Password"}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    activeTab === "signup"
                      ? "Create a strong password"
                      : "Enter your password"
                  }
                  required
                  className="auth-input w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-12 text-sm text-slate-800 placeholder-slate-400 outline-none"
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    /* Eye-off icon */
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    /* Eye icon */
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password — only on signin */}
            {activeTab === "signin" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  id="forgot-password-link"
                  className="text-xs font-medium text-[#20638b] hover:text-[#184f70] transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              id={activeTab === "signup" ? "btn-create-account" : "btn-sign-in"}
              disabled={isSubmitting}
              className="relative w-full py-2 rounded-lg bg-[#20638b] hover:bg-[#184f70] active:bg-[#13445e] text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer overflow-hidden"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : activeTab === "signup" ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
              {/* Shimmer overlay */}
              {!isSubmitting && (
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              )}
            </button>
          </form>

          {/* ── Divider ── */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              Secured Platform
            </span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* ── Footer Notice ── */}
          <div className="mt-2.5 flex items-start gap-2.5 rounded-lg bg-slate-50 px-3 py-2 border border-slate-100">
            {/* Shield/Lock icon */}
            <svg
              className="h-4 w-4 mt-0.5 text-slate-400 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Authorized access only. Inspection records and evidence are
              protected by{" "}
              <span className="font-semibold text-slate-600">
                role-based access
              </span>
              .
            </p>
          </div>
        </div>

        {/* Below-card attribution */}
        <p className="mt-2 text-center text-[10px] text-slate-400">
          Ministry of Consumer Affairs, Food &amp; Public Distribution
          <br />
          Department of Consumer Affairs (DoCA) — Problem Statement 26034
        </p>
      </div>
    </div>
  );
}
