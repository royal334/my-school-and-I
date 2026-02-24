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
    iconBg: "#dbeafe",
    iconColor: "#2563eb",
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
    iconBg: "#dcfce7",
    iconColor: "#16a34a",
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
    iconBg: "#fef3c7",
    iconColor: "#f59e0b",
    title: "Student Vendors",
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
    iconBg: "#dbeafe",
    iconColor: "#2563eb",
    title: "Announcements",
    desc: "Stay updated with departmental news and notices.",
  },
  {
    icon: <BarChart3 size={22} />,
    iconBg: "#dcfce7",
    iconColor: "#16a34a",
    title: "Analytics",
    desc: "Track your download history and study usage patterns.",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-20 lg:py-24"
      style={{ background: "#fff" }}
    >
      <div className="max-w-[1440px] mx-auto px-6">
        <Reveal>
          <div className="text-center mb-14">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-2"
              style={{ color: "#64748b" }}
            >
              Everything You Need
            </p>
            <h2
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{ color: "#0f172a" }}
            >
              Built for Engineering Excellence
            </h2>
            <p
              className="text-lg max-w-xl mx-auto"
              style={{ color: "#475569" }}
            >
              Comprehensive tools designed specifically for engineering
              department students.
            </p>
          </div>
        </Reveal>

        {/* Main 3 cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {MAIN_FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <div
                className="rounded-xl p-6 border h-full transition-all duration-200"
                style={{ background: "#fff", borderColor: "#e2e8f0" }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(-4px)";
                  el.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)";
                  el.style.borderColor = "#c7d7fe";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                  el.style.borderColor = "#e2e8f0";
                }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: f.iconBg }}
                >
                  <span style={{ color: f.iconColor }}>{f.icon}</span>
                </div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: "#0f172a" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-sm mb-4 leading-6"
                  style={{ color: "#475569" }}
                >
                  {f.desc}
                </p>
                <ul className="space-y-2">
                  {f.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: "#334155" }}
                    >
                      <Check
                        size={15}
                        style={{ color: "#16a34a", flexShrink: 0 }}
                      />
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
              <div
                className="flex items-start gap-4 rounded-xl p-5 border transition-all duration-200"
                style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(-3px)";
                  el.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: f.iconBg }}
                >
                  <span style={{ color: f.iconColor }}>{f.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold mb-1" style={{ color: "#0f172a" }}>
                    {f.title}
                  </h4>
                  <p className="text-sm" style={{ color: "#475569" }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
