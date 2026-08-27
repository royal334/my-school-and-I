"use client";

import {
  BookOpen,
  Calculator,
  Store,
  Megaphone,
  BarChart3,
  Check,
} from "lucide-react";
import { Reveal } from "./reveal";

const MAIN_FEATURES = [
  {
    icon: <BookOpen size={28} />,
    iconBgClass: "bg-[#E8F5EF] dark:bg-[rgba(126,200,160,0.15)]",
    iconColorClass: "text-[#4A8C73] dark:text-[#7EC8A0]",
    title: "Materials library",
    desc: "Access lecture notes, past questions, and textbooks organized by level and semester.",
    items: [
      "Organized by course and level",
      "Search and filter functionality",
      "Premium and free materials",
    ],
  },
  {
    icon: <Calculator size={28} />,
    iconBgClass: "bg-[#E8F5EF] dark:bg-[rgba(126,200,160,0.15)]",
    iconColorClass: "text-[#1A7A52] dark:text-[#7EC8A0]",
    title: "CGPA tracker",
    desc: "Calculate your GPA and CGPA with the Nigerian grading system. Track progress semester by semester.",
    items: [
      "Nigerian 5-point scale",
      "Semester-by-semester tracking",
      "Class of degree prediction",
    ],
  },
  {
    icon: <Store size={28} />,
    iconBgClass: "bg-[#FFF0D4] dark:bg-[rgba(232,160,32,0.12)]",
    iconColorClass: "text-[#E8A020]",
    title: "Student and non-student vendors",
    desc: "Connect with trusted departmental vendors for printing, typing, repairs, and more.",
    items: [
      "Verified vendors only",
      "Ratings and reviews",
      "Contact directly via WhatsApp",
    ],
  },
];

const EXTRA_FEATURES = [
  {
    icon: <Megaphone size={22} />,
    iconBgClass: "bg-[#E8F5EF] dark:bg-[rgba(126,200,160,0.15)]",
    iconColorClass: "text-[#4A8C73] dark:text-[#7EC8A0]",
    title: "Announcements",
    desc: "Stay updated with departmental news and notices.",
  },
  {
    icon: <BarChart3 size={22} />,
    iconBgClass: "bg-[#E8F5EF] dark:bg-[rgba(126,200,160,0.15)]",
    iconColorClass: "text-[#1A7A52] dark:text-[#7EC8A0]",
    title: "Analytics",
    desc: "Track your download history and study usage patterns.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-24 bg-white dark:bg-[#1A2822]">
      <div className="max-w-[1440px] mx-auto px-6">
        <Reveal>
          <div className="text-center mb-14">
            <p className="text-sm font-medium uppercase tracking-widest mb-2 text-[#6B7B75] dark:text-[#A8C8BB]" style={{ letterSpacing: "0.08em" }}>
              Everything you need
            </p>
            <h2 className="text-3xl lg:text-4xl mb-4 text-[#1A3C34] dark:text-[#E8F5EF]" style={{ fontFamily: "var(--font-display)" }}>
              Built for excellence
            </h2>
            <p className="text-lg max-w-xl mx-auto text-[#6B7B75] dark:text-[#A8C8BB]">
              Comprehensive tools designed specifically for students.
            </p>
          </div>
        </Reveal>

        {/* Main 3 cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {MAIN_FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <div className="rounded-xl p-6 border border-[#D6E5DF] bg-white h-full hover:-translate-y-1 hover:shadow-lg hover:border-[#A8D8C2] transition-all duration-200 dark:border-[rgba(126,200,160,0.15)] dark:bg-[#1A2822] dark:hover:border-[rgba(126,200,160,0.3)]">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${f.iconBgClass}`}
                >
                  <span className={f.iconColorClass}>{f.icon}</span>
                </div>
                <h3 className="text-xl mb-2 text-[#141F1B] dark:text-[#E8F5EF]" style={{ fontFamily: "var(--font-display)" }}>
                  {f.title}
                </h3>
                <p className="text-sm mb-4 leading-6 text-[#6B7B75] dark:text-[#A8C8BB]">
                  {f.desc}
                </p>
                <ul className="space-y-2">
                  {f.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-[#3D4A46] dark:text-[#C8D8D0]"
                    >
                      <Check size={15} className="text-[#4A8C73] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Extra 2 cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {EXTRA_FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <div className="flex items-start gap-4 rounded-xl p-5 border border-[#D6E5DF] bg-[#F0F5F3] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 dark:border-[rgba(126,200,160,0.15)] dark:bg-[#1E3028]">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${f.iconBgClass}`}
                >
                  <span className={f.iconColorClass}>{f.icon}</span>
                </div>
                <div>
                  <h4 className="mb-1 text-[#141F1B] dark:text-[#E8F5EF]">{f.title}</h4>
                  <p className="text-sm text-[#6B7B75] dark:text-[#A8C8BB]">{f.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
