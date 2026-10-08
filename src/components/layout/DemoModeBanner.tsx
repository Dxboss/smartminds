"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signOutDemo } from "@/app/login/actions";
import { Icon } from "@/components/ui/Icon";
import { SessionUser } from "@/lib/repositories/types";

interface DemoModeBannerProps {
  user?: SessionUser | null;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({ user }) => {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOutDemo();
    router.push("/login");
  };

  return (
    <div className="w-full bg-navy-900 text-white text-xs px-4 py-2 border-b border-gold-500/30 flex flex-wrap items-center justify-between gap-3 shadow-sm z-50">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 font-semibold text-gold-300">
          <Icon name="sparkles" size={14} />
          <span>Demo: sample data</span>
        </span>
        <span className="text-white/40 hidden sm:inline">|</span>
        <span className="text-white/80 hidden sm:inline text-[11px]">
          Fictional prototype for client review. Real payments and personal data are disabled.
        </span>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <span className="text-white/90 text-[11px] font-medium hidden md:inline">
            Active session:{" "}
            <span className="text-gold-300 font-semibold">{user.name}</span>{" "}
            <span className="text-white/60">({user.role.replace("_", " ")})</span>
          </span>
        )}

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors disabled:opacity-50 min-h-[28px]"
        >
          <Icon name="log-out" size={12} />
          <span>{isSigningOut ? "Signing out..." : "Exit demo"}</span>
        </button>
      </div>
    </div>
  );
};
