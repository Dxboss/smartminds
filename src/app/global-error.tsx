"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Smartminds Global Error]:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF8F3] text-[#1B1B2B] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E6E1D5] p-8 text-center shadow-lg">
          <div className="w-14 h-14 rounded-full bg-[#23216B]/10 text-[#23216B] flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
            !
          </div>

          <h1 className="text-2xl font-bold text-[#23216B] mb-2 font-sans">
            Unable to display page
          </h1>

          <p className="text-sm text-[#5A5A6E] leading-relaxed mb-6 font-sans">
            A temporary system error occurred. Please try reloading or return to the homepage.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#23216B] text-white font-bold text-sm cursor-pointer shadow-xs"
            >
              Reload Page
            </button>
            <a
              href="/"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-[#E6E1D5] bg-[#FAF8F3] text-[#23216B] font-semibold text-sm text-center"
            >
              Return Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
