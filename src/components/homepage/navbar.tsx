"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Menu, User } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import { CampusMeLogo } from "@/components/brand/logo";
import { createClient } from "@/utils/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

const NAV_LINKS = ["Features", "About", "Contact"];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [initials, setInitials] = useState("");

  const loadProfile = useCallback(async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    if (data?.full_name) {
      const nameInitials = data.full_name
        .split(" ")
        .map((name: string) => name[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
      setInitials(nameInitials);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);

    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        void loadProfile(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        void loadProfile(session.user.id);
      } else {
        setInitials("");
      }
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 h-16 border-b border-border/70 bg-background/90 backdrop-blur-xl transition-all duration-300 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between px-5 sm:px-6">
        <Link href="/" aria-label="Campus&Me home">
          <CampusMeLogo />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                className="flex size-10 items-center justify-center rounded-full border border-primary-200 bg-primary-50 text-sm font-bold text-primary-700 transition-transform hover:scale-105 dark:border-primary-800 dark:bg-primary-950 dark:text-primary-300"
              >
                {initials || <User size={19} />}
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-semibold text-accent-950 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent-400 hover:shadow-md"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      <div
        className={`absolute inset-x-0 top-16 overflow-hidden border-b border-border bg-card shadow-lg transition-all duration-300 md:hidden ${
          open ? "max-h-[360px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-4 px-6 py-5">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link}
            </a>
          ))}
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted p-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                    {initials || <User size={19} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {user.email}
                    </p>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setOpen(false)}
                      className="text-xs text-primary-600 hover:underline dark:text-primary-300"
                    >
                      View profile
                    </Link>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-primary-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-500"
                >
                  Go to dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-muted px-4 py-2.5 text-center text-sm font-medium text-foreground"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-accent-500 px-4 py-2.5 text-center text-sm font-semibold text-accent-950 transition-colors hover:bg-accent-400"
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
