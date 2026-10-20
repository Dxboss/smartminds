import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "@/components/auth/LoginForm";
import { siteConfig } from "@/content/siteConfig";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Sign in | Smartminds Training College",
  description:
    "Sign in to your Smartminds Training College portal. Students, tutors and staff sign in here.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export const instant = false;

interface LoginPageProps {
  searchParams?: Promise<{ reason?: string; from?: string }>;
}

async function LoginContent({
  searchParams,
}: {
  searchParams?: Promise<{ reason?: string; from?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const reason = resolvedParams.reason;
  return <LoginForm reason={reason} />;
}

export default function LoginPage({
  searchParams,
}: LoginPageProps) {
  return (
    <div className="py-12 md:py-20 bg-paper/50 min-h-[calc(100vh-80px)] flex flex-col justify-center">
      <Container>
        {/* Page Header (PRD Section 3 & 12.1) */}
        <div className="max-w-xl mx-auto text-center mb-8 space-y-3">
          <div className="flex justify-center mb-1">
            <Link href="/" aria-label="Smartminds Training College Home" className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 rounded-sm">
              <img
                src="/images/logo-color.png"
                alt="Smartminds Training College"
                className="h-16 w-auto object-contain hover:scale-[1.02] transition-transform"
              />
            </Link>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-navy-900">
            Sign in
          </h1>
          <p className="text-base text-ink-soft">
            Students, tutors and college administrators sign in here.
          </p>
        </div>

        {/* Login Form Component with optional reason notice wrapped in Suspense */}
        <Suspense fallback={<LoginForm />}>
          <LoginContent searchParams={searchParams} />
        </Suspense>

        {/* Clean, discreet account & admissions assistance */}
        <div className="max-w-xl mx-auto mt-6 text-center space-y-2.5 text-xs text-ink-soft">
          <p>
            First time logging in? Account credentials are created upon enrolment.{" "}
            <Link
              href="/courses"
              className="font-semibold text-navy-900 hover:text-gold-700 underline inline-flex items-center gap-0.5 ml-1"
            >
              <span>Explore courses & enrol</span>
              <Icon name="arrow-right" size={11} />
            </Link>
          </p>

          <p>
            Need access help? Contact{" "}
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="font-medium text-navy-900 underline hover:text-gold-700 inline-block whitespace-nowrap"
            >
              {siteConfig.contact.email}
            </a>{" "}
            or speak with an advisor on WhatsApp:{" "}
            <a
              href={siteConfig.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-navy-900 underline hover:text-gold-700 inline-block whitespace-nowrap"
            >
              {siteConfig.contact.whatsappDisplay}
            </a>
          </p>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-navy-900 transition-colors"
            >
              <Icon name="arrow-left" size={13} />
              <span>Return to College Homepage</span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
