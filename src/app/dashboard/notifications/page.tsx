export const metadata = {
  title: "Notifications | UniHub",
  description: "Your activity and alerts — coming soon",
};

export default function NotificationsPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        {/* SVG Illustration - Bell */}
        <div className="mx-auto mb-8 w-64 h-64 relative">
          <svg
            viewBox="0 0 240 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Background circle */}
            <circle cx="120" cy="120" r="110" fill="#eff6ff" />

            {/* Echo waves (top) */}
            <path
              d="M100 50 Q120 35 140 50"
              stroke="#60a5fa"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M90 40 Q120 20 150 40"
              stroke="#60a5fa"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.3"
            />

            {/* Bell Clapper */}
            <circle cx="120" cy="175" r="12" fill="#1e40af" />

            {/* Bell body (main part) */}
            <path 
              d="M120 60 C80 60 70 100 70 140 L70 155 C70 160 75 165 80 165 L160 165 C165 165 170 160 170 155 L170 140 C170 100 160 60 120 60Z" 
              fill="#3b82f6" 
            />
            
            {/* Bell rim */}
            <path 
              d="M65 155 C65 150 70 145 75 145 L165 145 C170 145 175 150 175 155 L175 160 C175 165 170 170 165 170 L75 170 C70 170 65 165 65 160 Z" 
              fill="#2563eb" 
            />

            {/* Bell highlight */}
            <path
              d="M120 70 C100 70 90 90 90 120 L90 145 L110 145 L110 85 Z"
              fill="#93c5fd"
              opacity="0.4"
            />

            {/* Top loop */}
            <path d="M110 60 Q120 45 130 60" stroke="#1d4ed8" strokeWidth="6" fill="none" />

            {/* Floating Notification Badges */}
            {/* Badge 1 */}
            <circle cx="180" cy="80" r="18" fill="#ef4444" />
            <text
              x="180"
              y="86"
              textAnchor="middle"
              fill="white"
              fontSize="16"
              fontFamily="sans-serif"
              fontWeight="bold"
            >
              1
            </text>

            {/* Badge 2 */}
            <rect
              x="40"
              y="85"
              width="45"
              height="22"
              rx="11"
              fill="#ffffff"
              stroke="#bfdbfe"
              strokeWidth="2"
            />
            <text
              x="62.5"
              y="100"
              textAnchor="middle"
              fill="#3b82f6"
              fontSize="9"
              fontFamily="sans-serif"
              fontWeight="bold"
            >
              Alert
            </text>

            {/* Stars / sparkles */}
            <path
              d="M205 120 L207 125 L212 127 L207 129 L205 134 L203 129 L198 127 L203 125 Z"
              fill="#fbbf24"
              opacity="0.9"
            />
            <circle cx="45" cy="55" r="3" fill="#fbbf24" opacity="0.6" />
            
            {/* Ground line */}
            <line
              x1="30"
              y1="210"
              x2="210"
              y2="210"
              stroke="#bfdbfe"
              strokeWidth="2"
            />
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
          Notifications
        </h1>
        <p className="mt-3 text-lg text-slate-500">
          Your personal activity hub. Get real-time alerts for course updates,
          material approvals, vendor interactions, and more.
        </p>

        {/* Feature hints */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
          {[
            { icon: "⚡", label: "Real-time" },
            { icon: "📝", label: "Activity Log" },
            { icon: "✉️", label: "Direct Inquiries" },
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
          We&apos;re building a smarter way for you to stay updated. Check back soon.
        </p>
      </div>
    </div>
  );
}
