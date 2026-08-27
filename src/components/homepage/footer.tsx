"use client";

import { Twitter, Instagram, MessageCircle } from "lucide-react";

const PRODUCT_LINKS = [
  "Features",
  "Pricing",
  "Materials library",
  "CGPA calculator",
  "Vendors",
];
const SUPPORT_LINKS = [
  "Help center",
  "Contact us",
  "FAQs",
  "Terms of service",
  "Privacy policy",
];

const SOCIAL_ICONS = [
  { icon: <Twitter size={18} />, href: "#", label: "Twitter" },
  { icon: <Instagram size={18} />, href: "#", label: "Instagram" },
  { icon: <MessageCircle size={18} />, href: "#", label: "WhatsApp" },
];

export function Footer() {
  return (
    <footer className="bg-[#141F1B]">
      <div className="max-w-360 mx-auto px-6 pt-16 pb-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <p className="text-2xl font-bold mb-3 text-white" style={{ fontFamily: "var(--font-display)" }}>
              Campus<span className="text-[#7EC8A0]">Hub</span>
            </p>
            <p className="text-sm mb-6 leading-6 text-[#8AADA4]">
              Your complete academic companion for engineering students.
            </p>
            <div className="flex gap-4">
              {SOCIAL_ICONS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-[#1A2822] text-[#6B7B75] hover:bg-[#4A8C73] hover:text-white transition-all duration-200 dark:bg-[#1E211F] dark:text-[#9BA19E] dark:hover:bg-[#4A8C73]"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-4 text-white" style={{ letterSpacing: "0.08em" }}>
              Product
            </p>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-[#8AADA4] hover:text-white transition-colors duration-200"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-4 text-white" style={{ letterSpacing: "0.08em" }}>
              Support
            </p>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-[#8AADA4] hover:text-white transition-colors duration-200"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* University */}
          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-4 text-white" style={{ letterSpacing: "0.08em" }}>
              University
            </p>
            <div className="space-y-2 text-sm text-[#8AADA4]">
              <p>Nnamdi Azikiwe University</p>
              <p>Faculty of Engineering</p>
              <a
                href="mailto:support@campushub.com"
                className="block hover:text-[#7EC8A0] transition-colors duration-200"
              >
                support@campushub.com
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#283330] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#6B7B75]">
          <p>© 2025 CampusHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
