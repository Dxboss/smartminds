import { NextRequest, NextResponse } from "next/server";
import {
  createCohortAction,
  updateCohortAction,
  deleteCohortAction,
  updateCohortScheduleAdminAction,
  updateAvailabilityRulesAction,
  toggleBlockedDayAction,
} from "@/app/admin/actions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body || {};

    switch (action) {
      case "create_cohort": {
        const res = await createCohortAction(payload);
        return NextResponse.json(res);
      }
      case "update_cohort": {
        const res = await updateCohortAction(payload.cohortId, payload.updates);
        return NextResponse.json(res);
      }
      case "delete_cohort": {
        const res = await deleteCohortAction(payload.cohortId);
        return NextResponse.json(res);
      }
      case "update_schedule": {
        const res = await updateCohortScheduleAdminAction(payload.schedule);
        return NextResponse.json(res);
      }
      case "update_rules": {
        const res = await updateAvailabilityRulesAction(payload.rules);
        return NextResponse.json(res);
      }
      case "toggle_blocked_day": {
        const res = await toggleBlockedDayAction(payload.date, payload.reason);
        return NextResponse.json(res);
      }
      default:
        return NextResponse.json(
          { success: false, error: `Unknown cohort action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to process cohort request";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

