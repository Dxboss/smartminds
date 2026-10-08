import React from "react";
import { getServerSession } from "@/lib/session";
import { getLearnerRepo } from "@/lib/repositories";
import { Icon } from "@/components/ui/Icon";

export default async function StudentProfilePage() {
  const session = await getServerSession();
  if (!session) return null;

  const learnerId = session.learnerId || "learner-001";
  const learnerRepo = getLearnerRepo();
  const learner = await learnerRepo.getLearnerById(session, learnerId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-md border border-line p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-navy-900/5 text-navy-900 text-xs font-semibold">
            <Icon name="user" size={14} />
            <span>Learner Profile</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
            Account & notifications
          </h1>
          <p className="text-sm text-ink-soft">
            Manage your student contact information and communication preferences.
          </p>
        </div>
      </div>

      {/* Profile Details Card */}
      <div className="bg-white rounded-md border border-line p-6 sm:p-8 space-y-6 shadow-sm">
        <h2 className="font-heading text-xl font-bold text-navy-900 border-b border-line pb-4">
          Personal & study information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div className="space-y-1 p-3.5 bg-paper rounded-sm border border-line">
            <span className="text-ink-soft block">Full Name</span>
            <span className="font-bold text-navy-900 text-sm block">
              {learner?.firstName} {learner?.lastName}
            </span>
          </div>

          <div className="space-y-1 p-3.5 bg-paper rounded-sm border border-line">
            <span className="text-ink-soft block">Email Address</span>
            <span className="font-bold text-navy-900 text-sm block">
              {learner?.email}
            </span>
          </div>

          <div className="space-y-1 p-3.5 bg-paper rounded-sm border border-line">
            <span className="text-ink-soft block">Contact Telephone</span>
            <span className="font-bold text-navy-900 text-sm block">
              {learner?.phone}
            </span>
          </div>

          <div className="space-y-1 p-3.5 bg-paper rounded-sm border border-line">
            <span className="text-ink-soft block">Learner Reference ID</span>
            <span className="font-mono font-bold text-navy-900 text-sm block">
              {learner?.id}
            </span>
          </div>

          <div className="space-y-1 p-3.5 bg-paper rounded-sm border border-line">
            <span className="text-ink-soft block">Study Access Status</span>
            <span className="font-bold text-emerald-800 text-sm block capitalize">
              {learner?.accessStatus === "active" ? "Active Enrolment" : "Access Paused"}
            </span>
          </div>

          <div className="space-y-1 p-3.5 bg-paper rounded-sm border border-line">
            <span className="text-ink-soft block">Enrolment Date</span>
            <span className="font-bold text-navy-900 text-sm block">
              {learner?.enrolmentDate ? new Date(learner.enrolmentDate).toLocaleDateString("en-GB") : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Notification Preferences Card */}
      <div className="bg-white rounded-md border border-line p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-1 border-b border-line pb-4">
          <h2 className="font-heading text-xl font-bold text-navy-900">
            Notification preferences
          </h2>
          <p className="text-xs text-ink-soft">
            Choose what alerts and announcements you receive from Smartminds Training College.
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-start gap-3 p-3.5 rounded-sm bg-paper border border-line cursor-pointer hover:bg-white transition-colors">
            <input
              type="checkbox"
              defaultChecked
              className="mt-1 h-4 w-4 rounded border-line text-navy-900 focus:ring-navy-900"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-navy-900 block">
                Live interactive class reminders
              </span>
              <p className="text-xs text-ink-soft">
                Receive an email notice with Zoom meeting room link 2 hours before each class session.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-sm bg-paper border border-line cursor-pointer hover:bg-white transition-colors">
            <input
              type="checkbox"
              defaultChecked
              className="mt-1 h-4 w-4 rounded border-line text-navy-900 focus:ring-navy-900"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-navy-900 block">
                Coursework deadline alerts
              </span>
              <p className="text-xs text-ink-soft">
                Get email notifications 48 hours prior to an assignment submission deadline.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-sm bg-paper border border-line cursor-pointer hover:bg-white transition-colors">
            <input
              type="checkbox"
              defaultChecked
              className="mt-1 h-4 w-4 rounded border-line text-navy-900 focus:ring-navy-900"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-navy-900 block">
                Assessor feedback and results publication
              </span>
              <p className="text-xs text-ink-soft">
                Receive instant alerts when your course tutor records criteria grading and comments.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-sm bg-paper border border-line cursor-pointer hover:bg-white transition-colors">
            <input
              type="checkbox"
              defaultChecked
              className="mt-1 h-4 w-4 rounded border-line text-navy-900 focus:ring-navy-900"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-navy-900 block">
                Payment plan instalment reminders
              </span>
              <p className="text-xs text-ink-soft">
                Receive scheduled payment notices 7 days before an instalment due date.
              </p>
            </div>
          </label>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-[11px] text-ink-soft">
            Preferences are saved automatically in demo mode.
          </span>
          <button
            type="button"
            className="px-4 py-2 rounded-sm bg-navy-900 text-white text-xs font-bold hover:bg-navy-700 transition-colors min-h-[44px]"
          >
            Save preferences
          </button>
        </div>
      </div>
    </div>
  );
}
