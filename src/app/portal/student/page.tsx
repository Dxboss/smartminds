"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { PortalShell, PortalMenuItem } from "@/components/portal/PortalShell";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default function StudentPortalPage() {
  const { user, isAuthenticated, loginAs } = useAuth();
  const [activeSection, setActiveSection] = useState("classes");
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // If user is not logged in or in another role, give quick switcher banner
  if (!isAuthenticated || user?.role !== "student") {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-md border border-line text-center space-y-4 shadow-card">
          <div className="w-12 h-12 rounded-full bg-gold-300/30 text-navy-900 mx-auto flex items-center justify-center">
            <Icon name="graduation-cap" size={24} />
          </div>
          <h1 className="font-heading text-2xl font-bold uppercase text-navy-900">
            Learner Portal Access
          </h1>
          <p className="text-sm text-ink-soft">
            You are currently not logged in as an enrolled student.
          </p>
          <div className="pt-2 space-y-2">
            <Button
              variant="primary"
              fullWidth
              size="md"
              onClick={() => loginAs("student")}
            >
              1-Click Sign In as Sarah Jenkins (Student)
            </Button>
            <Link
              href="/login"
              className="block text-xs font-semibold text-ink-soft hover:text-navy-900 underline pt-2"
            >
              Go to standard login screen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const menuItems: PortalMenuItem[] = [
    {
      id: "classes",
      label: "Live Classes & Timetable",
      icon: "video",
      badge: "Today",
    },
    {
      id: "units",
      label: "Course Units & Assignments",
      icon: "book-open",
    },
    {
      id: "recordings",
      label: "Recorded Lectures Vault",
      icon: "clock",
    },
    {
      id: "instalments",
      label: "Tuition & Instalments",
      icon: "credit-card",
    },
  ];

  const courseUnits = [
    {
      code: "Unit 301",
      title: "Principles of Safeguarding and Protection in Health and Social Care",
      credits: 4,
      status: "passed",
      grade: "Distinction",
      feedback: "Exemplary understanding of safeguarding disclosure procedures.",
    },
    {
      code: "Unit 302",
      title: "Health, Safety and Risk Assessment in Adult Care Environments",
      credits: 5,
      status: "passed",
      grade: "Merit",
      feedback: "Strong risk mitigation matrices. Practical placement observations confirmed.",
    },
    {
      code: "Unit 303",
      title: "Duty of Care and Dilemmas in Healthcare Settings",
      credits: 3,
      status: "passed",
      grade: "Distinction",
      feedback: "Comprehensive ethical reasoning regarding confidentiality boundaries.",
    },
    {
      code: "Unit 304",
      title: "Person-Centred Assessment & Care Planning (Current Focus)",
      credits: 6,
      status: "in_progress",
      grade: "Pending Submission",
      feedback: "Draft assignment submission due Friday 17:00 GMT.",
    },
    {
      code: "Unit 305",
      title: "Understand the Role of the Adult Social Care Worker",
      credits: 4,
      status: "submitted",
      grade: "Awaiting Tutor Marking",
      feedback: "Submitted on Monday 14:15 GMT. Currently with Dr. Marcus Vance.",
    },
    {
      code: "Unit 306",
      title: "Promoting Equality, Diversity and Inclusion in Care Services",
      credits: 4,
      status: "upcoming",
      grade: "Scheduled Week 6",
      feedback: "Prerequisite: Completion of Unit 304.",
    },
  ];

  const recordings = [
    {
      id: "rec-01",
      title: "Unit 304: Person-Centred Care Planning & Choice Models",
      date: "05 Oct 2026",
      tutor: "Dr. Marcus Vance",
      duration: "1h 14m",
      slidesPdf: "unit-304-slides-lecture-01.pdf",
    },
    {
      id: "rec-02",
      title: "Unit 303: Whistleblowing & Safeguarding Case Law",
      date: "28 Sep 2026",
      tutor: "Dr. Marcus Vance",
      duration: "1h 22m",
      slidesPdf: "unit-303-slides-lecture-02.pdf",
    },
    {
      id: "rec-03",
      title: "Unit 302: COSHH & Workplace Risk Assessment in Care Homes",
      date: "21 Sep 2026",
      tutor: "Dr. Marcus Vance",
      duration: "58m",
      slidesPdf: "unit-302-slides-lecture-03.pdf",
    },
  ];

  const instalmentPlan = [
    { label: "Deposit (Course Acceptance)", amount: "£150.00", dueDate: "15 Jan 2026", status: "paid" },
    { label: "Instalment 1 of 6", amount: "£200.00", dueDate: "01 Feb 2026", status: "paid" },
    { label: "Instalment 2 of 6", amount: "£200.00", dueDate: "01 Mar 2026", status: "paid" },
    { label: "Instalment 3 of 6", amount: "£200.00", dueDate: "01 Apr 2026", status: "paid" },
    { label: "Instalment 4 of 6", amount: "£200.00", dueDate: "01 May 2026", status: "upcoming" },
    { label: "Instalment 5 of 6", amount: "£200.00", dueDate: "01 Jun 2026", status: "scheduled" },
    { label: "Instalment 6 of 6", amount: "£200.00", dueDate: "01 Jul 2026", status: "scheduled" },
  ];

  return (
    <PortalShell
      role="student"
      portalTitle="Learner Portal"
      portalSubtitle="Online Study Portal • Health & Social Care"
      menuItems={menuItems}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Course Progress & Welcome Card */}
        <div className="bg-navy-900 text-white rounded-md p-6 sm:p-8 shadow-card relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-gold-500/20 text-gold-300 text-xs font-bold uppercase tracking-wider">
                  <Icon name="check-circle" size={13} className="text-gold-300" />
                  <span>
                    {user?.accountType === "parent_guardian"
                      ? "Verified Parent Account • ID: SM-9281"
                      : "Verified Learner • ID: SM-9281"}
                  </span>
                </span>
                {user?.trainingLocation && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/10 text-white text-xs font-semibold">
                    <Icon name="map-pin" size={13} className="text-gold-300" />
                    <span>{user.trainingLocation} Campus</span>
                  </span>
                )}
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white">
                {user?.accountType === "parent_guardian"
                  ? `Parent Console: ${user?.name}`
                  : `Welcome back, ${user?.name}`}
              </h1>
              <p className="text-sm text-paper/80 max-w-2xl">
                {user?.accountType === "parent_guardian"
                  ? `Managing tuition & progress for ${user?.childName || "Your Child"} • `
                  : ""}
                {user?.enrolledCourse || "Level 3 Diploma in Adult Care (RQF)"} •{" "}
                <span className="text-gold-300">{user?.cohort || "Cohort March 2026"}</span> • TQUK Regulated
              </p>
            </div>

            {/* Academic Meter */}
            <div className="bg-navy-700/80 border border-navy-700 p-4 rounded-sm min-w-[240px] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-paper/80">Academic Progress</span>
                <span className="font-bold text-gold-300">68%</span>
              </div>
              <div className="w-full h-2 bg-navy-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-500 rounded-full transition-all"
                  style={{ width: "68%" }}
                />
              </div>
              <p className="text-[11px] text-paper/70">12 of 18 Guided Units Completed</p>
            </div>
          </div>
        </div>

        {/* SECTION 1: Live Classes & Timetable */}
        {activeSection === "classes" && (
          <div className="space-y-8">
            {/* Live Class Spotlight */}
            <div className="bg-white rounded-md border-2 border-gold-500/60 p-6 sm:p-8 shadow-card space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600" />
                  </span>
                  <span className="text-xs uppercase font-bold tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                    Live Session Today
                  </span>
                  <span className="text-xs text-ink-soft">18:30 – 20:00 GMT (90 Mins)</span>
                </div>

                <span className="text-xs font-semibold text-navy-900 bg-paper px-3 py-1 rounded border border-line">
                  Room: Virtual Lecture Hall B
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight text-navy-900">
                  Unit 304: Person-Centred Assessment & Care Planning
                </h2>
                <p className="text-base text-ink-soft max-w-3xl">
                  Interactive workshop focusing on practical scenario analysis, holistic need assessments, and care plan documentation for Adult Care inspection compliance.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-line text-sm text-ink-soft">
                <div className="flex items-center gap-2">
                  <Icon name="user" size={16} className="text-navy-900" />
                  <span>Lead Tutor: <strong>Dr. Marcus Vance</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="users" size={16} className="text-navy-900" />
                  <span>16 Learners attending</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setShowLiveModal(true)}
                  className="min-h-[46px] flex items-center gap-2"
                >
                  <Icon name="video" size={18} />
                  <span>Join Live Classroom</span>
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText?.("https://meet.smartmindstraining.co.uk/room/unit-304-sarah");
                    alert("Classroom link copied: https://meet.smartmindstraining.co.uk/room/unit-304-sarah");
                  }}
                  className="px-4 py-2.5 text-sm font-semibold rounded-sm border border-line bg-paper text-navy-900 hover:bg-white transition-colors min-h-[46px]"
                >
                  Copy Room Link
                </button>
              </div>
            </div>

            {/* Timetable List */}
            <div className="bg-white rounded-md border border-line p-6 shadow-subtle space-y-4">
              <h3 className="font-heading text-xl font-bold uppercase text-navy-900">
                Weekly Timetable
              </h3>
              <div className="divide-y divide-line">
                <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-navy-900">Thursday 09 Oct • 18:30 – 19:30 GMT</p>
                    <p className="text-xs text-ink-soft">Unit 304 Tutorial & Individual Assignment Q&A Surgery</p>
                  </div>
                  <span className="text-xs font-semibold text-navy-900 bg-paper px-2.5 py-1 rounded border border-line self-start sm:self-auto">
                    Optional 1-on-1 Surgery
                  </span>
                </div>
                <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-navy-900">Tuesday 14 Oct • 18:30 – 20:00 GMT</p>
                    <p className="text-xs text-ink-soft">Unit 305: Role of the Care Worker</p>
                  </div>
                  <span className="text-xs font-semibold text-navy-900 bg-paper px-2.5 py-1 rounded border border-line self-start sm:self-auto">
                    Scheduled Live Class
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Course Units & Assignments */}
        {activeSection === "units" && (
          <div className="space-y-8">
            <div className="bg-white rounded-md border border-line shadow-card overflow-hidden">
              <div className="p-6 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading text-2xl font-bold uppercase text-navy-900">
                    Guided Qualification Units
                  </h2>
                  <p className="text-xs text-ink-soft">
                    Level 3 Diploma in Adult Care (RQF) • Total credits: 58
                  </p>
                </div>
                <span className="text-xs font-bold text-navy-900 bg-gold-300/30 px-3 py-1 rounded border border-gold-500/30">
                  4 Units Passed • 1 Awaiting Mark • 1 In Progress
                </span>
              </div>

              <div className="divide-y divide-line">
                {courseUnits.map((unit) => (
                  <div key={unit.code} className="p-6 hover:bg-paper/30 transition-colors space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-heading font-bold text-lg text-navy-900">
                          {unit.code}
                        </span>
                        <span className="text-xs text-ink-soft bg-paper px-2 py-0.5 rounded border border-line">
                          {unit.credits} Credits
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded border ${
                          unit.status === "passed"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : unit.status === "in_progress"
                            ? "bg-gold-300/30 text-navy-900 border-gold-500/50"
                            : unit.status === "submitted"
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : "bg-paper text-ink-soft border-line"
                        }`}
                      >
                        {unit.grade}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-navy-900">{unit.title}</h3>
                    <p className="text-xs text-ink-soft bg-paper p-3 rounded-sm border border-line">
                      <strong>Assessor Note:</strong> {unit.feedback}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignment Submission Box */}
            <div className="bg-white rounded-md border border-line p-6 sm:p-8 shadow-card space-y-4">
              <h3 className="font-heading text-xl font-bold uppercase text-navy-900">
                Submit Assignment for Unit 304
              </h3>
              <p className="text-sm text-ink-soft">
                Upload your completed care plan assessment case study (PDF or DOCX format).
              </p>

              {assignmentSubmitted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm text-sm text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <Icon name="check-circle" size={18} className="text-emerald-700" />
                    <span>Assignment successfully submitted for grading!</span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    Your assessor Dr. Marcus Vance has been notified.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="border-2 border-dashed border-line hover:border-gold-500 rounded-sm p-6 text-center bg-paper cursor-pointer transition-colors">
                    <Icon name="download" size={28} className="text-navy-900 mx-auto mb-2 rotate-180" />
                    <p className="text-sm font-semibold text-navy-900">
                      Drag & drop assignment file here, or click to browse
                    </p>
                    <p className="text-xs text-ink-soft mt-1">
                      Accepted: Unit304_SarahJenkins_v1.pdf or .docx
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="student-notes" className="text-xs font-semibold text-navy-900">
                      Optional notes for your tutor
                    </label>
                    <textarea
                      id="student-notes"
                      rows={3}
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      placeholder="e.g. Please refer to Section 3 for my observation log."
                      className="w-full p-3 text-sm bg-paper border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                    />
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setAssignmentSubmitted(true)}
                  >
                    Submit Assignment to Tutor
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 3: Recorded Lectures Vault */}
        {activeSection === "recordings" && (
          <div className="space-y-6">
            <div className="bg-white rounded-md border border-line p-6 shadow-card space-y-2">
              <h2 className="font-heading text-2xl font-bold uppercase text-navy-900">
                Recorded Classroom Video Vault
              </h2>
              <p className="text-sm text-ink-soft">
                Missed a live class or want to review? Stream past sessions at 1080p with lecture slides.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recordings.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white rounded-md border border-line p-5 shadow-subtle flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div
                      className="aspect-video bg-navy-900 rounded-sm flex items-center justify-center relative group overflow-hidden cursor-pointer"
                      onClick={() => setSelectedVideo(rec.title)}
                    >
                      <div className="w-12 h-12 rounded-full bg-gold-500 text-navy-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 ml-1 fill-current" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/70 text-white px-1.5 py-0.5 rounded">
                        {rec.duration}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-ink-soft pt-1">
                      <span>{rec.date}</span>
                      <span>{rec.tutor}</span>
                    </div>
                    <h3 className="text-sm font-bold text-navy-900 leading-snug">{rec.title}</h3>
                  </div>

                  <div className="pt-2 border-t border-line flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedVideo(rec.title)}
                      className="text-xs font-bold text-navy-900 hover:text-gold-700 underline flex items-center gap-1"
                    >
                      <Icon name="video" size={14} />
                      <span>Watch Replay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => alert(`Downloading slides: ${rec.slidesPdf}`)}
                      className="text-xs text-ink-soft hover:text-navy-900 flex items-center gap-1"
                      title="Download Slides PDF"
                    >
                      <Icon name="download" size={13} />
                      <span>Slides (.PDF)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: Tuition & Instalments */}
        {activeSection === "instalments" && (
          <div className="bg-white rounded-md border border-line p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-bold uppercase text-navy-900">
                  Tuition & Payment Plan Ledger
                </h2>
                <p className="text-xs text-ink-soft">
                  6-Month Flexible Payment Schedule • Total Course Fee: £1,350.00
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert("Downloading official VAT tuition payment receipt (PDF)")}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-navy-900 bg-paper border border-line rounded-sm hover:bg-white transition-colors self-start sm:self-auto"
              >
                <Icon name="download" size={15} />
                <span>Download VAT Receipt</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-paper p-4 rounded-sm border border-line">
                <p className="text-xs text-ink-soft">Total Paid to Date</p>
                <p className="text-2xl font-heading font-bold text-navy-900">£750.00</p>
                <span className="text-[11px] text-emerald-700 font-semibold">Deposit + 3 Instalments</span>
              </div>
              <div className="bg-paper p-4 rounded-sm border border-line">
                <p className="text-xs text-ink-soft">Next Payment Due</p>
                <p className="text-2xl font-heading font-bold text-navy-900">£200.00</p>
                <span className="text-[11px] text-amber-700 font-semibold">Due 01 May 2026</span>
              </div>
              <div className="bg-paper p-4 rounded-sm border border-line">
                <p className="text-xs text-ink-soft">Remaining Balance</p>
                <p className="text-2xl font-heading font-bold text-navy-900">£600.00</p>
                <span className="text-[11px] text-ink-soft font-semibold">3 Instalments Remaining</span>
              </div>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs font-bold uppercase text-navy-900 bg-paper/50">
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {instalmentPlan.map((item, idx) => (
                    <tr key={idx} className="hover:bg-paper/30">
                      <td className="py-3 px-4 font-semibold text-navy-900">{item.label}</td>
                      <td className="py-3 px-4 font-bold text-navy-900">{item.amount}</td>
                      <td className="py-3 px-4 text-ink-soft">{item.dueDate}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded border uppercase ${
                            item.status === "paid"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : item.status === "upcoming"
                              ? "bg-amber-50 text-amber-900 border-amber-200"
                              : "bg-paper text-ink-soft border-line"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Live Classroom Modal */}
      {showLiveModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-navy-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-md border border-line shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-navy-900 font-bold font-heading text-xl uppercase">
                <Icon name="video" size={22} className="text-red-600" />
                <span>Virtual Classroom</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLiveModal(false)}
                className="p-1 text-ink-soft hover:text-navy-900"
                aria-label="Close live room window"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="p-4 bg-paper rounded-sm border border-line space-y-2">
              <p className="text-xs uppercase font-bold text-navy-900">Current Session</p>
              <p className="text-sm font-bold text-navy-900">Unit 304: Person-Centred Assessment & Care Planning</p>
              <p className="text-xs text-ink-soft">Tutor: Dr. Marcus Vance • Audio & Video Ready</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={() => {
                  window.open("https://meet.google.com/new", "_blank");
                  setShowLiveModal(false);
                }}
              >
                Launch Room in New Tab
              </Button>
              <Button variant="outline" size="md" onClick={() => setShowLiveModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Replay Modal */}
      {selectedVideo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-navy-900/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-md border border-line shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg uppercase text-navy-900">
                {selectedVideo}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="p-1 text-ink-soft hover:text-navy-900"
                aria-label="Close replay modal"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="aspect-video bg-navy-900 rounded-sm flex flex-col items-center justify-center text-white p-6 text-center space-y-3">
              <Icon name="video" size={40} className="text-gold-500 animate-pulse" />
              <p className="font-heading text-lg font-bold">1080p Lecture Playback</p>
              <p className="text-xs text-paper/70">
                Speed controls & closed captions ready.
              </p>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedVideo(null)}>
                Close Player
              </Button>
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
