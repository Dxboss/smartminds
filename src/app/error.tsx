"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("[Smartminds App Error Caught]:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-paper px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-2xl border border-line p-8 text-center shadow-lg">
        <div className="w-14 h-14 rounded-full bg-navy-900/10 text-navy-900 flex items-center justify-center mx-auto mb-4">
          <Icon name="alert-circle" size={28} className="text-navy-900" />
        </div>

        <h1 className="font-heading text-2xl font-bold text-navy-900 mb-2">
          Something went wrong
        </h1>

        <p className="text-sm text-ink-soft leading-relaxed mb-6">
          An unexpected issue occurred while rendering this page. Our systems have logged this event.
        </p>

        {error?.digest && (
          <p className="text-[11px] font-mono text-ink-soft/70 bg-paper p-2 rounded-xs border border-line mb-6 break-all">
            Reference ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-navy-900 text-white font-heading font-bold text-sm hover:bg-navy-800 transition-all cursor-pointer shadow-xs"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-line bg-paper text-navy-900 font-heading font-semibold text-sm hover:border-navy-900/40 transition-all text-center"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
