"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top of page"
      className={`fixed z-40 flex items-center justify-center w-11 h-11 rounded-full bg-[#0B4D4E] hover:bg-[#073b3c] text-white shadow-xl border border-white/20 transition-all duration-300 cursor-pointer bottom-20 right-4 md:bottom-8 md:right-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722] ${
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto hover:scale-110 active:scale-95"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <Icon name="chevron-up" size={20} className="stroke-[2.5]" />
    </button>
  );
};
