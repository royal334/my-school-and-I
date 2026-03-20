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
    <section id="pricing" className="py-20 lg:py-24 bg-white dark:bg-slate-950">
      <div className="max-w-[1440px] mx-auto px-6">
        <Reveal>
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">
              Pricing
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg max-w-xl mx-auto text-slate-600 dark:text-slate-300">
              Start free and upgrade when you need more. No surprises.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
          {/* Free tier */}
          <Reveal>
            <div className="rounded-2xl p-8 border border-slate-200 bg-white h-full flex flex-col hover:shadow-xl transition-all duration-200 dark:border-slate-800 dark:bg-slate-900">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Free
              </span>
              <div className="mb-6">
                <span className="text-5xl font-bold text-slate-900 dark:text-white">₦0</span>
                <span className="text-sm ml-2 text-slate-500 dark:text-slate-400">Forever</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {FREE_FEATURES.map((f) => (
                  <li
                    key={f.text}
                    className={`flex items-center gap-3 text-sm ${f.included ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"}`}
                  >
                    {f.included ? (
                      <Check size={15} className="text-green-600 shrink-0" />
                    ) : (
                      <X size={15} className="text-slate-300 shrink-0" />
                    )}
                    {f.text}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center py-3 rounded-lg font-semibold text-sm border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all duration-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Get Started
              </Link>
            </div>
          </Reveal>

          {/* Premium tier */}
          <Reveal delay={100}>
            <div className="rounded-2xl p-8 border-2 border-blue-300 bg-blue-50 h-full flex flex-col relative shadow-[0_0_40px_rgba(37,99,235,0.12)] hover:shadow-[0_20px_48px_rgba(37,99,235,0.2)] hover:-translate-y-1 transition-all duration-200 dark:border-blue-700 dark:bg-blue-900/20 dark:shadow-[0_0_40px_rgba(37,99,235,0.2)] dark:hover:shadow-[0_20px_48px_rgba(37,99,235,0.3)]">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-5 text-white bg-blue-600 dark:bg-blue-700">
                Most Popular
              </span>
              <div className="mb-6">
                <span className="text-5xl font-bold text-blue-600 dark:text-blue-500">₦1000</span>
                <span className="text-sm ml-2 text-slate-500 dark:text-slate-400">
                  Per semester
                </span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {PRO_FEATURES.map((f) => (
                  <li
                    key={f.text}
                    className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200"
                  >
                    <Check size={15} className="text-green-600 shrink-0" />
                    {f.text}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center py-3 rounded-lg font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition-all duration-200 dark:bg-blue-700 dark:hover:bg-blue-600 dark:shadow-[0_4px_14px_rgba(37,99,235,0.4)]"
              >
                Upgrade Now →
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Value props */}
        <Reveal>
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
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
