import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "@/components/auth/LoginForm";
import { siteConfig } from "@/content/siteConfig";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "College Portal Login | Student & Staff Access",
  description:
    "Log in to your Smartminds Training College portal. Access live online classrooms, course units, tutor marking feedback, and administrative tools.",
};

export default function LoginPage() {
  return (
    <div className="py-12 md:py-20 bg-paper/50">
      <Container>
        {/* Page Header */}
        <div className="max-w-xl mx-auto text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-gold-300/30 border border-gold-500/30 text-navy-900 text-xs font-bold uppercase tracking-wider">
            <Icon name="graduation-cap" size={14} className="text-navy-900" />
            <span>Smartminds Virtual College Campus</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold uppercase tracking-tight text-navy-900">
            Student & Staff Login
          </h1>
          <p className="text-base text-ink-soft">
            Sign in to access your live classes, timetable, course materials, or faculty dashboard.
          </p>
        </div>

        {/* Login Form Component */}
        <LoginForm />

        {/* Support & Need Help section */}
        <div className="max-w-xl mx-auto mt-12 pt-8 border-t border-line text-center space-y-2">
          <p className="text-sm font-semibold text-navy-900">
            Need help accessing your student or tutor account?
          </p>
          <p className="text-sm text-ink-soft">
            Contact student support at{" "}
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="font-medium text-navy-900 underline hover:text-gold-700"
            >
              {siteConfig.contact.email}
            </a>{" "}
            or speak with an admissions advisor on WhatsApp:{" "}
            <a
              href={siteConfig.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-navy-900 underline hover:text-gold-700"
            >
              {siteConfig.contact.whatsappDisplay}
            </a>
          </p>
          <div className="pt-4">
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
