"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import { Reveal } from "./reveal";

const FREE_FEATURES = [
  { text: "Limited materials access", included: true },
  { text: "Full CGPA calculator", included: true },
  { text: "Basic vendor directory", included: true },
  { text: "Announcements", included: true },
  { text: "Premium materials", included: false },
  { text: "Unlimited file downloads", included: false },
];

const PRO_FEATURES = [
  { text: "Everything in Free", included: true },
  { text: "All premium materials", included: true },
  { text: "Unlimited downloads", included: true },
  { text: "Priority support", included: true },
  { text: "Early access to new features", included: true },
];

const VALUE_PROPS = [
  { icon: "💰", text: "One-time payment per semester" },
  { icon: "🔒", text: "Secure payment via Paystack" },
  { icon: "📱", text: "Access on all devices" },
];

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="py-20 lg:py-24"
      style={{ background: "#fff" }}
    >
      <div className="max-w-[1440px] mx-auto px-6">
        <Reveal>
          <div className="text-center mb-14">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-2"
              style={{ color: "#64748b" }}
            >
              Pricing
            </p>
            <h2
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{ color: "#0f172a" }}
            >
              Simple, Transparent Pricing
            </h2>
            <p
              className="text-lg max-w-xl mx-auto"
              style={{ color: "#475569" }}
            >
              Start free and upgrade when you need more. No surprises.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
          {/* Free tier */}
          <Reveal>
            <div
              className="rounded-2xl p-8 border h-full flex flex-col transition-all duration-200"
              style={{ background: "#fff", borderColor: "#e2e8f0" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 12px 32px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-5"
                style={{ background: "#f1f5f9", color: "#475569" }}
              >
                Free
              </span>
              <div className="mb-6">
                <span
                  className="text-5xl font-bold"
                  style={{ color: "#0f172a" }}
                >
                  ₦0
                </span>
                <span className="text-sm ml-2" style={{ color: "#64748b" }}>
                  Forever
                </span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {FREE_FEATURES.map((f) => (
                  <li
                    key={f.text}
                    className="flex items-center gap-3 text-sm"
                    style={{ color: f.included ? "#334155" : "#94a3b8" }}
                  >
                    {f.included ? (
                      <Check
                        size={15}
                        style={{ color: "#16a34a", flexShrink: 0 }}
                      />
                    ) : (
                      <X
                        size={15}
                        style={{ color: "#cbd5e1", flexShrink: 0 }}
                      />
                    )}
                    {f.text}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="block text-center py-3 rounded-lg font-semibold text-sm border transition-all duration-200"
                style={{ borderColor: "#cbd5e1", color: "#334155" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
                }}
              >
                Get Started
              </Link>
            </div>
          </Reveal>

          {/* Premium tier */}
          <Reveal delay={100}>
            <div
              className="rounded-2xl p-8 border-2 h-full flex flex-col relative transition-all duration-200"
              style={{
                background: "#eff6ff",
                borderColor: "#93c5fd",
                boxShadow: "0 0 40px rgba(37,99,235,0.12)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "0 20px 48px rgba(37,99,235,0.2)";
                el.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "0 0 40px rgba(37,99,235,0.12)";
                el.style.transform = "translateY(0)";
              }}
            >
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-5 text-white"
                style={{ background: "#2563eb" }}
              >
                Most Popular
              </span>
              <div className="mb-6">
                <span
                  className="text-5xl font-bold"
                  style={{ color: "#2563eb" }}
                >
                  ₦400
                </span>
                <span className="text-sm ml-2" style={{ color: "#64748b" }}>
                  Per semester
                </span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {PRO_FEATURES.map((f) => (
                  <li
                    key={f.text}
                    className="flex items-center gap-3 text-sm"
                    style={{ color: "#334155" }}
                  >
                    <Check
                      size={15}
                      style={{ color: "#16a34a", flexShrink: 0 }}
                    />
                    {f.text}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="block text-center py-3 rounded-lg font-semibold text-sm text-white transition-all duration-200"
                style={{
                  background: "#2563eb",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#1d4ed8";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#2563eb";
                }}
              >
                Upgrade Now →
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Value props */}
        <Reveal>
          <div
            className="flex flex-wrap justify-center gap-8 text-sm font-medium"
            style={{ color: "#475569" }}
          >
            {VALUE_PROPS.map((v) => (
              <span key={v.text} className="flex items-center gap-2">
                {v.icon} {v.text}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
