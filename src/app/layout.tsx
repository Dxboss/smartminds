import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/content/siteConfig";
import { ConsentProvider } from "@/context/ConsentContext";
import { BookingProvider } from "@/context/BookingContext";
import { AuthProvider } from "@/context/AuthContext";
import {
  Header,
  Footer,
  MobileBottomBar,
  StagingBanner,
  ImpersonationBannerSlot,
} from "@/components/layout";
import { BookingModal } from "@/components/booking/BookingModal";
import { CookieBanner } from "@/components/consent/CookieBanner";
import { InactivityTimer } from "@/components/auth/InactivityTimer";
import { UtmTracker } from "@/components/analytics/UtmTracker";
import { GoogleTagManager } from "@/components/analytics/GoogleTagManager";
import { OrganizationStructuredData } from "@/components/layout/OrganizationStructuredData";
import { BackToTop } from "@/components/ui/BackToTop";
import {
  HeaderNavConfig,
  FooterConfig,
  defaultHeaderNavConfig,
  defaultFooterConfig,
} from "@/lib/repositories/seedData";
import { getPersistentSiteTheme, getPersistentSiteThemeAsync } from "@/lib/siteTheme";

const plusJakartaHeading = Plus_Jakarta_Sans({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

const plusJakartaBody = Plus_Jakarta_Sans({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://smartmindstraining.co.uk"),
  title: {
    template: `%s | ${siteConfig.name}`,
    default: `${siteConfig.name} | Live Online Classes & Regulated Qualifications`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      "google-site-verification-smartminds-2026",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await getPersistentSiteThemeAsync();
  const headerConfig = (theme.headerNav || defaultHeaderNavConfig) as HeaderNavConfig;
  const footerConfig = (theme.footer || defaultFooterConfig) as FooterConfig;

  return (
    <html
      lang="en-GB"
      data-scroll-behavior="smooth"
      className={`${plusJakartaHeading.variable} ${plusJakartaBody.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col font-body bg-paper text-ink selection:bg-gold-300 selection:text-navy-900"
        suppressHydrationWarning
      >
        <ConsentProvider>
          <AuthProvider>
            <OrganizationStructuredData />
            <UtmTracker />
            <GoogleTagManager />
            <BookingProvider>
              {/* Impersonation active banner for Superadmin streamed inside Suspense */}
              <Suspense fallback={null}>
                <ImpersonationBannerSlot />
              </Suspense>

              {/* Staging & Preview Environment Notice per PRD 11 */}
              <StagingBanner />

              {/* Skip to Main Content Link for WCAG 2.2 AA Keyboard Navigation */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-navy-900 focus:text-white focus:rounded-sm focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold-500 font-semibold text-sm transition-all"
              >
                Skip to main content
              </a>

              {/* Global Header */}
              <Header config={headerConfig} />

              {/* Page Main Content */}
              <main id="main-content" className="flex-1">
                {children}
              </main>

              {/* Global Footer */}
              <Footer config={footerConfig} headerConfig={headerConfig} />

              {/* Persistent Mobile Bottom Action Bar */}
              <MobileBottomBar />

              {/* Global Consultation Booking Modal Shell */}
              <BookingModal />

              {/* Global Cookie Consent Banner & Preferences Modal */}
              <CookieBanner />

              {/* Inactivity Security Auto-Logout Watcher */}
              <InactivityTimer />

              {/* Floating Back to Top Control */}
              <BackToTop />
            </BookingProvider>
          </AuthProvider>
        </ConsentProvider>
      </body>
    </html>
  );
}
