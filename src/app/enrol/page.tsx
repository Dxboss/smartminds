import { Metadata } from "next";
import { Suspense } from "react";
import { getServerSession } from "@/lib/session";
import { getLiveCourses, getCohortSchedule, pullLatestFromNeon } from "@/lib/persistedData";
import { EnrolmentClient } from "./EnrolmentClient";

export const metadata: Metadata = {
  title: "Enrol Now | Smartminds Training College",
  description:
    "Official student enrolment and course registration. Choose your payment option with 10% upfront savings or 0% interest monthly instalment plans.",
};


interface PageProps {
  searchParams: Promise<{
    course?: string;
    level?: string;
    mode?: "full" | "instalments";
    plan?: string;
    resume?: string;
    coupon?: string;
  }>;
}

export default async function EnrolPage({ searchParams }: PageProps) {
  try {
    await pullLatestFromNeon();
  } catch {}

  const params = await searchParams;
  const initialCourseId = params.course;
  const initialLevelLabel = params.level;
  const initialPaymentOption = params.mode;
  const initialPlanId = params.plan;
  const initialCouponCode = params.coupon;

  let resumedDraft: any = null;
  if (params.resume) {
    try {
      const { getCheckoutDraft } = await import("@/lib/abandonedCheckoutRecovery");
      resumedDraft = await getCheckoutDraft(params.resume);
    } catch {}
  }

  const session = await getServerSession();
  const allCourses = getLiveCourses();
  const publishedCourses = allCourses.filter((c) => c.published);
  const cohortSchedule = getCohortSchedule();

  return (
    <div className="bg-paper min-h-screen py-6">
      <Suspense fallback={<div className="max-w-4xl mx-auto p-12 text-center text-ink-soft">Loading enrolment form...</div>}>
        <EnrolmentClient
          courses={publishedCourses.length > 0 ? publishedCourses : allCourses}
          initialCourseId={resumedDraft?.courseId || initialCourseId}
          initialLevelLabel={resumedDraft?.levelLabel || initialLevelLabel}
          initialPaymentOption={resumedDraft?.paymentOption || initialPaymentOption}
          initialPlanId={resumedDraft?.planId || initialPlanId}
          initialCouponCode={resumedDraft?.couponCode || initialCouponCode}
          resumedDraft={resumedDraft}
          cohortSchedule={cohortSchedule}
          currentUser={
            session
              ? {
                  id: session.id,
                  name: session.name,
                  email: session.email,
                  role: session.role,
                  learnerId: session.learnerId,
                }
              : undefined
          }
        />
      </Suspense>
    </div>
  );
}
