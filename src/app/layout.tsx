import type { Metadata } from "next";
import { Saira_Condensed, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/content/siteConfig";
import { ConsentProvider } from "@/context/ConsentContext";
import { BookingProvider } from "@/context/BookingContext";
import { Header, Footer, MobileBottomBar } from "@/components/layout";
import { BookingModal } from "@/components/booking/BookingModal";
import { CookieBanner } from "@/components/consent/CookieBanner";

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
    template: `%s | ${siteConfig.name}`,
    default: `${siteConfig.name} | Live Online Classes & Regulated Qualifications`,
  },
  description: siteConfig.description,
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
        <ConsentProvider>
          <BookingProvider>
            {/* Global Header */}
            <Header />

            {/* Page Main Content with bottom padding on mobile for persistent bar */}
            <main className="flex-1 pb-16 lg:pb-0">{children}</main>

            {/* Global Footer */}
            <Footer />

            {/* Persistent Mobile Bottom Action Bar */}
            <MobileBottomBar />

            {/* Global Consultation Booking Modal Shell */}
            <BookingModal />

            {/* Global Cookie Consent Banner & Preferences Modal */}
            <CookieBanner />
          </BookingProvider>
        </ConsentProvider>
      </body>
    </html>
  );
}
