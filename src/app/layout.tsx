import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { cookies } from 'next/headers';
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Providers } from "../components/providers/providers";
import { PageLoader } from "../components/providers/page-loader";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4F46E5" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0B12" },
  ],
};

export const metadata: Metadata = {
  title: "Campus&Me",
  description:
    "The digital hub for ambitious Nigerian university students — materials, CGPA tools, vendors, announcements, and more.",
  keywords: [
    "university platform",
    "CGPA calculator",
    "student materials",
    "NAU",
    "university portal",
  ],
  openGraph: {
    title: "Campus&Me — Your Campus life in one place",
    description: "The all-in-one platform for university students.",
    type: "website",
    url: "https://campusandme.com",
    siteName: "Campus&Me",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Campus&Me — Your campus life in one place",
      },
    ],
    locale: "en_NG",
  },

  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Campus&Me',
  },
  formatDetection: {
    telephone: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className={`${jakarta.variable} font-sans antialiased`}>
        <Providers>
          <PageLoader />
          <Toaster />
          {children}
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
