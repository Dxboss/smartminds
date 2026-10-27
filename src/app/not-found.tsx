import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-paper px-4 py-16">
      <Container>
        <div className="max-w-md mx-auto bg-white rounded-md border border-line p-8 text-center shadow-sm space-y-5">
          <div className="w-14 h-14 rounded-full bg-navy-900/5 text-navy-900 flex items-center justify-center mx-auto">
            <Icon name="compass" size={28} className="text-navy-900" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-gold-700 bg-gold-500/10 px-2.5 py-1 rounded-sm inline-block">
              404 Error
            </span>
            <h1 className="font-heading text-3xl font-bold text-navy-900">
              Page not found
            </h1>
            <p className="text-sm text-ink-soft leading-relaxed">
              The page you are looking for doesn't exist, has been relocated, or is temporarily unavailable.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-sm bg-navy-900 text-white text-xs font-semibold hover:bg-navy-700 transition-colors shadow-sm inline-flex items-center justify-center gap-1.5"
            >
              <Icon name="home" size={14} />
              <span>Return to homepage</span>
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-5 py-2.5 rounded-sm border border-line bg-paper text-navy-900 text-xs font-semibold hover:border-navy-900 transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Icon name="user" size={14} />
              <span>Sign in to portal</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-line/60">
            <Link
              href="/courses"
              className="text-xs font-semibold text-navy-900 hover:text-gold-700 underline inline-flex items-center gap-1"
            >
              <span>Explore all accredited courses</span>
              <Icon name="arrow-right" size={12} />
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
