import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { cookies } from 'next/headers';
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Providers } from "../components/providers/providers";
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
  title: "CampusHub",
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
      <body className={`${jakarta.variable} font-sans antialiased`}>
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
