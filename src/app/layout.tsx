import type { Metadata } from "next";
import { Saira_Condensed, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sairaCondensed = Saira_Condensed({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  fallback: ["Arial Narrow", "sans-serif"],
});

const sourceSans3 = Source_Sans_3({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  fallback: ["Segoe UI", "Tahoma", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Smartminds Training College",
    default:
      "Smartminds Training College | Live Online Classes & Regulated Qualifications",
  },
  description:
    "UK college delivering live online classes with real tutors for regulated qualifications, CPD courses, and private tutoring.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-GB"
      className={`${sairaCondensed.variable} ${sourceSans3.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-paper text-ink selection:bg-gold-300 selection:text-navy-900">
        {children}
      </body>
    </html>
  );
}
