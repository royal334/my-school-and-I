"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Reveal } from "./reveal";

const TRUST_ITEMS = [
  "✓ Free to start",
  "✓ No credit card needed",
  "✓ Cancel anytime",
];

export function CTASection() {
  return (
    <section className="py-20 lg:py-28 bg-linear-to-br from-blue-600 to-blue-700 dark:from-slate-800 dark:to-slate-900">
      <div className="max-w-[1440px] mx-auto px-6 text-center">
        <Reveal>
                      <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-white dark:text-white">            Ready to Excel in Your Studies?
          </h2>
          <p className="text-lg mb-10 text-blue-200 dark:text-blue-100">
            Join hundreds of engineering students already using UniHu.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-base bg-white text-blue-600 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 dark:text-blue-600"
            >
              Create Free Account <ChevronRight size={18} />
            </Link>
            <a
              href="mailto:support@engiportal.com"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-base text-white border border-white/40 hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200 dark:text-white dark:border-white/50 dark:hover:bg-white/20"
            >
              Talk to Us
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-blue-200 dark:text-blue-100">
            {TRUST_ITEMS.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
