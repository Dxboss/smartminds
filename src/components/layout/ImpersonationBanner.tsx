"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { SessionUser } from "@/lib/repositories/types";
import { Icon } from "@/components/ui/Icon";
import { stopImpersonationAction } from "@/app/super/actions";

interface ImpersonationBannerProps {
  user?: SessionUser | null;
}

export const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({ user }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!user?.isImpersonating) {
    return null;
  }

  const handleExit = () => {
    startTransition(async () => {
      try {
        const res = await stopImpersonationAction();
        if (res.redirectUrl) {
          router.push(res.redirectUrl);
          router.refresh();
        }
      } catch (err) {
        console.error("Failed to exit impersonation:", err);
      }
    });
  };

  return (
    <div
      role="alert"
      className="bg-amber-600 text-white px-4 py-2 text-xs font-medium sticky top-0 z-50 shadow-md flex flex-wrap items-center justify-between gap-3 border-b border-amber-700"
    >
      <div className="flex items-center gap-2.5">
        <span className="p-1 rounded bg-amber-800 text-white flex items-center justify-center">
          <Icon name="shield-check" size={14} />
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <strong className="uppercase tracking-wider text-[11px] bg-black/20 px-2 py-0.5 rounded font-bold">
            Impersonation Active
          </strong>
          <span>
            Viewing as <span className="font-bold underline">{user.name}</span> ({user.email} &bull; {user.role})
          </span>
          <span className="text-amber-200 text-[11px] hidden sm:inline">
            (Initiated by {user.impersonatorEmail || (user.originalRole === "owner_admin" ? "College Admin" : "Superadmin")})
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={isPending}
        onClick={handleExit}
        className="px-3 py-1 rounded bg-white text-amber-900 hover:bg-amber-50 font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
      >
        <Icon name="arrow-left" size={13} />
        <span>
          {isPending
            ? "Exiting..."
            : user.originalRole === "owner_admin"
            ? "Exit Impersonation & Return to Admin"
            : "Exit Impersonation & Return to Superadmin"}
        </span>
      </button>
    </div>
  );
};
