import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies } from 'next/headers';
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Providers } from "../components/providers/providers";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  title: "UniHub",
  description:
    "Access lecture materials, calculate your CGPA, and connect with student vendors — all in one platform for Nnamdi Azikiwe University engineering students.",
  keywords: [
    "university platform",
    "CGPA calculator",
    "student materials",
    "NAU",
    "university portal",
  ],
  openGraph: {
    title: "UniHub — Your Complete Academic Companion",
    description: "The all-in-one platform for university students.",
    type: "website",
  },

  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CampusHub',
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
  const cookieStore =  await cookies();
  const themeCookie = cookieStore.get('theme')?.value;
  // Apply the exact persisted theme value (when available) so server-render
  // output matches the client. Avoid applying anything for 'system'.
  const htmlClass = themeCookie && themeCookie !== 'system' ? themeCookie : undefined;
  const htmlStyle = themeCookie && themeCookie !== 'system' ? { colorScheme: themeCookie } : undefined;

  return (
    <html lang="en" className={htmlClass} style={htmlStyle}>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <Toaster />
          {children}
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
