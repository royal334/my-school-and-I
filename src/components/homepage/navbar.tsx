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
      className="fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300"
      style={{
        boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,0.08)" : "0 1px 0 #e2e8f0",
        height: 64,
      }}
    >
      <div className="flex items-center justify-between max-w-[1440px] mx-auto px-6 h-full">
        {/* Logo */}
        <a href="#" className="text-2xl font-bold tracking-tight text-blue-600">
          Engi<span className="text-slate-900">Portal</span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors duration-200"
            >
              {l}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-all duration-200"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all duration-200"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg text-slate-600"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className="md:hidden absolute top-16 left-0 right-0 bg-white border-t border-slate-200 overflow-hidden transition-all duration-300"
        style={{
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
              className="text-sm font-medium text-slate-600"
            >
              {l}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
            <Link
              href="/login"
              className="text-sm font-medium text-center py-2 rounded-lg text-slate-700 bg-slate-50"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold text-center py-2 rounded-lg text-white bg-blue-600"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
