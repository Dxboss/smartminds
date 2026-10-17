import { Metadata } from "next";
import { Suspense } from "react";
import { getServerSession } from "@/lib/session";
import { getLiveCourses, getCohortSchedule } from "@/lib/persistedData";
import { EnrolmentClient } from "./EnrolmentClient";

export const metadata: Metadata = {
  title: "Enrol Now | Smartminds Training College",
  description:
    "Official student enrolment and course registration. Choose your payment option with 10% upfront savings or 0% interest monthly instalment plans.",
};

export const instant = false;

interface PageProps {
  searchParams: Promise<{
    course?: string;
    level?: string;
    mode?: "full" | "instalments";
    plan?: string;
  }>;
}

export default async function EnrolPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialCourseId = params.course;
  const initialLevelLabel = params.level;
  const initialPaymentOption = params.mode;
  const initialPlanId = params.plan;
  const session = await getServerSession();
  const allCourses = getLiveCourses();
  const publishedCourses = allCourses.filter((c) => c.published);
  const cohortSchedule = getCohortSchedule();

  return (
    <main className="bg-paper min-h-screen py-6">
      <Suspense fallback={<div className="max-w-4xl mx-auto p-12 text-center text-ink-soft">Loading enrolment form...</div>}>
        <EnrolmentClient
          courses={publishedCourses.length > 0 ? publishedCourses : allCourses}
          initialCourseId={initialCourseId}
          initialLevelLabel={initialLevelLabel}
          initialPaymentOption={initialPaymentOption}
          initialPlanId={initialPlanId}
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
    </main>
  );
}
