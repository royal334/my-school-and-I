"use client";

import { Twitter, Instagram, MessageCircle } from "lucide-react";

const PRODUCT_LINKS = [
  "Features",
  "Pricing",
  "Materials Library",
  "CGPA Calculator",
  "Vendors",
];
const SUPPORT_LINKS = [
  "Help Center",
  "Contact Us",
  "FAQs",
  "Terms of Service",
  "Privacy Policy",
];

const SOCIAL_ICONS = [
  { icon: <Twitter size={18} />, href: "#", label: "Twitter" },
  { icon: <Instagram size={18} />, href: "#", label: "Instagram" },
  { icon: <MessageCircle size={18} />, href: "#", label: "WhatsApp" },
];

export function Footer() {
  return (
    <footer className="bg-slate-900">
      <div className="max-w-[1440px] mx-auto px-6 pt-16 pb-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <p className="text-2xl font-bold mb-3 text-white">
              Engi<span className="text-blue-400">Portal</span>
            </p>
            <p className="text-sm mb-6 leading-6 text-slate-400">
              Your complete academic companion for Engineering students.
            </p>
            <div className="flex gap-4">
              {SOCIAL_ICONS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-800 text-slate-500 hover:bg-blue-600 hover:text-white transition-all duration-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-blue-700 dark:hover:text-white"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4 text-white">
              Product
            </p>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4 text-white">
              Support
            </p>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* University */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4 text-white">
              University
            </p>
            <div className="space-y-2 text-sm text-slate-400">
              <p>Nnamdi Azikiwe University</p>
              <p>Faculty of Engineering</p>
              <a
                href="mailto:support@engiportal.com"
                className="block hover:text-blue-400 transition-colors duration-200"
              >
                support@engiportal.com
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
          <p>© 2025 EngiPortal. All rights reserved.</p>
          <p>Built with ❤️ by Engineering Students</p>
        </div>
      </div>
    </footer>
  );
}
