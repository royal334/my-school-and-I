"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Reveal } from "./reveal";

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-primary-950 py-20 lg:py-28">
      <div
        className="pointer-events-none absolute -right-20 -top-40 size-[500px] rounded-full bg-primary-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1440px] px-6 text-center">
        <Reveal>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-primary-300">
            Your next move starts here
          </p>
          <h2 className="mx-auto mb-4 max-w-3xl text-3xl text-white lg:text-5xl">
            Make your campus life work smarter.
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-primary-200">
            Join a community building better habits, better tools, and better
            ways to get things done.
          </p>
          <div className="mb-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-8 py-3.5 text-base font-bold text-accent-950 shadow-lg shadow-accent-500/20 transition-all hover:-translate-y-0.5 hover:bg-accent-400"
            >
              Create free account <ChevronRight size={18} />
            </Link>
            <a
              href="mailto:support@campusandme.com"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-8 py-3.5 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
            >
              Talk to us
            </a>
            <a
              href="tel:+2349110224171"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-8 py-3.5 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
            >
              Call +234 911 022 4171
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
