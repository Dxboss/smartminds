import React from "react";
import { getServerSession } from "@/lib/session";
import { ImpersonationBanner } from "./ImpersonationBanner";

export async function ImpersonationBannerSlot() {
  try {
    const session = await getServerSession();
    if (!session?.isImpersonating) return null;
    return <ImpersonationBanner user={session} />;
  } catch {
    return null;
  }
}
