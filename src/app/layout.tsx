import type { Metadata, Viewport } from "next";
import { DM_Serif_Display } from "next/font/google";
import { cookies } from 'next/headers';
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Providers } from "../components/providers/providers";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1A3C34" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1A17" },
  ],
};

export const metadata: Metadata = {
  title: "CampusHub",
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
    title: "CampusHub — Your Complete Academic Companion",
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
  const htmlClass = themeCookie && themeCookie !== 'system' ? themeCookie : undefined;
  const htmlStyle = themeCookie && themeCookie !== 'system' ? { colorScheme: themeCookie } : undefined;

  return (
    <html lang="en" className={htmlClass} style={htmlStyle}>
      <body className={`${dmSerif.variable} font-sans antialiased`}>
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
