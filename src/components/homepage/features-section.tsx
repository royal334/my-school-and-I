"use client";

import {
  BarChart3,
  BookOpen,
  Calculator,
  Check,
  Megaphone,
  Store,
} from "lucide-react";
import { Reveal } from "./reveal";

const MAIN_FEATURES = [
  {
    icon: BookOpen,
    iconBgClass: "bg-primary-50 dark:bg-primary-950",
    iconColorClass: "text-primary-600 dark:text-primary-300",
    title: "Materials library",
    desc: "Access lecture notes, past questions, and textbooks organized by level and semester.",
    items: [
      "Organized by course and level",
      "Search and filter functionality",
      "Premium and free materials",
    ],
  },
  {
    icon: Calculator,
    iconBgClass: "bg-primary-50 dark:bg-primary-950",
    iconColorClass: "text-primary-600 dark:text-primary-300",
    title: "CGPA tracker",
    desc: "Calculate your GPA and CGPA with the Nigerian grading system and track progress semester by semester.",
    items: [
      "Nigerian 5-point scale",
      "Semester-by-semester tracking",
      "Class of degree prediction",
    ],
  },
  {
    icon: Store,
    iconBgClass: "bg-accent-50 dark:bg-accent-950/40",
    iconColorClass: "text-accent-600 dark:text-accent-300",
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
    icon: Megaphone,
    title: "Announcements",
    desc: "Stay updated with departmental news, deadlines, and notices.",
  },
  {
    icon: BarChart3,
    title: "Progress insights",
    desc: "Track your download history and study usage patterns.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-card py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-6">
        <Reveal>
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary-600 dark:text-primary-300">
              One connected campus life
            </p>
            <h2 className="mx-auto mb-4 max-w-2xl text-3xl text-foreground lg:text-4xl">
              Less admin. More momentum.
            </h2>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground">
              The essentials students need, organized around the way you plan,
              study, and get things done.
            </p>
          </div>
        </Reveal>

        <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MAIN_FEATURES.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Reveal key={feature.title} delay={index * 100}>
                <div className="card-hover h-full rounded-2xl border border-border bg-background p-6 dark:bg-card">
                  <div
                    className={`mb-5 flex size-14 items-center justify-center rounded-xl ${feature.iconBgClass}`}
                  >
                    <Icon size={27} className={feature.iconColorClass} />
                  </div>
                  <h3 className="mb-2 text-xl text-foreground">{feature.title}</h3>
                  <p className="mb-5 text-sm leading-6 text-muted-foreground">
                    {feature.desc}
                  </p>
                  <ul className="space-y-2.5">
                    {feature.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check
                          size={15}
                          className="shrink-0 text-primary-600 dark:text-primary-300"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {EXTRA_FEATURES.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Reveal key={feature.title} delay={index * 80}>
                <div className="flex items-start gap-4 rounded-2xl border border-border bg-muted p-5 transition-colors hover:border-primary-200 dark:bg-card">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-background text-primary-600 dark:bg-primary-950 dark:text-primary-300">
                    <Icon size={21} />
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
