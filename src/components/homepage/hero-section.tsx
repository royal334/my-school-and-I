"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Star, Zap } from "lucide-react";
import { Reveal } from "./reveal";

const AVATARS = ["CA", "EO", "MN", "AK", "IB"];

export function HeroSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden border-b border-border/60 bg-background pb-20 pt-28 lg:pb-32 lg:pt-36"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(99,102,241,0.25) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-40 -top-40 size-[620px] rounded-full opacity-50 blur-3xl dark:opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(79,70,229,0.35) 0%, transparent 68%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1440px] px-6">
        <div className="grid items-center gap-14 lg:grid-cols-[58%_42%] lg:gap-20">
          <div className="space-y-7">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700 dark:border-primary-800 dark:bg-primary-950 dark:text-primary-300">
                <Zap size={14} className="text-accent-500" />
                The digital hub for ambitious students
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="max-w-3xl text-[clamp(2.75rem,6vw,4.75rem)] leading-[1.03] text-foreground">
                Everything you need to
                <span className="block text-primary-600 dark:text-primary-300">
                  move forward.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                Materials, CGPA tools, trusted vendors, and campus updates in one
                intelligent space built for how Nigerian students actually live and
                study.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-base font-semibold text-accent-950 shadow-lg shadow-accent-500/20 transition-all hover:-translate-y-0.5 hover:bg-accent-400 hover:shadow-xl"
                >
                  Get started <ArrowRight size={18} />
                </Link>
                <Link
                  href="/vendor-signup"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-base font-semibold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:bg-muted"
                >
                  List your business as a non-student <ArrowRight size={18} />
                </Link>
                <Link
                  href="/agent/apply"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-base font-semibold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:bg-muted"
                >
                  Become an agent<ArrowRight size={18} />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2">
                  {AVATARS.map((initials) => (
                    <div
                      key={initials}
                      className="flex size-9 items-center justify-center rounded-full border-2 border-background bg-primary-100 text-xs font-bold text-primary-700 dark:border-card dark:bg-primary-900 dark:text-primary-200"
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  <strong className="font-bold text-foreground">500+</strong>{" "}
                  students already joined
                </p>
              </div>
            </Reveal>
          </div>

          <div className="relative hidden min-h-[480px] items-center justify-center lg:flex">
            <div
              className="w-72 rounded-2xl border border-border bg-card p-5 shadow-xl dark:shadow-2xl"
              style={{ animation: "float 3s ease-in-out infinite" }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950">
                  <BookOpen size={20} className="text-primary-600 dark:text-primary-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    ENG 301 · Fluid Mechanics
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Past questions · 2023
                  </p>
                </div>
              </div>
              <div className="mb-1 h-1.5 rounded-full bg-muted">
                <div className="h-1.5 w-[72%] rounded-full bg-primary-600" />
              </div>
              <p className="text-xs text-muted-foreground">72% downloaded</p>
            </div>

            <div
              className="absolute -bottom-6 -left-4 w-56 rounded-2xl border border-border bg-card p-4 shadow-xl dark:shadow-2xl"
              style={{ animation: "float 3s ease-in-out infinite 0.8s" }}
            >
              <p className="mb-2 text-xs font-semibold text-muted-foreground">
                CGPA calculator
              </p>
              <p className="text-3xl font-extrabold tracking-tight text-primary-600 dark:text-primary-300">
                4.52
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                First Class Honours
              </p>
            </div>

            <div
              className="absolute -right-4 -top-6 w-52 rounded-2xl border border-border bg-card p-4 shadow-xl dark:shadow-2xl"
              style={{ animation: "float 3s ease-in-out infinite 1.6s" }}
            >
              <div className="mb-1 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-accent-500 text-sm font-extrabold text-accent-950">
                  A
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Ade Prints
                  </p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={10}
                        fill="currentColor"
                        className="text-accent-500"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs font-medium text-success">Verified vendor</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </section>
  );
}
