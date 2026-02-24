import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EngiPortal — Your Complete Academic Companion",
  description:
    "Access lecture materials, calculate your CGPA, and connect with student vendors — all in one platform for Nnamdi Azikiwe University engineering students.",
  keywords: [
    "engineering",
    "CGPA calculator",
    "student materials",
    "NAU",
    "university portal",
  ],
  openGraph: {
    title: "EngiPortal — Your Complete Academic Companion",
    description: "The all-in-one platform for engineering students.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
