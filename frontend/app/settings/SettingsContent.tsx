"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchProfile, updateProfile, ProfileData } from "@/lib/api";

export default function SettingsContent() {
  const { user, session, signOut, refreshProfile } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!session?.access_token) return;

    let cancelled = false;

    fetchProfile(session.access_token)
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setProfile(data);
          setName(data.name);
        } else {
          setError("Failed to load profile.");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load profile.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updated = await updateProfile(session.access_token, { name: name.trim() });
      if (updated) {
        setProfile(updated);
        setName(updated.name);
        setSuccess(true);
        await refreshProfile();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-white shadow-xs border border-slate-100/90 p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#20638b] border-t-transparent mb-4" />
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      {/* Profile Card */}
      <div className="rounded-xl bg-white shadow-xs border border-slate-100/90 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-[#20638b] flex items-center justify-center text-white text-sm font-bold">
            {profile?.name
              ? profile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : user?.email?.slice(0, 2).toUpperCase() || "U"}
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              Profile Information
            </h3>
            <p className="text-xs text-slate-400">
              Manage your personal details
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
            Profile updated successfully.
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="settings-name"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Full Name
            </label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#20638b]/20 focus:border-[#20638b] transition-colors"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label
              htmlFor="settings-email"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Email Address
            </label>
            <input
              id="settings-email"
              type="email"
              value={profile?.email || ""}
              readOnly
              className="w-full rounded-lg border border-slate-200 bg-slate-100/60 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-slate-400">
              Email is managed through your auth provider and cannot be changed here.
            </p>
          </div>

          {/* Role (read-only) */}
          <div>
            <label
              htmlFor="settings-role"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Role
            </label>
            <input
              id="settings-role"
              type="text"
              value={profile?.role || "inspector"}
              readOnly
              className="w-full rounded-lg border border-slate-200 bg-slate-100/60 px-4 py-2.5 text-sm text-slate-500 capitalize cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-slate-400">
              Role is assigned by an administrator.
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving || name.trim() === (profile?.name || "")}
              className="inline-flex items-center gap-2 rounded-lg bg-[#20638b] px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#1a5276] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Account Actions */}
      <div className="rounded-xl bg-white shadow-xs border border-slate-100/90 p-6 sm:p-8">
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          Account Actions
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Manage your session and account access.
        </p>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/70 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
          Logout
        </button>
      </div>
    </>
  );
}
