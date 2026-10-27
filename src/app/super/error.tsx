"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export default function SuperAdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Super Admin Error Caught]:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white rounded-md border border-line p-8 shadow-sm">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <Icon name="alert-circle" size={24} />
          <h2 className="font-heading text-xl font-bold text-navy-900">
            Super Admin Console Render Notice
          </h2>
        </div>

        <p className="text-xs text-ink-soft mb-4">
          The console encountered a non-critical error while loading external database records:
        </p>

        <div className="bg-paper p-3 rounded-sm border border-line text-[11px] font-mono text-ink-soft mb-6 break-all">
          {error.message || "Unknown rendering error occurred"}
          {error.digest && (
            <div className="mt-1 text-[10px] text-ink-soft/70">
              Digest: {error.digest}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 rounded-sm bg-navy-900 hover:bg-navy-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Retry Console
          </button>
          <Link
            href="/admin"
            className="px-4 py-2 rounded-sm border border-line bg-paper text-navy-900 text-xs font-semibold hover:border-navy-900/40 transition-colors"
          >
            Go to College Admin
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-sm border border-line bg-paper text-ink-soft text-xs font-semibold hover:text-navy-900 transition-colors"
          >
            College Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
