"use client";

import { UserPlus, Search, TrendingUp } from "lucide-react";
import { Reveal } from "./reveal";

const STEPS = [
  {
    number: "1",
    icon: <UserPlus size={26} />,
    title: "Create Your Account",
    desc: "Register with your university email and matric number. It takes less than 2 minutes.",
  },
  {
    number: "2",
    icon: <Search size={26} />,
    title: "Access Materials",
    desc: "Search, filter, and access study materials for your courses, all organized by level.",
  },
  {
    number: "3",
    icon: <TrendingUp size={26} />,
    title: "Monitor Progress",
    desc: "Input your results and calculate your CGPA automatically every semester.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="contact" className="py-20 lg:py-24 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-[1440px] mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">
              Simple Process
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Get Started in 3 Steps
            </h2>
            <p className="text-lg max-w-xl mx-auto text-slate-600 dark:text-slate-300">
              From signup to success — it&apos;s that simple.
            </p>
          </div>
        </Reveal>

        <div className="relative grid md:grid-cols-3 gap-10">
          {/* Connecting dashed line (desktop only) */}
          <div
            className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 z-0"
            style={{
              background:
                "repeating-linear-gradient(90deg,rgb(51 65 85) 0px,rgb(51 65 85) 8px,transparent 8px,transparent 16px)",
            }}
          />

          {STEPS.map((s, i) => (
            <Reveal key={s.number} delay={i * 120}>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/20">
                    <span className="text-blue-600 dark:text-blue-400">{s.icon}</span>
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white bg-blue-600 dark:bg-blue-700">
                    {s.number}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">
                  {s.title}
                </h3>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
