import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "@/components/auth/LoginForm";
import { DemoAccessPanel } from "@/components/auth/DemoAccessPanel";
import { siteConfig } from "@/content/siteConfig";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Sign in | Smartminds Training College",
  description:
    "Sign in to your Smartminds Training College portal. Students, tutors and staff sign in here.",
};

export default function LoginPage() {
  return (
    <div className="py-12 md:py-20 bg-paper/50 min-h-[calc(100vh-80px)] flex flex-col justify-center">
      <Container>
        {/* Page Header (PRD Section 3 & 12.1) */}
        <div className="max-w-xl mx-auto text-center mb-8 space-y-2">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-navy-900">
            Sign in
          </h1>
          <p className="text-base text-ink-soft">
            Students, tutors and staff sign in here.
          </p>
        </div>

        {/* Login Form Component */}
        <LoginForm />

        {/* Demo Access Panel: Gated by DEMO_MODE=true per Prompt D1 */}
        <DemoAccessPanel />

        {/* Enrolment & Account Notice (Requirement 7: No public sign-up for staff/admin; students register via enrolment) */}
        <div className="max-w-xl mx-auto mt-8 p-4 bg-white/70 rounded-md border border-line text-center space-y-1.5">
          <p className="text-xs font-semibold text-navy-900">
            First time logging in?
          </p>
          <p className="text-xs text-ink-soft leading-relaxed">
            Students receive login credentials automatically upon course enrolment.
            Staff and tutor accounts are issued by administrator invitation only.
          </p>
          <div className="pt-1">
            <Link
              href="/courses"
              className="text-xs font-semibold text-navy-900 hover:text-gold-700 underline inline-flex items-center gap-1"
            >
              <span>Explore accredited courses and enrol</span>
              <Icon name="arrow-right" size={12} />
            </Link>
          </div>
        </div>

        {/* Support & Need Help section */}
        <div className="max-w-xl mx-auto mt-8 pt-6 border-t border-line text-center space-y-2">
          <p className="text-xs font-semibold text-navy-900">
            Need help accessing your account?
          </p>
          <p className="text-xs text-ink-soft">
            Contact student support at{" "}
            <a
              href="mailto:info@smartmindstraining.co.uk"
              className="font-medium text-navy-900 underline hover:text-gold-700 inline-block whitespace-nowrap"
            >
              {siteConfig.contact.email}
            </a>{" "}
            or speak with an admissions advisor on WhatsApp:{" "}
            <a
              href={siteConfig.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-navy-900 underline hover:text-gold-700 inline-block whitespace-nowrap"
            >
              {siteConfig.contact.whatsappDisplay}
            </a>
          </p>
          <div className="pt-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-navy-900 transition-colors"
            >
              <Icon name="arrow-left" size={14} />
              <span>Return to College Homepage</span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
