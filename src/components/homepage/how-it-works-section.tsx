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
    <section id="contact" className="py-20 lg:py-24 bg-muted dark:bg-background">
      <div className="max-w-[1440px] mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <p className="text-sm font-medium uppercase tracking-widest mb-2 text-muted-foreground" style={{ letterSpacing: "0.08em" }}>
              Simple process
            </p>
            <h2 className="text-3xl lg:text-4xl mb-4 text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              Get started in 3 steps
            </h2>
            <p className="text-lg max-w-xl mx-auto text-muted-foreground">
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
                "repeating-linear-gradient(90deg,var(--color-primary-300) 0px,var(--color-primary-300) 8px,transparent 8px,transparent 16px)",
            }}
          />

          {STEPS.map((s, i) => (
            <Reveal key={s.number} delay={i * 120}>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-primary-50 dark:bg-primary-950/50">
                    <span className="text-primary-600 dark:text-primary-300">{s.icon}</span>
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-primary-100 bg-primary-900 dark:bg-primary-700">
                    {s.number}
                  </span>
                </div>
                <h3 className="text-lg mb-2 text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                  {s.title}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
