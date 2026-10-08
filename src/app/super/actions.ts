"use server";

import { getServerSession } from "@/lib/session";
import { getEntitlementRepo } from "@/lib/repositories";
import { FeatureModuleKey } from "@/lib/repositories/types";
import { revalidatePath } from "next/cache";

export async function toggleEntitlementAction(
  moduleKey: FeatureModuleKey,
  enabled: boolean
) {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized: Active session required.");
  }
  const repo = getEntitlementRepo();
  await repo.updateEntitlement(session, moduleKey, enabled);
  revalidatePath("/super");
  revalidatePath("/admin");
  return { success: true };
}
