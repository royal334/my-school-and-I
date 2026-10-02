"use client";

import { Instagram, MessageCircle, Twitter } from "lucide-react";
import { CampusMeLogo } from "@/components/brand/logo";
import Link from "next/link";

const PRODUCT_LINKS = [
  "Features",
  "Pricing",
  "Materials library",
  "CGPA calculator",
  "Vendors",
];

const SUPPORT_LINKS = [
  { label: "Help center", href: "#" },
  { label: "Contact us", href: "#" },
  { label: "FAQs", href: "#" },
  { label: "Terms of service", href: "/terms" },
  { label: "Privacy policy", href: "/privacy" },
];

const SOCIAL_ICONS = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: MessageCircle, href: "#", label: "WhatsApp" },
];

export function Footer() {
  return (
    <footer className="bg-primary-950 text-primary-100">
      <div className="mx-auto max-w-[1440px] px-6 pb-8 pt-16">
        <div className="mb-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <CampusMeLogo className="mb-4" inverted />
            <p className="mb-6 max-w-xs text-sm leading-6 text-primary-200/75">
              The digital hub for ambitious Nigerian university students.
            </p>
            <div className="flex gap-3">
              {SOCIAL_ICONS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-primary-200 transition-colors hover:bg-primary-600 hover:text-white"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-white">
              Product
            </p>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-primary-200/75 transition-colors hover:text-white"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-white">
              Support
            </p>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-primary-200/75 transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-white">
              Campus&Me
            </p>
            <div className="space-y-2 text-sm text-primary-200/75">
              <p>Nnamdi Azikiwe University</p>
              <p>Faculty of Engineering</p>
              <a
                href="mailto:support@campushub.com"
                className="block transition-colors hover:text-accent-300"
              >
                support@campushub.com
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-primary-200/60 sm:flex-row">
          <p>© 2025 Campus&Me. All rights reserved.</p>
          <p>Built for the next generation.</p>
        </div>
      </div>
    </footer>
  );
}
