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
    <section id="pricing" className="py-20 lg:py-24 bg-background">
      <div className="max-w-[1440px] mx-auto px-6">
        <Reveal>
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-2 text-muted-foreground">
              Pricing
            </p>
            <h2 className="text-3xl lg:text-4xl mb-4 text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              Simple, transparent pricing
            </h2>
            <p className="text-lg max-w-xl mx-auto text-muted-foreground">
              Start free and upgrade when you need more. No surprises.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
          {/* Free tier */}
          <Reveal>
            <div className="rounded-2xl p-8 border border-border bg-card h-full flex flex-col hover:shadow-xl transition-all duration-200 dark:border-border dark:bg-card">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-5 bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground">
                Free
              </span>
              <div className="mb-6">
                <span className="text-5xl font-bold text-foreground">₦0</span>
                <span className="text-sm ml-2 text-muted-foreground">Forever</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {FREE_FEATURES.map((f) => (
                  <li
                    key={f.text}
                    className={`flex items-center gap-3 text-sm ${f.included ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {f.included ? (
                      <Check size={15} className="text-success shrink-0" />
                    ) : (
                      <X size={15} className="text-muted-foreground shrink-0" />
                    )}
                    {f.text}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center py-3 rounded-lg font-semibold text-sm border border-border text-foreground hover:bg-muted transition-all duration-200 dark:border-border dark:hover:bg-muted"
              >
                Get Started
              </Link>
            </div>
          </Reveal>

          {/* Premium tier */}
          <Reveal delay={100}>
            <div className="rounded-2xl p-8 border-2 border-accent-500 bg-accent-50 h-full flex flex-col relative shadow-accent-500/10 hover:shadow-accent-500/20 hover:-translate-y-1 transition-all duration-200">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-5 text-accent-950 bg-accent-500">
                Most Popular
              </span>
              <div className="mb-6">
                <span className="text-5xl font-bold text-primary-900">₦1000</span>
                <span className="text-sm ml-2 text-muted-foreground">
                  Per semester
                </span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {PRO_FEATURES.map((f) => (
                  <li
                    key={f.text}
                    className="flex items-center gap-3 text-sm text-foreground"
                  >
                    <Check size={15} className="text-success shrink-0" />
                    {f.text}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center py-3 rounded-lg font-semibold text-sm text-accent-950 bg-accent-500 hover:bg-accent-600 shadow-accent-500/30 transition-all duration-200"
              >
                Upgrade now →
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Value props */}
        <Reveal>
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-muted-foreground">
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
