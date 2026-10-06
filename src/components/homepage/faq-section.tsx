"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Reveal } from "./reveal";

const FAQS = [
  {
    question: "What is Campus&Me?",
    answer:
      "Campus&Me is a digital hub for Nigerian university students. It brings together course materials, a CGPA calculator, trusted vendors, and campus updates in one place.",
  },
  {
    question: "Is Campus&Me free to use?",
    answer:
      "Yes, most features are free for students. You can access materials, track your CGPA, and stay updated without paying. Some premium materials may require access via approved channels.",
  },
  {
    question: "How does the CGPA calculator work?",
    answer:
      "It uses the Nigerian 5-point grading system. Simply input your course grades and credit units each semester, and it calculates your GPA and CGPA automatically.",
  },
  // {
  //   question: "Are the vendors verified?",
  //   answer:
  //     "Yes. Vendors on Campus&Me are verified before being listed. You can check ratings, reviews, and contact them directly through the platform.",
  // },
  {
    question:" How do I submit materials to Campus&Me?",
    answer:
      "You can submit materials through the 'Submit Materials' section. Ensure that your submissions are accurate, relevant, and comply with our content guidelines.",
  },

  {
    question: "Can I contribute to Campus&Me as a student?",
    answer:
      "Yes, students can contribute by submitting materials, sharing resources, or providing feedback to help improve the platform.",
  },
  {
    question:"Are the accommodations verified?",
    answer:
      "Yes. Accommodations on Campus&Me are verified before being listed. You can check ratings, reviews, and contact them directly through the platform.",
  },
  {
    question: "Can I access materials for my level and department?",
    answer:
      "Yes. Materials are organized by faculty, department, level, and course, making it easy to find exactly what you need.",
  },
  {
    question: "How secure is my data?",
    answer:
      "We use Supabase for authentication and database management with industry-standard security practices. Your personal information is never shared with third parties without your consent.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="bg-muted py-20 lg:py-28 dark:bg-background">
      <div className="mx-auto max-w-[1440px] px-6">
        <Reveal>
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary-600 dark:text-primary-300">
              Frequently asked questions
            </p>
            <h2 className="mx-auto mb-4 max-w-2xl text-3xl text-foreground lg:text-4xl">
              Got questions? We have answers.
            </h2>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground">
              Everything you need to know about getting started with Campus&Me.
            </p>
          </div>
        </Reveal>

        <div className="mx-auto max-w-3xl space-y-4">
          {FAQS.map((faq, index) => (
            <Reveal key={faq.question} delay={index * 80}>
              <div className="rounded-2xl border border-border bg-background dark:bg-card">
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-muted/50 dark:hover:bg-muted/20"
                  aria-expanded={openIndex === index}
                >
                  <h3 className="text-base font-semibold text-foreground lg:text-lg">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid overflow-hidden transition-all duration-300 ${
                    openIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0">
                    <p className="px-5 pb-5 text-sm leading-6 text-muted-foreground lg:text-base">
                      {faq.answer}
                    </p>
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
