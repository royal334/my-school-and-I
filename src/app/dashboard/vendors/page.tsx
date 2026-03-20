export const metadata = {
  title: "Vendors | Unihub",
  description: "Campus vendor directory — coming soon",
};

export default function VendorsPage() {
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
            <circle cx="120" cy="120" r="110" fill="#eff6ff" />

            {/* Shop / stall base */}
            <rect
              x="50"
              y="130"
              width="140"
              height="65"
              rx="6"
              fill="#bfdbfe"
            />
            <rect
              x="60"
              y="140"
              width="120"
              height="50"
              rx="4"
              fill="#ffffff"
            />

            {/* Awning */}
            <path d="M40 100 L200 100 L190 130 L50 130 Z" fill="#2563eb" />
            {/* Awning scallops */}
            <path
              d="M50 130 Q60 120 70 130 Q80 120 90 130 Q100 120 110 130 Q120 120 130 130 Q140 120 150 130 Q160 120 170 130 Q180 120 190 130"
              stroke="#1d4ed8"
              strokeWidth="2"
              fill="none"
            />
            {/* Awning stripes */}
            <path d="M80 100 L72 130" stroke="#1d4ed8" strokeWidth="2" />
            <path d="M110 100 L106 130" stroke="#1d4ed8" strokeWidth="2" />
            <path d="M140 100 L140 130" stroke="#1d4ed8" strokeWidth="2" />
            <path d="M170 100 L168 130" stroke="#1d4ed8" strokeWidth="2" />

            {/* Sign on awning */}
            <rect x="80" y="105" width="80" height="18" rx="4" fill="#1e40af" />
            <text
              x="120"
              y="117"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="8"
              fontFamily="sans-serif"
              fontWeight="bold"
            >
              VENDORS
            </text>

            {/* Shop window */}
            <rect x="75" y="148" width="38" height="32" rx="3" fill="#dbeafe" />
            {/* Window cross */}
            <line
              x1="94"
              y1="148"
              x2="94"
              y2="180"
              stroke="#93c5fd"
              strokeWidth="1.5"
            />
            <line
              x1="75"
              y1="164"
              x2="113"
              y2="164"
              stroke="#93c5fd"
              strokeWidth="1.5"
            />

            {/* Door */}
            <rect
              x="127"
              y="152"
              width="40"
              height="38"
              rx="3"
              fill="#93c5fd"
            />
            <circle cx="162" cy="171" r="2" fill="#2563eb" />

            {/* Products on display */}
            <rect x="80" y="155" width="10" height="8" rx="2" fill="#fbbf24" />
            <rect x="93" y="153" width="8" height="10" rx="2" fill="#34d399" />
            <rect x="103" y="156" width="7" height="7" rx="2" fill="#f87171" />

            {/* Stars / sparkles */}
            <path
              d="M30 60 L33 67 L40 70 L33 73 L30 80 L27 73 L20 70 L27 67 Z"
              fill="#fbbf24"
              opacity="0.8"
            />
            <path
              d="M200 50 L202 55 L207 57 L202 59 L200 64 L198 59 L193 57 L198 55 Z"
              fill="#fbbf24"
              opacity="0.7"
            />
            <circle cx="210" cy="90" r="3" fill="#2563eb" opacity="0.4" />
            <circle cx="25" cy="100" r="2" fill="#2563eb" opacity="0.4" />
            <circle cx="185" cy="75" r="4" fill="#93c5fd" opacity="0.5" />
            <circle cx="55" cy="75" r="3" fill="#93c5fd" opacity="0.5" />

            {/* Ground / floor line */}
            <line
              x1="30"
              y1="195"
              x2="210"
              y2="195"
              stroke="#bfdbfe"
              strokeWidth="2"
            />

            {/* Clock / timer icon */}
            <circle
              cx="120"
              cy="60"
              r="18"
              fill="#ffffff"
              stroke="#2563eb"
              strokeWidth="2"
            />
            <path
              d="M120 48 L120 60 L128 67"
              stroke="#2563eb"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="120" cy="60" r="2" fill="#2563eb" />
          </svg>
        </div>

        {/* Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          Coming Soon
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
          Vendor Directory
        </h1>
        <p className="mt-3 text-lg text-slate-500">
          We&apos;re building a curated directory of campus vendors — from
          stationery shops to printing services and beyond.
        </p>

        {/* Feature hints */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
          {[
            { icon: "🛒", label: "Shop Listings" },
            { icon: "⭐", label: "Ratings & Reviews" },
            { icon: "📍", label: "Campus Locations" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-4"
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
