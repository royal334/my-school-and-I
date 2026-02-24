"use client";

import Link from "next/link";
import { ArrowRight, Play, Star, Zap, BookOpen } from "lucide-react";
import { Reveal } from "./reveal";

const AVATARS = ["CA", "EO", "MN", "AK", "IB"];

export function HeroSection() {
  return (
    <section
      id="about"
      className="relative pt-24 pb-20 lg:pt-36 lg:pb-32 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #f8fafc 0%, #ffffff 60%)" }}
    >
      {/* Dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #bfdbfe 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.35,
        }}
      />
      {/* Glow blob */}
      <div
        className="absolute right-0 top-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, #dbeafe 0%, transparent 65%)",
        }}
      />

      <div className="relative max-w-[1440px] mx-auto px-6">
        <div className="grid lg:grid-cols-[60%_40%] gap-12 lg:gap-20 items-center">
          {/* Left */}
          <div className="space-y-7">
            <Reveal>
              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                style={{ background: "#dbeafe", color: "#1d4ed8" }}
              >
                <Zap size={14} />
                For Engineering Students
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1
                className="font-bold leading-tight tracking-tight"
                style={{ color: "#0f172a", fontSize: "clamp(36px, 5vw, 60px)" }}
              >
                Your Complete
                <br />
                <span style={{ color: "#2563eb" }}>Academic Companion</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p
                className="text-lg leading-8 max-w-xl"
                style={{ color: "#475569" }}
              >
                Access materials, calculate CGPA, connect with vendors — all in
                one platform designed for engineering students at Nnamdi Azikiwe
                University.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200"
                  style={{
                    background: "#2563eb",
                    boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
                    fontSize: 16,
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "#1d4ed8";
                    el.style.transform = "translateY(-2px)";
                    el.style.boxShadow = "0 6px 20px rgba(37,99,235,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "#2563eb";
                    el.style.transform = "translateY(0)";
                    el.style.boxShadow = "0 4px 14px rgba(37,99,235,0.35)";
                  }}
                >
                  Start Free <ArrowRight size={18} />
                </Link>
                <button
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                  style={{
                    border: "1.5px solid #cbd5e1",
                    color: "#334155",
                    fontSize: 16,
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "#f8fafc";
                    el.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "transparent";
                    el.style.transform = "translateY(0)";
                  }}
                >
                  <Play size={16} fill="#334155" /> Watch Demo
                </button>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2">
                  {AVATARS.map((initials) => (
                    <div
                      key={initials}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white"
                      style={{ background: "#dbeafe", color: "#1d4ed8" }}
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium" style={{ color: "#475569" }}>
                  <strong style={{ color: "#0f172a" }}>500+</strong> engineering
                  students already joined
                </p>
              </div>
            </Reveal>
          </div>

          {/* Right – floating mock cards */}
          <div className="relative hidden lg:flex items-center justify-center min-h-[480px]">
            {/* Main card */}
            <div
              className="w-72 rounded-2xl p-5 shadow-xl border"
              style={{
                background: "#fff",
                borderColor: "#e2e8f0",
                animation: "float 3s ease-in-out infinite",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "#dbeafe" }}
                >
                  <BookOpen size={20} style={{ color: "#2563eb" }} />
                </div>
                <div>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "#0f172a" }}
                  >
                    ENG 301 - Fluid Mechanics
                  </p>
                  <p className="text-xs" style={{ color: "#64748b" }}>
                    Past Questions • 2023
                  </p>
                </div>
              </div>
              <div
                className="h-1.5 rounded-full mb-1"
                style={{ background: "#e2e8f0" }}
              >
                <div
                  className="h-1.5 rounded-full"
                  style={{ background: "#2563eb", width: "72%" }}
                />
              </div>
              <p className="text-xs" style={{ color: "#64748b" }}>
                72% downloaded
              </p>
            </div>

            {/* CGPA card */}
            <div
              className="absolute -bottom-6 -left-4 w-56 rounded-2xl p-4 shadow-lg border"
              style={{
                background: "#fff",
                borderColor: "#e2e8f0",
                animation: "float 3s ease-in-out infinite 0.8s",
              }}
            >
              <p
                className="text-xs font-semibold mb-2"
                style={{ color: "#475569" }}
              >
                CGPA Calculator
              </p>
              <p className="text-3xl font-bold" style={{ color: "#16a34a" }}>
                4.52
              </p>
              <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                First Class Honours 🎉
              </p>
            </div>

            {/* Vendor card */}
            <div
              className="absolute -top-6 -right-4 w-52 rounded-2xl p-4 shadow-lg border"
              style={{
                background: "#fff",
                borderColor: "#e2e8f0",
                animation: "float 3s ease-in-out infinite 1.6s",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: "#f59e0b" }}
                >
                  A
                </div>
                <div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "#0f172a" }}
                  >
                    Ade Prints
                  </p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={10} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs" style={{ color: "#64748b" }}>
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
