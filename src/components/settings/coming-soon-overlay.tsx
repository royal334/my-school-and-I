import React from "react";

interface ComingSoonOverlayProps {
  children: React.ReactNode;
}

export default function ComingSoonOverlay({
  children,
}: ComingSoonOverlayProps) {
  return (
    <div className="relative group overflow-hidden rounded-xl transition-all duration-300">
      <div className="grayscale-[0.8] opacity-40 pointer-events-none blur-[0.5px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-10 transition-transform duration-500 group-hover:scale-105">
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-slate-900/90 dark:bg-slate-800/90 px-6 py-2 text-sm font-semibold text-white shadow-2xl backdrop-blur-md border border-white/10 ring-1 ring-white/20">
            Coming Soon
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            We're building this feature for you
          </p>
        </div>
      </div>
    </div>
  );
}
