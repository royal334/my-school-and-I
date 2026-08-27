"use client";

import { UserPlus, Search, TrendingUp } from "lucide-react";
import { Reveal } from "./reveal";

const STEPS = [
  {
    number: "1",
    icon: <UserPlus size={26} />,
    title: "Create your account",
    desc: "Register with your university email and matric number. It takes less than 2 minutes.",
  },
  {
    number: "2",
    icon: <Search size={26} />,
    title: "Access materials",
    desc: "Search, filter, and access study materials for your courses, all organized by level.",
  },
  {
    number: "3",
    icon: <TrendingUp size={26} />,
    title: "Monitor progress",
    desc: "Input your results and calculate your CGPA automatically every semester.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="contact" className="py-20 lg:py-24 bg-[#F0F5F3] dark:bg-[#0D0F0E]">
      <div className="max-w-[1440px] mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <p className="text-sm font-medium uppercase tracking-widest mb-2 text-[#6B7B75] dark:text-[#9BA19E]" style={{ letterSpacing: "0.08em" }}>
              Simple process
            </p>
            <h2 className="text-3xl lg:text-4xl mb-4 text-[#1A3C34] dark:text-[#E8F5EF]" style={{ fontFamily: "var(--font-display)" }}>
              Get started in 3 steps
            </h2>
            <p className="text-lg max-w-xl mx-auto text-[#6B7B75] dark:text-[#9BA19E]">
              From signup to success — it&apos;s that simple.
            </p>
          </div>
        </Reveal>

        <div className="relative grid md:grid-cols-3 gap-10">
          {/* Connecting dashed line — sage */}
          <div
            className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 z-0"
            style={{
              background:
                "repeating-linear-gradient(90deg,#9AADA8 0px,#9AADA8 8px,transparent 8px,transparent 16px)",
            }}
          />

          {STEPS.map((s, i) => (
            <Reveal key={s.number} delay={i * 120}>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[#E8F5EF] dark:bg-white/5">
                    <span className="text-[#4A8C73] dark:text-[#7EC8A0]">{s.icon}</span>
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-[#E8F5EF] bg-[#1A3C34] dark:bg-[#4A8C73]">
                    {s.number}
                  </span>
                </div>
                <h3 className="text-lg mb-2 text-[#141F1B] dark:text-[#E8F5EF]" style={{ fontFamily: "var(--font-display)" }}>
                  {s.title}
                </h3>
                <p className="text-sm leading-6 text-[#6B7B75] dark:text-[#9BA19E]">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
