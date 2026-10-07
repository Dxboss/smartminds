"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface Submission {
  id: string;
  studentName: string;
  unitCode: string;
  unitTitle: string;
  submittedDate: string;
  fileName: string;
  status: "pending" | "graded";
  grade?: string;
  feedback?: string;
}

export default function TutorPortalPage() {
  const { user, isAuthenticated, loginAs } = useAuth();
  const [activeTab, setActiveTab] = useState<"timetable" | "roster" | "grading" | "announcements">("grading");
  const [selectedCohort, setSelectedCohort] = useState("cohort-mar-2026");

  // Grading queue state
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: "sub-01",
      studentName: "Sarah Jenkins",
      unitCode: "Unit 305",
      unitTitle: "Understand the Role of the Adult Social Care Worker",
      submittedDate: "Yesterday at 14:15",
      fileName: "SarahJenkins_Unit305_Submission.pdf",
      status: "pending",
    },
    {
      id: "sub-02",
      studentName: "Michael Davies",
      unitCode: "Unit 304",
      unitTitle: "Person-Centred Assessment & Care Planning Case Study",
      submittedDate: "05 Oct 2026",
      fileName: "MDavies_Unit304_Report.docx",
      status: "pending",
    },
    {
      id: "sub-03",
      studentName: "Priya Sharma",
      unitCode: "Unit 306",
      unitTitle: "Promoting Equality, Diversity and Inclusion in Care Services",
      submittedDate: "04 Oct 2026",
      fileName: "P_Sharma_Unit306_EDI_Portfolio.pdf",
      status: "pending",
    },
  ]);

  const [activeGradingSub, setActiveGradingSub] = useState<Submission | null>(submissions[0]);
  const [gradingScore, setGradingScore] = useState<"Pass" | "Merit" | "Distinction" | "Resubmit">("Distinction");
  const [gradingFeedback, setGradingFeedback] = useState(
    "Excellent analysis of safeguarding disclosure policies. The workplace examples cited reflect thorough understanding of CQC regulatory guidelines."
  );
  const [gradingSuccessMessage, setGradingSuccessMessage] = useState("");

  // Roster search
  const [rosterSearch, setRosterSearch] = useState("");

  // If user is not logged in or in another role, give quick switcher banner
  if (!isAuthenticated || user?.role !== "staff") {
    return (
      <div className="min-h-screen bg-paper flex flex-col">
        <PortalHeader
          portalRole="staff"
          portalTitle="Tutor Console"
          subtitle="Smartminds Academic Faculty"
        />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white p-8 rounded-md border border-line text-center space-y-4 shadow-card">
            <div className="w-12 h-12 rounded-full bg-navy-900 text-white mx-auto flex items-center justify-center">
              <Icon name="graduation-cap" size={24} />
            </div>
            <h1 className="font-heading text-2xl font-bold uppercase text-navy-900">
              Tutor Console Access
            </h1>
            <p className="text-sm text-ink-soft">
              You are currently not logged in as a faculty tutor or assessor.
            </p>
            <div className="pt-2 space-y-2">
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={() => loginAs("staff")}
              >
                1-Click Sign In as Dr. Marcus Vance (Tutor)
              </Button>
              <Link
                href="/login"
                className="block text-xs font-semibold text-ink-soft hover:text-navy-900 underline pt-2"
              >
                Go to standard login screen
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGradingSub) return;

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === activeGradingSub.id
          ? {
              ...s,
              status: "graded",
              grade: gradingScore,
              feedback: gradingFeedback,
            }
          : s
      )
    );

    setGradingSuccessMessage(`Grade (${gradingScore}) successfully recorded for ${activeGradingSub.studentName}. Learner notified.`);
    setTimeout(() => {
      setGradingSuccessMessage("");
      // Pick next pending submission
      const nextPending = submissions.find((s) => s.id !== activeGradingSub.id && s.status === "pending");
      setActiveGradingSub(nextPending || null);
    }, 2000);
  };

  const learners = [
    {
      id: "LRN-01",
      name: "Sarah Jenkins",
      course: "Level 3 Adult Care",
      progress: "68%",
      completedUnits: "12 / 18",
      attendance: "94%",
      lastActive: "Today (14:15)",
      status: "On Track",
    },
    {
      id: "LRN-02",
      name: "Michael Davies",
      course: "Level 3 Adult Care",
      progress: "55%",
      completedUnits: "10 / 18",
      attendance: "88%",
      lastActive: "Yesterday",
      status: "On Track",
    },
    {
      id: "LRN-03",
      name: "Priya Sharma",
      course: "Level 3 Adult Care",
      progress: "82%",
      completedUnits: "15 / 18",
      attendance: "100%",
      lastActive: "2 hours ago",
      status: "Excelling",
    },
    {
      id: "LRN-04",
      name: "James Wilson",
      course: "Level 3 Adult Care",
      progress: "44%",
      completedUnits: "8 / 18",
      attendance: "72%",
      lastActive: "4 days ago",
      status: "Needs Attention",
    },
    {
      id: "LRN-05",
      name: "Emma Thornton",
      course: "Level 3 Adult Care",
      progress: "61%",
      completedUnits: "11 / 18",
      attendance: "90%",
      lastActive: "Today (11:00)",
      status: "On Track",
    },
  ];

  const filteredLearners = learners.filter(
    (l) =>
      l.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      l.status.toLowerCase().includes(rosterSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <PortalHeader
        portalRole="staff"
        portalTitle="Tutor Console"
        subtitle="Faculty Assessment & Virtual Classrooms"
      />

      <main className="flex-1 py-8">
        <Container>
          {/* Tutor Faculty Banner */}
          <div className="bg-navy-900 text-white rounded-md p-6 sm:p-8 shadow-card mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-gold-500/20 text-gold-300 text-xs font-bold uppercase tracking-wider">
                  <Icon name="check-circle" size={13} className="text-gold-300" />
                  <span>Lead Assessor • Health & Social Care Faculty</span>
                </div>
                <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white">
                  Welcome, {user?.name}
                </h1>
                <p className="text-sm text-paper/80">
                  Managing live cohorts, assignment submissions, and guided learning hours verification.
                </p>
              </div>

              {/* Cohort Switcher */}
              <div className="bg-navy-700/80 border border-navy-700 p-4 rounded-sm min-w-[260px] space-y-2">
                <label htmlFor="cohort-select" className="text-xs font-semibold text-paper/80 block">
                  Active Teaching Cohort
                </label>
                <select
                  id="cohort-select"
                  value={selectedCohort}
                  onChange={(e) => setSelectedCohort(e.target.value)}
                  className="w-full bg-navy-900 text-white border border-navy-700 text-sm rounded p-2 focus:ring-1 focus:ring-gold-500"
                >
                  <option value="cohort-mar-2026">Cohort March 2026 (16 Students)</option>
                  <option value="cohort-jan-2026">Cohort January 2026 (14 Students)</option>
                  <option value="cohort-oct-2025">Cohort October 2025 (Graduating)</option>
                </select>
                <p className="text-[11px] text-gold-300 font-medium">
                  {submissions.filter((s) => s.status === "pending").length} assignments pending review
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-line mb-8 overflow-x-auto pb-1" role="tablist">
            {[
              { id: "grading" as const, label: "Assignment Grading Queue", icon: "file-text" as const },
              { id: "timetable" as const, label: "Teaching Timetable & Live Rooms", icon: "video" as const },
              { id: "roster" as const, label: "Student Roster & Progress", icon: "users" as const },
              { id: "announcements" as const, label: "Cohort Announcements", icon: "bell" as const },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold whitespace-nowrap rounded-t-sm border-b-2 transition-all min-h-[44px] ${
                    isSelected
                      ? "border-navy-900 text-navy-900 bg-white font-bold"
                      : "border-transparent text-ink-soft hover:text-navy-900 hover:bg-white/50"
                  }`}
                >
                  <Icon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                  {tab.id === "grading" && submissions.filter((s) => s.status === "pending").length > 0 && (
                    <span className="ml-1 text-[11px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded-full">
                      {submissions.filter((s) => s.status === "pending").length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: Grading Queue */}
          {activeTab === "grading" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Submission Queue List (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-md border border-line p-5 shadow-subtle">
                  <h2 className="font-heading text-xl font-bold uppercase text-navy-900">
                    Awaiting Assessor Review ({submissions.filter((s) => s.status === "pending").length})
                  </h2>
                  <p className="text-xs text-ink-soft mt-1">
                    Select a student submission to open the grading rubric and provide feedback.
                  </p>
                </div>

                <div className="space-y-3">
                  {submissions.map((sub) => {
                    const isSelected = activeGradingSub?.id === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setActiveGradingSub(sub);
                          setGradingSuccessMessage("");
                        }}
                        className={`w-full text-left p-4 rounded-md border transition-all ${
                          isSelected
                            ? "bg-white border-navy-900 shadow-md ring-1 ring-navy-900"
                            : "bg-white border-line hover:border-navy-900/40 shadow-subtle"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-navy-900">
                            {sub.studentName}
                          </span>
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                              sub.status === "pending"
                                ? "bg-amber-50 text-amber-900 border-amber-200"
                                : "bg-emerald-50 text-emerald-800 border-emerald-200"
                            }`}
                          >
                            {sub.status === "pending" ? "Pending" : sub.grade}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-navy-900 mt-1">
                          {sub.unitCode}: {sub.unitTitle}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-ink-soft mt-2 pt-2 border-t border-line">
                          <span>{sub.fileName}</span>
                          <span>{sub.submittedDate}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grading Workspace (7 cols) */}
              <div className="lg:col-span-7">
                {activeGradingSub ? (
                  <div className="bg-white rounded-md border border-line p-6 sm:p-8 shadow-card space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-line gap-2">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gold-700 bg-gold-300/30 px-2 py-0.5 rounded border border-gold-500/30">
                          {activeGradingSub.unitCode} Assessment
                        </span>
                        <h3 className="font-heading text-2xl font-bold uppercase text-navy-900 mt-1">
                          {activeGradingSub.studentName}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => alert(`Simulating file download: ${activeGradingSub.fileName}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-navy-900 bg-paper border border-line rounded-sm hover:bg-white self-start sm:self-auto"
                      >
                        <Icon name="download" size={14} />
                        <span>Download Student File</span>
                      </button>
                    </div>

                    {gradingSuccessMessage && (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm text-sm text-emerald-900 flex items-center gap-2">
                        <Icon name="check-circle" size={18} className="text-emerald-700" />
                        <span>{gradingSuccessMessage}</span>
                      </div>
                    )}

                    <form onSubmit={handleGradeSubmit} className="space-y-5">
                      {/* Grade Selector */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-navy-900 block">
                          Official Award Decision
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {(["Pass", "Merit", "Distinction", "Resubmit"] as const).map((grade) => (
                            <button
                              key={grade}
                              type="button"
                              onClick={() => setGradingScore(grade)}
                              className={`py-2 px-3 text-xs font-bold rounded-sm border transition-all ${
                                gradingScore === grade
                                  ? grade === "Resubmit"
                                    ? "bg-red-50 text-red-900 border-red-500 ring-1 ring-red-500"
                                    : "bg-navy-900 text-white border-navy-900 ring-1 ring-navy-900"
                                  : "bg-paper text-navy-900 border-line hover:bg-white"
                              }`}
                            >
                              {grade}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Assessor Feedback Textarea */}
                      <div className="space-y-1.5">
                        <label htmlFor="tutor-feedback" className="text-sm font-semibold text-navy-900 block">
                          Assessor Feedback & Formative Comments
                        </label>
                        <textarea
                          id="tutor-feedback"
                          rows={6}
                          value={gradingFeedback}
                          onChange={(e) => setGradingFeedback(e.target.value)}
                          required
                          className="w-full p-3.5 text-sm bg-paper border border-line rounded-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 transition-colors"
                        />
                        <p className="text-xs text-ink-soft">
                          Visible to learner immediately upon submission. Automatically recorded into the college assessment tracker for external moderation.
                        </p>
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <Button
                          type="submit"
                          variant="primary"
                          size="md"
                          className="min-h-[44px]"
                        >
                          Submit Grade & Notify Learner
                        </Button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="bg-white rounded-md border border-line p-12 text-center text-ink-soft">
                    <Icon name="check-circle" size={32} className="text-emerald-600 mx-auto mb-2" />
                    <p className="font-heading font-bold text-lg text-navy-900">Queue Clear</p>
                    <p className="text-sm">All student submissions for this cohort have been assessed.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Teaching Timetable & Live Rooms */}
          {activeTab === "timetable" && (
            <div className="space-y-6">
              <div className="bg-white rounded-md border-2 border-gold-500/60 p-6 sm:p-8 shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded">
                      Live Class Today • 18:30 GMT
                    </span>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-navy-900">
                      Unit 304: Person-Centred Assessment & Care Planning
                    </h2>
                    <p className="text-sm text-ink-soft">
                      Cohort March 2026 • 16 Learners Registered • 90 Minutes Guided Learning
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      window.open("https://meet.google.com/new", "_blank");
                    }}
                    className="min-h-[46px] flex items-center gap-2 self-start sm:self-auto"
                  >
                    <Icon name="video" size={18} />
                    <span>Launch Live Class Room</span>
                  </Button>
                </div>

                <div className="pt-3 border-t border-line flex flex-wrap gap-4 text-xs text-ink-soft">
                  <span>Room ID: <strong>SM-LIVE-304</strong></span>
                  <span>Passcode: <strong>ADULTCARE26</strong></span>
                  <span>Audio/Video: <strong>HD 1080p Stream</strong></span>
                </div>
              </div>

              {/* Upcoming Weekly Schedule */}
              <div className="bg-white rounded-md border border-line p-6 shadow-subtle space-y-4">
                <h3 className="font-heading text-xl font-bold uppercase text-navy-900">
                  Scheduled Sessions This Week
                </h3>
                <div className="divide-y divide-line">
                  <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-navy-900">Thursday 09 Oct • 18:30 – 19:30 GMT</p>
                      <p className="text-xs text-ink-soft">Unit 304 Tutorial & Individual Assignment Surgery</p>
                    </div>
                    <span className="text-xs text-navy-900 bg-paper px-3 py-1 rounded border border-line self-start sm:self-auto">
                      1-on-1 Office Hours
                    </span>
                  </div>
                  <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-navy-900">Tuesday 14 Oct • 18:30 – 20:00 GMT</p>
                      <p className="text-xs text-ink-soft">Unit 305: Understanding the Role of the Adult Social Care Worker</p>
                    </div>
                    <span className="text-xs text-navy-900 bg-paper px-3 py-1 rounded border border-line self-start sm:self-auto">
                      Scheduled Cohort Lecture
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Student Roster & Progress */}
          {activeTab === "roster" && (
            <div className="space-y-6">
              <div className="bg-white rounded-md border border-line p-6 shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-heading text-2xl font-bold uppercase text-navy-900">
                      Enrolled Learners Roster
                    </h2>
                    <p className="text-xs text-ink-soft">
                      Cohort March 2026 • Monitoring academic engagement & unit completions
                    </p>
                  </div>

                  <div className="relative min-w-[240px]">
                    <input
                      type="text"
                      value={rosterSearch}
                      onChange={(e) => setRosterSearch(e.target.value)}
                      placeholder="Search student or status..."
                      className="w-full pl-9 pr-3.5 py-2 text-sm bg-paper border border-line rounded-sm focus:outline-none focus:ring-1 focus:ring-navy-900"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-soft">
                      <Icon name="search" size={15} />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line text-xs font-bold uppercase text-navy-900 bg-paper/50">
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Progress</th>
                        <th className="py-3 px-4">Units Passed</th>
                        <th className="py-3 px-4">Attendance</th>
                        <th className="py-3 px-4">Last Active</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {filteredLearners.map((lrn) => (
                        <tr key={lrn.id} className="hover:bg-paper/30">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-navy-900">{lrn.name}</p>
                            <p className="text-xs text-ink-soft">{lrn.id}</p>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-navy-900">{lrn.progress}</td>
                          <td className="py-3.5 px-4 text-ink-soft">{lrn.completedUnits}</td>
                          <td className="py-3.5 px-4 font-semibold text-navy-900">{lrn.attendance}</td>
                          <td className="py-3.5 px-4 text-ink-soft text-xs">{lrn.lastActive}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase ${
                                lrn.status === "Excelling"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : lrn.status === "On Track"
                                  ? "bg-blue-50 text-blue-800 border-blue-200"
                                  : "bg-red-50 text-red-800 border-red-200"
                              }`}
                            >
                              {lrn.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Cohort Announcements */}
          {activeTab === "announcements" && (
            <div className="bg-white rounded-md border border-line p-6 sm:p-8 shadow-card space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold uppercase text-navy-900">
                  Broadcast Announcement to Cohort
                </h2>
                <p className="text-sm text-ink-soft">
                  Posts updates to all enrolled learners in Cohort March 2026.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="announcement-title" className="text-sm font-semibold text-navy-900 block">
                    Announcement Title
                  </label>
                  <input
                    id="announcement-title"
                    type="text"
                    defaultValue="Reminder: Unit 304 Case Study Submissions due this Friday"
                    className="w-full p-3 text-sm bg-paper border border-line rounded-sm focus:outline-none focus:ring-1 focus:ring-navy-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="announcement-body" className="text-sm font-semibold text-navy-900 block">
                    Message Body
                  </label>
                  <textarea
                    id="announcement-body"
                    rows={4}
                    defaultValue="Please make sure your observation sign-off sheets from your workplace supervisor are attached in the appendix before final submission."
                    className="w-full p-3 text-sm bg-paper border border-line rounded-sm focus:outline-none focus:ring-1 focus:ring-navy-900"
                  />
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => alert("Announcement published to Cohort March 2026 student dashboards.")}
                >
                  Publish Announcement
                </Button>
              </div>
            </div>
          )}
        </Container>
      </main>
    </div>
  );
}
