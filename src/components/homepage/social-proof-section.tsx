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
    <span ref={ref} className="text-5xl font-bold text-[#4A8C73] dark:text-[#7EC8A0]">
      {count}
      {suffix}
    </span>
  );
}

export function SocialProofSection() {
  return (
    <section className="py-20 lg:py-24 bg-[#F0F5F3] dark:bg-[#0F1A17]">
      <div className="max-w-[1440px] mx-auto px-6">
        <Reveal>
          <div className="text-center mb-14">
            <p className="text-sm font-medium uppercase tracking-widest mb-2 text-[#6B7B75] dark:text-[#A8C8BB]" style={{ letterSpacing: "0.08em" }}>
              Social proof
            </p>
            <h2 className="text-3xl lg:text-4xl text-[#1A3C34] dark:text-[#E8F5EF]" style={{ fontFamily: "var(--font-display)" }}>
              Trusted by engineering students
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
                <p className="text-sm mt-1 font-medium text-[#6B7B75] dark:text-[#A8C8BB]">
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
              <div className="rounded-xl p-6 border border-[#D6E5DF] bg-white hover:-translate-y-1 hover:shadow-lg transition-all duration-200 h-full flex flex-col dark:border-[rgba(126,200,160,0.15)] dark:bg-[#1A2822]">
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} fill="#E8A020" color="#E8A020" />
                  ))}
                </div>
                <p className="text-sm leading-6 flex-1 mb-5 text-[#6B7B75] dark:text-[#A8C8BB]">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-[#E8F5EF] shrink-0 bg-[#1A3C34] dark:bg-[#4A8C73]">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[#141F1B] dark:text-[#E8F5EF]">
                      {t.name}
                    </p>
                    <p className="text-xs text-[#6B7B75] dark:text-[#A8C8BB]">{t.meta}</p>
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
