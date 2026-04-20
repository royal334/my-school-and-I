"use client";

import Link from "next/link";
import { ArrowRight, Play, Star, Zap, BookOpen } from "lucide-react";
import { Reveal } from "./reveal";

const AVATARS = ["CA", "EO", "MN", "AK", "IB"];

export function HeroSection() {
  return (
    <section
      id="about"
      className="relative pt-24 pb-20 lg:pt-36 lg:pb-32 overflow-hidden bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900"
    >
      {/* Dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Glow blob */}
      <div
        className="absolute right-0 top-0 w-[600px] h-[600px] pointer-events-none opacity-70 dark:opacity-20"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, #3b82f6 0%, transparent 65%)",
        }}
      />

      <div className="relative max-w-[1440px] mx-auto px-6">
        <div className="grid lg:grid-cols-[60%_40%] gap-12 lg:gap-20 items-center">
          {/* Left */}
          <div className="space-y-7">
            <Reveal>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <Zap size={14} />
                For University Students
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1
                className="font-bold leading-tight tracking-tight text-slate-900 dark:text-white"
                style={{ fontSize: "clamp(36px, 5vw, 60px)" }}
              >
                Your Complete
                <br />
                <span className="text-blue-600 dark:text-blue-400">
                  Academic Companion
                </span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="text-lg leading-8 max-w-xl text-slate-600 dark:text-slate-300">
                Access materials, calculate CGPA, connect with vendors — all in
                one platform designed for engineering students at Nnamdi Azikiwe
                University.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-base text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] transition-all duration-200"
                >
                  Start Free <ArrowRight size={18} />
                </Link>
                <Link href="/vendor-signup">
                  <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-base border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-200">
                    Signup as a Non-Student Vendor <ArrowRight size={18} />
                  </button>
                </Link>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2">
                  {AVATARS.map((initials) => (
                    <div
                      key={initials}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white dark:border-slate-900 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-900 dark:text-white">
                    500+
                  </strong>{" "}
                  students already joined
                </p>
              </div>
            </Reveal>
          </div>

          {/* Right – floating mock cards */}
          <div className="relative hidden lg:flex items-center justify-center min-h-[480px]">
            {/* Main card */}
            <div
              className="w-72 rounded-2xl p-5 shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              style={{ animation: "float 3s ease-in-out infinite" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                  <BookOpen
                    size={20}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">
                    ENG 301 - Fluid Mechanics
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Past Questions • 2023
                  </p>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 mb-1">
                <div className="h-1.5 rounded-full bg-blue-600 dark:bg-blue-500 w-[72%]" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                72% downloaded
              </p>
            </div>

            {/* CGPA card */}
            <div
              className="absolute -bottom-6 -left-4 w-56 rounded-2xl p-4 shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              style={{ animation: "float 3s ease-in-out infinite 0.8s" }}
            >
              <p className="text-xs font-semibold mb-2 text-slate-600 dark:text-slate-400">
                CGPA Calculator
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-500">
                4.52
              </p>
              <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
                First Class Honours 🎉
              </p>
            </div>

            {/* Vendor card */}
            <div
              className="absolute -top-6 -right-4 w-52 rounded-2xl p-4 shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              style={{ animation: "float 3s ease-in-out infinite 1.6s" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white bg-amber-500">
                  A
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    Ade Prints
                  </p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={10} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ✓ Verified Vendor
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </section>
  );
}
