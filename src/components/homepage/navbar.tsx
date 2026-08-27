"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, User } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import { createClient } from "@/utils/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

const NAV_LINKS = ["Features", "About", "Contact"];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [initials, setInitials] = useState<string>("");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);

    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white dark:bg-[#171918] h-16 flex items-center ${
        scrolled
          ? "shadow-[0_1px_4px_rgba(26,60,52,0.08)] dark:shadow-none dark:border-b dark:border-white/10"
          : "border-b border-[#D6E5DF] dark:border-white/10"
      }`}
    >
      <div className="flex items-center justify-between max-w-[1440px] mx-auto px-6 w-full h-full">
        {/* Logo */}
        <a
          href="#"
          className="text-2xl font-bold tracking-tight text-[#1A3C34] dark:text-[#E8F5EF]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Campus<span className="text-[#4A8C73] dark:text-[#7EC8A0]">Hub</span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="text-sm font-medium text-[#6B7B75] dark:text-[#9BA19E] hover:text-[#4A8C73] dark:hover:text-[#7EC8A0] transition-colors duration-200"
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
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B7B75] dark:text-[#9BA19E] hover:bg-[#E8F5EF] dark:hover:bg-[#202320] transition-all duration-200"
              >
                Dashboard
              </Link>
              <Link href="/dashboard/profile">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#E8F5EF] dark:bg-white/5 text-[#4A8C73] dark:text-[#7EC8A0] border-2 border-white dark:border-[#262928] shadow-sm hover:scale-105 transition-all">
                  {initials || <User size={20} />}
                </div>
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B7B75] dark:text-[#9BA19E] hover:bg-[#E8F5EF] dark:hover:bg-[#202320] transition-all duration-200"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#E8F5EF] bg-[#1A3C34] hover:bg-[#141F1B] dark:bg-[#4A8C73] dark:hover:bg-[#1A3C34] shadow-sm transition-all duration-200"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg text-[#6B7B75] dark:text-[#9BA19E]"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-[#171918] border-t border-[#D6E5DF] dark:border-white/10 overflow-hidden transition-all duration-300"
        style={{
          maxHeight: open ? 320 : 0,
          boxShadow: open && !scrolled ? "0 8px 20px rgba(26,60,52,0.08)" : "none",
        }}
      >
        <div className="flex flex-col px-6 py-4 gap-4">
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-[#6B7B75] dark:text-[#9BA19E] hover:text-[#4A8C73] dark:hover:text-[#7EC8A0]"
            >
              {l}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#D6E5DF] dark:border-white/10">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-[#F0F5F3] dark:bg-[#1E211F] border border-[#E1EBE6] dark:border-white/10">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#E8F5EF] dark:bg-white/5 text-[#4A8C73] dark:text-[#7EC8A0] font-bold">
                    {initials || <User size={20} />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-[#141F1B] dark:text-[#E8F5EF] truncate">
                      {user.email}
                    </p>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setOpen(false)}
                      className="text-xs text-[#4A8C73] dark:text-[#7EC8A0] hover:underline"
                    >
                      View profile
                    </Link>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="block text-sm font-medium text-center py-2 rounded-lg text-[#E8F5EF] bg-[#1A3C34]"
                >
                  Go to dashboard
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-center py-2 rounded-lg text-[#6B7B75] dark:text-[#9BA19E] bg-[#F0F5F3] dark:bg-[#1E211F]"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium text-center py-2 rounded-lg text-[#E8F5EF] bg-[#1A3C34]"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
