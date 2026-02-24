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
    <section
      className="py-20 lg:py-28"
      style={{
        background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-6 text-center">
        <Reveal>
          <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-white">
            Ready to Excel in Your Studies?
          </h2>
          <p className="text-lg mb-10" style={{ color: "#bfdbfe" }}>
            Join hundreds of engineering students already using EngiPortal.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-base transition-all duration-200"
              style={{ background: "#fff", color: "#2563eb" }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(-2px)";
                el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              Create Free Account <ChevronRight size={18} />
            </Link>
            <a
              href="mailto:support@engiportal.com"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-base text-white transition-all duration-200"
              style={{ border: "1.5px solid rgba(255,255,255,0.4)" }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(255,255,255,0.1)";
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "transparent";
                el.style.transform = "translateY(0)";
              }}
            >
              Talk to Us
            </a>
          </div>
          <div
            className="flex flex-wrap justify-center gap-6 text-sm font-medium"
            style={{ color: "#bfdbfe" }}
          >
            {TRUST_ITEMS.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
