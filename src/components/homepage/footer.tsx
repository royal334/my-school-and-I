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

export function Footer() {
  return (
    <footer style={{ background: "#0f172a" }}>
      <div className="max-w-[1440px] mx-auto px-6 pt-16 pb-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <p className="text-2xl font-bold mb-3" style={{ color: "#fff" }}>
              Engi<span style={{ color: "#60a5fa" }}>Portal</span>
            </p>
            <p className="text-sm mb-6 leading-6" style={{ color: "#94a3b8" }}>
              Your complete academic companion for Engineering students.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <Twitter size={18} />, href: "#" },
                { icon: <Instagram size={18} />, href: "#" },
                { icon: <MessageCircle size={18} />, href: "#" },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{ background: "#1e293b", color: "#64748b" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "#2563eb";
                    el.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "#1e293b";
                    el.style.color = "#64748b";
                  }}
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
                    className="text-sm transition-colors duration-200"
                    style={{ color: "#94a3b8" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#94a3b8")
                    }
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
                    className="text-sm transition-colors duration-200"
                    style={{ color: "#94a3b8" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#94a3b8")
                    }
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
            <div className="space-y-2 text-sm" style={{ color: "#94a3b8" }}>
              <p>Nnamdi Azikiwe University</p>
              <p>Faculty of Engineering</p>
              <a
                href="mailto:support@engiportal.com"
                className="block transition-colors duration-200"
                style={{ color: "#94a3b8" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#60a5fa")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
              >
                support@engiportal.com
              </a>
            </div>
          </div>
        </div>

        <div
          className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm"
          style={{ borderColor: "#1e293b", color: "#64748b" }}
        >
          <p>© 2025 EngiPortal. All rights reserved.</p>
          <p>Built with ❤️ by Engineering Students</p>
        </div>
      </div>
    </footer>
  );
}
