"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

const NAV_LINKS = ["Features", "Pricing", "About", "Contact"];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: "#fff",
        boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,0.08)" : "0 1px 0 #e2e8f0",
        height: 64,
      }}
    >
      <div className="flex items-center justify-between max-w-[1440px] mx-auto px-6 h-full">
        {/* Logo */}
        <a
          href="#"
          className="text-2xl font-bold tracking-tight"
          style={{ color: "#2563eb" }}
        >
          Engi<span style={{ color: "#0f172a" }}>Portal</span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: "#475569" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#2563eb")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
            >
              {l}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{ color: "#334155" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200"
            style={{
              background: "#2563eb",
              boxShadow: "0 1px 4px rgba(37,99,235,0.3)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#1d4ed8";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#2563eb";
            }}
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg"
          style={{ color: "#475569" }}
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className="md:hidden absolute top-16 left-0 right-0 bg-white border-t transition-all duration-300 overflow-hidden"
        style={{
          borderColor: "#e2e8f0",
          maxHeight: open ? 320 : 0,
          boxShadow: open ? "0 8px 20px rgba(0,0,0,0.08)" : "none",
        }}
      >
        <div className="flex flex-col px-6 py-4 gap-4">
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              onClick={() => setOpen(false)}
              className="text-sm font-medium"
              style={{ color: "#475569" }}
            >
              {l}
            </a>
          ))}
          <div
            className="flex flex-col gap-2 pt-2 border-t"
            style={{ borderColor: "#e2e8f0" }}
          >
            <Link
              href="/login"
              className="text-sm font-medium text-center py-2 rounded-lg"
              style={{ color: "#334155", background: "#f8fafc" }}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold text-center py-2 rounded-lg text-white"
              style={{ background: "#2563eb" }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
