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
    <section className="py-20 lg:py-28 bg-linear-to-br from-[#1A3C34] to-[#163229] dark:from-[#1A2822] dark:to-[#0F1A17]">
      <div className="max-w-[1440px] mx-auto px-6 text-center">
        <Reveal>
          <h2 className="text-3xl lg:text-5xl mb-4 text-white" style={{ fontFamily: "var(--font-display)" }}>
            Ready to excel in your studies?
          </h2>
          <p className="text-lg mb-10 text-[#A8D8C2] dark:text-[#7EC8A0]">
            Join hundreds of engineering students already using CampusHub.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-medium text-base bg-[#E8A020] text-[#3A2800] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            >
              Create free account <ChevronRight size={18} />
            </Link>
            <a
              href="mailto:support@campushub.com"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-medium text-base text-white border border-white/40 hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200 dark:border-white/50 dark:hover:bg-white/20"
            >
              Talk to us
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-[#A8D8C2] dark:text-[#7EC8A0]">
            {TRUST_ITEMS.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
