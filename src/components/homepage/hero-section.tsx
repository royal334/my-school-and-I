"use client";

import Link from "next/link";
import { ArrowRight, Star, Zap, BookOpen } from "lucide-react";
import { Reveal } from "./reveal";

const AVATARS = ["CA", "EO", "MN", "AK", "IB"];

export function HeroSection() {
  return (
    <section
      id="about"
      className="relative pt-24 pb-20 lg:pt-36 lg:pb-32 overflow-hidden bg-linear-to-b from-[#F0F5F3] to-white dark:from-[#0F1A17] dark:to-[#1A2822]"
    >
      {/* Dot pattern — forest green */}
      <div
        className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, #4A8C73 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Glow blob — forest */}
      <div
        className="absolute right-0 top-0 w-[600px] h-[600px] pointer-events-none opacity-70 dark:opacity-20"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, #4A8C73 0%, transparent 65%)",
        }}
      />

      <div className="relative max-w-[1440px] mx-auto px-6">
        <div className="grid lg:grid-cols-[60%_40%] gap-12 lg:gap-20 items-center">
          {/* Left */}
          <div className="space-y-7">
            <Reveal>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-[#E8F5EF] text-[#4A8C73] dark:bg-[rgba(126,200,160,0.15)] dark:text-[#7EC8A0]">
                <Zap size={14} />
                For university students
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1
                className="leading-tight tracking-tight text-[#141F1B] dark:text-[#E8F5EF]"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 60px)", letterSpacing: "-0.02em" }}
              >
                Your complete
                <br />
                <span className="text-[#4A8C73] dark:text-[#7EC8A0]">
                  academic companion
                </span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="text-lg leading-8 max-w-xl text-[#6B7B75] dark:text-[#A8C8BB]">
                Access materials, calculate CGPA, connect with vendors — all in
                one platform designed for students at Nnamdi Azikiwe
                University.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-base text-[#E8F5EF] bg-[#1A3C34] hover:bg-[#141F1B] dark:bg-[#4A8C73] dark:hover:bg-[#1A3C34] hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(26,60,52,0.25)] hover:shadow-[0_6px_20px_rgba(26,60,52,0.3)] transition-all duration-200"
                >
                  Start free <ArrowRight size={18} />
                </Link>
                <Link href="/vendor-signup">
                  <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-base border border-[#C8D8D0] dark:border-[rgba(126,200,160,0.3)] text-[#6B7B75] dark:text-[#A8C8BB] hover:bg-[#F0F5F3] dark:hover:bg-[#1E3028] hover:-translate-y-0.5 transition-all duration-200">
                    Signup as a non-student vendor <ArrowRight size={18} />
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
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white dark:border-[#1A2822] bg-[#E8F5EF] text-[#4A8C73] dark:bg-[rgba(126,200,160,0.2)] dark:text-[#7EC8A0]"
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium text-[#6B7B75] dark:text-[#A8C8BB]">
                  <strong className="text-[#141F1B] dark:text-[#E8F5EF]">
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
              className="w-72 rounded-2xl p-5 shadow-lg border border-[#D6E5DF] dark:border-[rgba(126,200,160,0.15)] bg-white dark:bg-[#1A2822]"
              style={{ animation: "float 3s ease-in-out infinite" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#E8F5EF] dark:bg-[rgba(126,200,160,0.15)]">
                  <BookOpen
                    size={20}
                    className="text-[#4A8C73] dark:text-[#7EC8A0]"
                  />
                </div>
                <div>
                  <p className="font-medium text-sm text-[#141F1B] dark:text-[#E8F5EF]">
                    ENG 301 - Fluid Mechanics
                  </p>
                  <p className="text-xs text-[#6B7B75] dark:text-[#A8C8BB]">
                    Past questions · 2023
                  </p>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-[#E1EBE6] dark:bg-[#1E3028] mb-1">
                <div className="h-1.5 rounded-full bg-[#4A8C73] dark:bg-[#7EC8A0] w-[72%]" />
              </div>
              <p className="text-xs text-[#6B7B75] dark:text-[#A8C8BB]">
                72% downloaded
              </p>
            </div>

            {/* CGPA card */}
            <div
              className="absolute -bottom-6 -left-4 w-56 rounded-2xl p-4 shadow-lg border border-[#D6E5DF] dark:border-[rgba(126,200,160,0.15)] bg-white dark:bg-[#1A2822]"
              style={{ animation: "float 3s ease-in-out infinite 0.8s" }}
            >
              <p className="text-xs font-medium mb-2 text-[#6B7B75] dark:text-[#A8C8BB]">
                CGPA calculator
              </p>
              <p className="text-3xl font-bold text-[#4A8C73] dark:text-[#7EC8A0]">
                4.52
              </p>
              <p className="text-xs mt-1 text-[#6B7B75] dark:text-[#A8C8BB]">
                First Class Honours
              </p>
            </div>

            {/* Vendor card */}
            <div
              className="absolute -top-6 -right-4 w-52 rounded-2xl p-4 shadow-lg border border-[#D6E5DF] dark:border-[rgba(126,200,160,0.15)] bg-white dark:bg-[#1A2822]"
              style={{ animation: "float 3s ease-in-out infinite 1.6s" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-[#3A2800] bg-[#E8A020]">
                  A
                </div>
                <div>
                  <p className="text-xs font-medium text-[#141F1B] dark:text-[#E8F5EF]">
                    Ade Prints
                  </p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={10} fill="#E8A020" color="#E8A020" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#4A8C73] dark:text-[#7EC8A0]">
                ✓ Verified vendor
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
