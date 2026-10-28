import React from "react";
import Link from "next/link";
import { getServerSession } from "@/lib/session";
import { getCohortsForTutor, pullLatestFromNeon, syncPersistedRecords } from "@/lib/persistedData";
import { CreateAssignmentForm } from "@/components/staff/CreateAssignmentForm";
import { Icon } from "@/components/ui/Icon";


export default async function NewAssignmentPage() {
  const session = await getServerSession();
  if (!session) return null;

  await pullLatestFromNeon();
  syncPersistedRecords(false);

  const myClasses = getCohortsForTutor(session);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link
          href="/staff/assignments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-navy-900 transition-colors"
        >
          <Icon name="arrow-left" size={14} />
          <span>Back to assignments queue</span>
        </Link>
      </div>

      <div className="bg-white rounded-md border border-line p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-1 border-b border-line pb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-navy-900/5 text-navy-900 text-xs font-semibold">
            <Icon name="file-text" size={14} />
            <span>Coursework Publisher</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy-900">
            Publish coursework assignment
          </h1>
          <p className="text-sm text-ink-soft">
            Set unit briefs, instructions, and deadlines for your teaching cohorts.
          </p>
        </div>

        <CreateAssignmentForm classes={myClasses} />
      </div>
    </div>
  );
}
