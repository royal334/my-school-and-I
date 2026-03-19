"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, User } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import { createClient } from "@/utils/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

const NAV_LINKS = ["Features", "Pricing", "About", "Contact"];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [initials, setInitials] = useState<string>("");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);

    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setInitials("");
      }
    });

    return () => {
      window.removeEventListener("scroll", fn);
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    if (data?.full_name) {
      const parts = data.full_name.split(" ");
      const initials = parts
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
      setInitials(initials);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white dark:bg-slate-950 h-16 flex items-center ${
        scrolled
          ? "shadow-sm dark:shadow-none dark:border-b dark:border-slate-800"
          : "border-b border-slate-200 dark:border-slate-800"
      }`}
    >
      <div className="flex items-center justify-between max-w-[1440px] mx-auto px-6 w-full h-full">
        {/* Logo */}
        <a
          href="#"
          className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-500"
        >
          Engi<span className="text-slate-900 dark:text-white">Portal</span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              {l}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                Dashboard
              </Link>
              <Link href="/dashboard/profile">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-2 border-white dark:border-slate-800 shadow-sm hover:scale-105 transition-all">
                  {initials || <User size={20} />}
                </div>
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-sm transition-all duration-200"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300"
        style={{
          maxHeight: open ? 320 : 0,
          boxShadow: open && !scrolled ? "0 8px 20px rgba(0,0,0,0.08)" : "none",
        }}
      >
        <div className="flex flex-col px-6 py-4 gap-4">
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {l}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold">
                    {initials || <User size={20} />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {user.email}
                    </p>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setOpen(false)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="block text-sm font-semibold text-center py-2 rounded-lg text-white bg-blue-600"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-center py-2 rounded-lg text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-semibold text-center py-2 rounded-lg text-white bg-blue-600"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
