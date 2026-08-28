import type { Metadata } from "next";
import HeroShowcase from "./HeroShowcase";
import AuthForm from "./AuthForm";

export const metadata: Metadata = {
  title: "Sign In — LM-CE | Legal Metrology Compliance Engine",
  description:
    "Sign in or create an account to access the AI-Powered Legal Metrology Compliance Verification System. Inspect packaged commodities, validate declarations, and generate compliance reports.",
};

export default function AuthPage() {
  return (
    <main className="h-screen overflow-hidden grid grid-cols-1 lg:grid-cols-2">
      {/* Left: Hero Showcase — hidden on mobile, shown on lg+ */}
      <HeroShowcase />

      {/* Right: Auth Form */}
      <AuthForm />
    </main>
  );
}
