"use client";

import { Star } from "lucide-react";
import { Reveal } from "./reveal";
import { useInView, useCountUp } from "../../hooks/hooks";

const STATS = [
  { label: "Active students", value: 500, suffix: "+" },
  { label: "Materials available", value: 2000, suffix: "+" },
  { label: "Verified vendors", value: 50, suffix: "+" },
  { label: "Student rating", value: 4.8, suffix: "/5" },
];

const TESTIMONIALS = [
  {
    quote:
      "CampusHub saved me hours of searching for past questions. Everything is organized and easy to find!",
    name: "Chioma A.",
    meta: "300 Level, Mechanical Engineering",
    initials: "CA",
  },
  {
    quote:
      "The CGPA calculator is exactly what I needed. It uses the Nigerian system and predicts my class of degree.",
    name: "Emmanuel O.",
    meta: "400 Level, Civil Engineering",
    initials: "EO",
  },
  {
    quote:
      "I found a vendor for thesis binding through the platform. Very reliable and easy to contact on WhatsApp.",
    name: "Ngozi M.",
    meta: "500 Level, Chemical Engineering",
    initials: "NM",
  },
];

function StatCount({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const { ref, inView } = useInView();
  const count = useCountUp(target, inView);
  return (
    <span ref={ref} className="text-5xl font-bold text-primary-600 dark:text-primary-300">
      {count}
      {suffix}
    </span>
  );
}

export function SocialProofSection() {
  return (
    <section className="py-20 lg:py-24 bg-muted dark:bg-background">
      <div className="max-w-[1440px] mx-auto px-6">
        <Reveal>
          <div className="text-center mb-14">
            <p className="text-sm font-medium uppercase tracking-widest mb-2 text-muted-foreground" style={{ letterSpacing: "0.08em" }}>
              Social proof
            </p>
            <h2 className="text-3xl lg:text-4xl text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              Trusted by students
            </h2>
          </div>
        </Reveal>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 text-center">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div>
                <div>
                  <StatCount target={s.value} suffix={s.suffix} />
                </div>
                <p className="text-sm mt-1 font-medium text-muted-foreground">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <div className="rounded-xl p-6 border border-border bg-card hover:-translate-y-1 hover:shadow-lg transition-all duration-200 h-full flex flex-col dark:bg-card">
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} className="fill-accent-500 text-accent-500" />
                  ))}
                </div>
                <p className="text-sm leading-6 flex-1 mb-5 text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-primary-100 shrink-0 bg-primary-900 dark:bg-primary-800">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.meta}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
