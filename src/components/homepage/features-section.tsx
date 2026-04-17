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
    iconBgClass: "bg-blue-100",
    iconColorClass: "text-blue-600",
    title: "Materials Library",
    desc: "Access lecture notes, past questions, and textbooks organized by level and semester.",
    items: [
      "Organized by course and level",
      "Search and filter functionality",
      "Premium and free materials",
    ],
  },
  {
    icon: <Calculator size={28} />,
    iconBgClass: "bg-green-100",
    iconColorClass: "text-green-600",
    title: "CGPA Tracker",
    desc: "Calculate your GPA and CGPA with the Nigerian grading system. Track progress semester by semester.",
    items: [
      "Nigerian 5-point scale",
      "Semester-by-semester tracking",
      "Class of degree prediction",
    ],
  },
  {
    icon: <Store size={28} />,
    iconBgClass: "bg-amber-100",
    iconColorClass: "text-amber-500",
    title: "Student and Non-Student Vendors",
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
    iconBgClass: "bg-blue-100",
    iconColorClass: "text-blue-600",
    title: "Announcements",
    desc: "Stay updated with departmental news and notices.",
  },
  {
    icon: <BarChart3 size={22} />,
    iconBgClass: "bg-green-100",
    iconColorClass: "text-green-600",
    title: "Analytics",
    desc: "Track your download history and study usage patterns.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-24 bg-white dark:bg-slate-950">
      <div className="max-w-[1440px] mx-auto px-6">
        <Reveal>
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">
              Everything You Need
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Built for Engineering Excellence
            </h2>
            <p className="text-lg max-w-xl mx-auto text-slate-600 dark:text-slate-300">
              Comprehensive tools designed specifically for engineering
              department students.
            </p>
          </div>
        </Reveal>

        {/* Main 3 cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {MAIN_FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <div className="rounded-xl p-6 border border-slate-200 bg-white h-full hover:-translate-y-1 hover:shadow-xl hover:border-blue-200 transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${f.iconBgClass}`}
                >
                  <span className={f.iconColorClass}>{f.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                  {f.title}
                </h3>
                <p className="text-sm mb-4 leading-6 text-slate-600 dark:text-slate-300">
                  {f.desc}
                </p>
                <ul className="space-y-2">
                  {f.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
                    >
                      <Check size={15} className="text-green-600 shrink-0" />
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
              <div className="flex items-start gap-4 rounded-xl p-5 border border-slate-200 bg-slate-50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 dark:border-slate-800 dark:bg-slate-900">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${f.iconBgClass}`}
                >
                  <span className={f.iconColorClass}>{f.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-slate-900 dark:text-white">{f.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{f.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
