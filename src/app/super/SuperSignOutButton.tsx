"use client";

import React, { useState } from "react";
import { signOutUserAction } from "@/app/login/actions";
import { Icon } from "@/components/ui/Icon";

export const SuperSignOutButton: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signOutUserAction();
    } catch (err) {
      console.warn("[SuperSignOut] Error signing out:", err);
    }
    try {
      localStorage.removeItem("smartminds_auth_session_v1");
      window.dispatchEvent(new Event("smartminds_auth_updated"));
    } catch {}
    window.location.href = "/login";
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="px-3 py-1.5 rounded-sm bg-white/10 hover:bg-red-600/80 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20 hover:border-red-500 cursor-pointer disabled:opacity-50"
      title="Sign out of Super Admin Console"
    >
      <Icon name="arrow-right" size={13} className="rotate-180" />
      <span>{loading ? "Signing out..." : "Sign Out"}</span>
    </button>
  );
};
