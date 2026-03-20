export const metadata = {
  title: "Announcements | EUniHub",
  description: "Campus announcements — coming soon",
};

export default function AnnouncementsPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        {/* SVG Illustration */}
        <div className="mx-auto mb-8 w-64 h-64 relative">
          <svg
            viewBox="0 0 240 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Background circle */}
            <circle cx="120" cy="120" r="110" fill="#f0fdf4" />

            {/* Sound waves (left) */}
            <path
              d="M62 100 Q48 120 62 140"
              stroke="#4ade80"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M50 90 Q28 120 50 150"
              stroke="#4ade80"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.3"
            />

            {/* Sound waves (right) */}
            <path
              d="M178 100 Q192 120 178 140"
              stroke="#4ade80"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M190 90 Q212 120 190 150"
              stroke="#4ade80"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.3"
            />

            {/* Megaphone body */}
            <path d="M75 105 L75 135 L105 148 L105 92 Z" fill="#16a34a" />
            {/* Megaphone bell */}
            <path d="M105 80 L165 55 L165 185 L105 160 Z" fill="#22c55e" />
            {/* Megaphone highlight */}
            <path
              d="M105 85 L155 65 L155 90 L105 108 Z"
              fill="#4ade80"
              opacity="0.4"
            />

            {/* Handle / grip */}
            <rect x="62" y="108" width="16" height="24" rx="4" fill="#15803d" />

            {/* Bell opening shine */}
            <ellipse cx="165" cy="120" rx="10" ry="35" fill="#bbf7d0" />

            {/* Broadcast / notification dots */}
            <circle cx="55" cy="120" r="4" fill="#16a34a" opacity="0.8" />
            <circle cx="185" cy="120" r="4" fill="#16a34a" opacity="0.8" />

            {/* Notification bubbles floating up */}
            {/* Bubble 1 */}
            <rect
              x="140"
              y="38"
              width="48"
              height="22"
              rx="11"
              fill="#ffffff"
              stroke="#bbf7d0"
              strokeWidth="2"
            />
            <text
              x="164"
              y="53"
              textAnchor="middle"
              fill="#16a34a"
              fontSize="9"
              fontFamily="sans-serif"
              fontWeight="bold"
            >
              New!
            </text>

            {/* Bubble 2 */}
            <rect
              x="38"
              y="55"
              width="42"
              height="20"
              rx="10"
              fill="#ffffff"
              stroke="#bbf7d0"
              strokeWidth="2"
            />
            <text
              x="59"
              y="68"
              textAnchor="middle"
              fill="#16a34a"
              fontSize="8"
              fontFamily="sans-serif"
            >
              Alert!
            </text>

            {/* Stars / sparkles */}
            <path
              d="M195 45 L197 50 L202 52 L197 54 L195 59 L193 54 L188 52 L193 50 Z"
              fill="#fbbf24"
              opacity="0.9"
            />
            <circle cx="32" cy="85" r="3" fill="#fbbf24" opacity="0.6" />
            <circle cx="207" cy="160" r="2.5" fill="#22c55e" opacity="0.5" />
            <circle cx="35" cy="155" r="2" fill="#22c55e" opacity="0.5" />
            <path
              d="M208 78 L210 83 L215 85 L210 87 L208 92 L206 87 L201 85 L206 83 Z"
              fill="#4ade80"
              opacity="0.6"
            />

            {/* Ground line */}
            <line
              x1="30"
              y1="195"
              x2="210"
              y2="195"
              stroke="#bbf7d0"
              strokeWidth="2"
            />

            {/* Clock / timer icon (bottom center) */}
            <circle cx="120" cy="185" r="0" fill="transparent" />
          </svg>
        </div>

        {/* Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
          </span>
          Coming Soon
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
          Announcements
        </h1>
        <p className="mt-3 text-lg text-slate-500">
          Stay in the loop with department notices, exam schedules, and
          important university-wide updates — all in one place.
        </p>

        {/* Feature hints */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
          {[
            { icon: "📢", label: "Dept. Notices" },
            { icon: "📅", label: "Exam Updates" },
            { icon: "🔔", label: "Push Alerts" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-xl border border-green-100 bg-green-50 p-4"
            >
              <span className="text-2xl">{icon}</span>
              <span className="font-medium text-slate-700">{label}</span>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-slate-400">
          Check back soon — this feature is actively being developed.
        </p>
      </div>
    </div>
  );
}
