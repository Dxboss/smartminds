"use client";

import React, { useState, useMemo } from "react";
import type { OneToOneStudentAssignmentView } from "@/lib/persistedData";
import type {
  TutoringAttendanceRecord,
  TutoringAttendanceStatus,
  TutoringDeliveryMode,
} from "@/lib/repositories/types";
import { Icon } from "@/components/ui/Icon";

interface TutorOption {
  id: string;
  name: string;
  email: string;
  specialism?: string;
}

interface Props {
  initialStudents: OneToOneStudentAssignmentView[];
  initialAttendance: TutoringAttendanceRecord[];
  currentTutorId: string;
  currentTutorName: string;
  isAdminView?: boolean;
  tutors?: TutorOption[];
}

const TUTORING_SLOTS = [
  "Thursday, 4:00pm",
  "Thursday, 5:00pm",
  "Friday, 4:00pm",
  "Friday, 5:00pm",
  "Saturday, 9:00am",
  "Saturday, 10:00am",
  "Saturday, 11:00am",
  "Saturday, 12:00pm",
  "Saturday, 1:00pm",
  "Saturday, 2:00pm",
  "Saturday, 3:00pm",
  "Saturday, 4:00pm",
  "Saturday, 5:00pm",
];

function getDeliveryLabel(mode: TutoringDeliveryMode): string {
  if (mode === "physical_centre") return "Gloucester Centre (In-Person)";
  if (mode === "room_home_request") return "Home / Room Tutoring";
  return "Live 1-on-1 Online";
}

function getStatusBadge(status: TutoringAttendanceStatus) {
  switch (status) {
    case "present":
      return {
        label: "Present",
        classes: "bg-emerald-50 text-emerald-800 border-emerald-200",
      };
    case "late":
      return {
        label: "Late Arrival",
        classes: "bg-amber-50 text-amber-800 border-amber-200",
      };
    case "excused_rescheduled":
      return {
        label: "Excused / Rescheduled",
        classes: "bg-navy-900/10 text-navy-900 border-navy-900/20",
      };
    case "absent_unexcused":
    default:
      return {
        label: "Absent (Unexcused)",
        classes: "bg-rose-50 text-rose-800 border-rose-200",
      };
  }
}

export const OneToOneTutoringManager: React.FC<Props> = ({
  initialStudents,
  initialAttendance,
  currentTutorId,
  currentTutorName,
  isAdminView = false,
  tutors = [],
}) => {
  const [students, setStudents] = useState<OneToOneStudentAssignmentView[]>(initialStudents);
  const [attendance, setAttendance] = useState<TutoringAttendanceRecord[]>(initialAttendance);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Spreadsheet Filters
  const [filterStudent, setFilterStudent] = useState<string>("all");
  const [filterTutor, setFilterTutor] = useState<string>("all");
  const [filterDelivery, setFilterDelivery] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");

  // Log / Edit Attendance Modal State
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | undefined>(undefined);
  const [formEnrolmentId, setFormEnrolmentId] = useState<string>(
    initialStudents[0]?.enrolmentId || ""
  );
  const [formStudentName, setFormStudentName] = useState<string>(
    initialStudents[0]?.studentName || ""
  );
  const [formParentName, setFormParentName] = useState<string>(
    initialStudents[0]?.parentName || ""
  );
  const [formYearGroup, setFormYearGroup] = useState<string>(
    initialStudents[0]?.yearGroupOrLevel || "Year 7"
  );
  const [formTutorName, setFormTutorName] = useState<string>(
    initialStudents[0]?.tutorName && initialStudents[0].tutorName !== "Unassigned / TBA"
      ? initialStudents[0].tutorName
      : currentTutorName
  );
  const [formSessionDate, setFormSessionDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [formTimeSlot, setFormTimeSlot] = useState<string>(
    initialStudents[0]?.preferredTimeSlot || "Saturday, 10:00am"
  );
  const [formDuration, setFormDuration] = useState<string>("60");
  const [formDeliveryMode, setFormDeliveryMode] = useState<TutoringDeliveryMode>(
    initialStudents[0]?.deliveryMode || "physical_centre"
  );
  const [formLocationOrRoom, setFormLocationOrRoom] = useState<string>(
    initialStudents[0]?.roomOrAddress || "Gloucester College Centre"
  );
  const [formStatus, setFormStatus] = useState<TutoringAttendanceStatus>("present");
  const [formTopicCovered, setFormTopicCovered] = useState<string>("");
  const [formHomeworkOrNotes, setFormHomeworkOrNotes] = useState<string>("");
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  // Assign / Edit Student Delivery Setup Modal State
  const [editingStudent, setEditingStudent] = useState<OneToOneStudentAssignmentView | null>(null);
  const [assignTutorName, setAssignTutorName] = useState<string>("");
  const [assignTimeSlot, setAssignTimeSlot] = useState<string>("");
  const [assignDeliveryMode, setAssignDeliveryMode] =
    useState<TutoringDeliveryMode>("physical_centre");
  const [assignRoomOrAddress, setAssignRoomOrAddress] = useState<string>("");
  const [assignFocusSubjects, setAssignFocusSubjects] = useState<string>("");
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);

  const openMarkAttendanceForStudent = (student?: OneToOneStudentAssignmentView) => {
    const target = student || students[0];
    setEditingRecordId(undefined);
    setFormEnrolmentId(target?.enrolmentId || "");
    setFormStudentName(target?.studentName || "");
    setFormParentName(target?.parentName || "");
    setFormYearGroup(target?.yearGroupOrLevel || "Year 7");
    setFormTutorName(
      target?.tutorName && target.tutorName !== "Unassigned / TBA"
        ? target.tutorName
        : currentTutorName
    );
    setFormSessionDate(new Date().toISOString().slice(0, 10));
    setFormTimeSlot(target?.preferredTimeSlot || "Saturday, 10:00am");
    setFormDuration("60");
    setFormDeliveryMode(target?.deliveryMode || "physical_centre");
    setFormLocationOrRoom(
      target?.roomOrAddress ||
        (target?.deliveryMode === "physical_centre"
          ? "Gloucester College Centre"
          : target?.deliveryMode === "room_home_request"
          ? target?.address || "Home / Requested Room"
          : "Live 1-on-1 Zoom Classroom")
    );
    setFormStatus("present");
    setFormTopicCovered(target?.focusSubjects ? `${target.focusSubjects} — ` : "");
    setFormHomeworkOrNotes("");
    setIsAttendanceModalOpen(true);
  };

  const openEditAttendanceModal = (rec: TutoringAttendanceRecord) => {
    setEditingRecordId(rec.id);
    setFormEnrolmentId(rec.enrolmentId);
    setFormStudentName(rec.studentName);
    setFormParentName(rec.parentName || "");
    setFormYearGroup(rec.yearGroupOrLevel);
    setFormTutorName(rec.tutorName);
    setFormSessionDate(rec.sessionDate);
    setFormTimeSlot(rec.timeSlot);
    setFormDuration(String(rec.durationMinutes || 60));
    setFormDeliveryMode(rec.deliveryMode);
    setFormLocationOrRoom(rec.locationOrRoom);
    setFormStatus(rec.status);
    setFormTopicCovered(rec.topicCovered);
    setFormHomeworkOrNotes(rec.homeworkOrNotes || "");
    setIsAttendanceModalOpen(true);
  };

  const openEditStudentAssignment = (student: OneToOneStudentAssignmentView) => {
    setEditingStudent(student);
    setAssignTutorName(student.tutorName || "Unassigned / TBA");
    setAssignTimeSlot(student.preferredTimeSlot || "Saturday, 10:00am");
    setAssignDeliveryMode(student.deliveryMode);
    setAssignRoomOrAddress(student.roomOrAddress || "");
    setAssignFocusSubjects(student.focusSubjects || "");
  };

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentName.trim()) {
      alert("Please select or enter the pupil's name.");
      return;
    }
    if (!formTopicCovered.trim()) {
      alert("Please enter the lesson topic covered for the attendance log.");
      return;
    }

    setIsSavingAttendance(true);
    try {
      const matchedStudent = students.find((s) => s.enrolmentId === formEnrolmentId);
      const matchedTutor = tutors.find((t) => t.name === formTutorName);
      const res = await fetch("/api/tutoring/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_attendance",
          id: editingRecordId,
          enrolmentId: formEnrolmentId || `enr-1to1-manual`,
          learnerId: matchedStudent?.learnerId || `lrn-1to1-manual`,
          studentName: formStudentName.trim(),
          parentName: formParentName.trim() || undefined,
          yearGroupOrLevel: formYearGroup.trim(),
          tutorId: matchedTutor?.id || matchedStudent?.tutorId || currentTutorId,
          tutorName: formTutorName.trim() || currentTutorName,
          sessionDate: formSessionDate,
          timeSlot: formTimeSlot,
          durationMinutes: parseInt(formDuration, 10) || 60,
          deliveryMode: formDeliveryMode,
          locationOrRoom: formLocationOrRoom.trim(),
          status: formStatus,
          topicCovered: formTopicCovered.trim(),
          homeworkOrNotes: formHomeworkOrNotes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.record) {
        alert(data.error || "Failed to save attendance record.");
        return;
      }

      setAttendance((prev) => {
        const exists = prev.some((r) => r.id === data.record.id);
        if (exists) {
          return prev.map((r) => (r.id === data.record.id ? data.record : r));
        }
        return [data.record, ...prev];
      });
      setIsAttendanceModalOpen(false);
      setFeedback(
        editingRecordId
          ? `Updated attendance entry for ${data.record.studentName} (${data.record.sessionDate}).`
          : `Logged 1-on-1 attendance for ${data.record.studentName} (${data.record.sessionDate}).`
      );
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save attendance.");
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const handleDeleteAttendance = async (rec: TutoringAttendanceRecord) => {
    if (!confirm(`Delete attendance log for ${rec.studentName} on ${rec.sessionDate}?`)) return;
    try {
      const res = await fetch("/api/tutoring/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_attendance",
          id: rec.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAttendance((prev) => prev.filter((r) => r.id !== rec.id));
        setFeedback(`Removed attendance entry for ${rec.studentName}.`);
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveStudentAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setIsSavingAssignment(true);
    try {
      const matchedTutor = tutors.find((t) => t.name === assignTutorName);
      const res = await fetch("/api/tutoring/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_assignment",
          enrolmentId: editingStudent.enrolmentId,
          learnerId: editingStudent.learnerId,
          tutorId: matchedTutor?.id,
          tutorName: assignTutorName,
          preferredTimeSlot: assignTimeSlot,
          deliveryMode: assignDeliveryMode,
          roomOrAddress: assignRoomOrAddress.trim(),
          focusSubjects: assignFocusSubjects.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Failed to update 1-on-1 assignment.");
        return;
      }

      setStudents((prev) =>
        prev.map((s) =>
          s.enrolmentId === editingStudent.enrolmentId
            ? {
                ...s,
                tutorId: matchedTutor?.id || s.tutorId,
                tutorName: assignTutorName,
                preferredTimeSlot: assignTimeSlot,
                deliveryMode: assignDeliveryMode,
                roomOrAddress: assignRoomOrAddress.trim() || s.roomOrAddress,
                focusSubjects: assignFocusSubjects.trim() || s.focusSubjects,
              }
            : s
        )
      );
      setEditingStudent(null);
      setFeedback(
        `Updated 1-on-1 delivery mode, room/location, and tutor assignment for ${editingStudent.studentName}.`
      );
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save assignment.");
    } finally {
      setIsSavingAssignment(false);
    }
  };

  // Filtered Attendance Rows
  const filteredAttendance = useMemo(() => {
    return attendance.filter((r) => {
      if (filterStudent !== "all" && r.enrolmentId !== filterStudent && r.studentName !== filterStudent) {
        return false;
      }
      if (filterTutor !== "all" && r.tutorName !== filterTutor) {
        return false;
      }
      if (filterDelivery !== "all" && r.deliveryMode !== filterDelivery) {
        return false;
      }
      if (filterStatus !== "all" && r.status !== filterStatus) {
        return false;
      }
      if (filterMonth !== "all" && !r.sessionDate.startsWith(filterMonth)) {
        return false;
      }
      return true;
    });
  }, [attendance, filterStudent, filterTutor, filterDelivery, filterStatus, filterMonth]);

  // Available months in attendance records
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    const currentYm = new Date().toISOString().slice(0, 7);
    set.add(currentYm);
    for (const r of attendance) {
      if (r.sessionDate && r.sessionDate.length >= 7) {
        set.add(r.sessionDate.slice(0, 7));
      }
    }
    return Array.from(set).sort().reverse();
  }, [attendance]);

  // Unique tutors in records + staff directory
  const tutorFilterOptions = useMemo(() => {
    const names = new Set<string>();
    for (const t of tutors) {
      if (t.name) names.add(t.name);
    }
    for (const s of students) {
      if (s.tutorName && s.tutorName !== "Unassigned / TBA") names.add(s.tutorName);
    }
    for (const r of attendance) {
      if (r.tutorName) names.add(r.tutorName);
    }
    return Array.from(names);
  }, [tutors, students, attendance]);

  // Summary KPIs
  const stats = useMemo(() => {
    const totalSessions = filteredAttendance.length;
    const deliveredRecords = filteredAttendance.filter(
      (r) => r.status === "present" || r.status === "late"
    );
    const totalMinutes = deliveredRecords.reduce(
      (sum, r) => sum + (Number(r.durationMinutes) || 60),
      0
    );
    const totalHours = Math.round((totalMinutes / 60) * 100) / 100;
    const attendanceRate =
      totalSessions > 0 ? Math.round((deliveredRecords.length / totalSessions) * 100) : 100;

    const centreCount = filteredAttendance.filter(
      (r) => r.deliveryMode === "physical_centre"
    ).length;
    const onlineCount = filteredAttendance.filter((r) => r.deliveryMode === "online").length;
    const homeRoomCount = filteredAttendance.filter(
      (r) => r.deliveryMode === "room_home_request"
    ).length;

    return {
      totalSessions,
      totalHours,
      attendanceRate,
      centreCount,
      onlineCount,
      homeRoomCount,
    };
  }, [filteredAttendance]);

  const handleExportCsv = () => {
    const headers = [
      "Session Date",
      "Pupil / Student Name",
      "Parent / Guardian",
      "Year Group / Level",
      "Assigned Tutor",
      "Weekly Slot",
      "Duration (Mins)",
      "Delivered Hours",
      "Delivery Mode",
      "Room / Venue / Zoom",
      "Attendance Status",
      "Topic Covered",
      "Homework & Progress Notes",
    ];

    const escapeCsv = (val: string | number | undefined) => {
      const str = String(val ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = filteredAttendance.map((r) => [
      r.sessionDate,
      r.studentName,
      r.parentName || "—",
      r.yearGroupOrLevel,
      r.tutorName,
      r.timeSlot,
      r.durationMinutes,
      ((Number(r.durationMinutes) || 60) / 60).toFixed(2),
      getDeliveryLabel(r.deliveryMode),
      r.locationOrRoom,
      getStatusBadge(r.status).label,
      r.topicCovered,
      r.homeworkOrNotes || "",
    ]);

    const csvContent = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `smartminds-1to1-attendance-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {feedback && (
        <div
          role="status"
          className="p-4 rounded-sm bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <Icon name="check-circle" size={16} className="text-emerald-700" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-emerald-800 hover:underline text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-md border border-line p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-ink-soft">Assigned 1-on-1 Pupils</span>
          <div className="font-heading text-3xl font-bold text-navy-900">{students.length}</div>
          <p className="text-[11px] text-ink-soft">
            Active 1-on-1 tutoring enrolments
          </p>
        </div>

        <div className="bg-white rounded-md border border-line p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-ink-soft">Delivered Tutoring Hours</span>
          <div className="font-heading text-3xl font-bold text-navy-900">
            {stats.totalHours} <span className="text-base font-normal text-ink-soft">hrs</span>
          </div>
          <p className="text-[11px] text-ink-soft">
            Across {stats.totalSessions} logged 1-on-1 sessions
          </p>
        </div>

        <div className="bg-white rounded-md border border-line p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-ink-soft">Attendance Rate</span>
          <div className="font-heading text-3xl font-bold text-emerald-700">
            {stats.attendanceRate}%
          </div>
          <p className="text-[11px] text-ink-soft">
            Present &amp; completed lessons
          </p>
        </div>

        <div className="bg-white rounded-md border border-line p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-ink-soft">Delivery Mode Breakdown</span>
          <div className="flex items-center gap-2 pt-1 flex-wrap text-xs font-bold text-navy-900">
            <span className="px-2 py-0.5 rounded-xs bg-navy-900/10">
              Centre: {stats.centreCount}
            </span>
            <span className="px-2 py-0.5 rounded-xs bg-emerald-50 text-emerald-900 border border-emerald-200">
              Online: {stats.onlineCount}
            </span>
            <span className="px-2 py-0.5 rounded-xs bg-gold-300/40 text-navy-900 border border-gold-500/40">
              Home/Room: {stats.homeRoomCount}
            </span>
          </div>
          <p className="text-[11px] text-ink-soft pt-0.5">
            Physical centre, online &amp; requested room visits
          </p>
        </div>
      </div>

      {/* Section 1: Assigned 1-on-1 Pupils & Delivery Setup */}
      <div className="bg-white rounded-md border border-line p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-navy-900">
              {isAdminView
                ? "1-on-1 Tutoring Roster — Tutor, Room & Delivery Assignments"
                : "My Assigned 1-on-1 Tutoring Pupils"}
            </h2>
            <p className="text-xs text-ink-soft">
              View each pupil&apos;s parent registration preferences (Year Group, Focus Subjects, Preferred Day/Time, and Online vs. Gloucester Centre Room vs. Home/Room Request) and mark attendance.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openMarkAttendanceForStudent(students[0])}
            className="px-4 py-2 rounded-sm bg-navy-900 text-white text-xs font-semibold hover:bg-navy-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Icon name="plus" size={14} />
            <span>Log 1-on-1 session attendance</span>
          </button>
        </div>

        {students.length === 0 ? (
          <div className="p-8 text-center bg-paper rounded-sm border border-line space-y-2">
            <p className="text-sm font-semibold text-navy-900">
              No 1-on-1 tutoring pupils assigned yet.
            </p>
            <p className="text-xs text-ink-soft max-w-lg mx-auto">
              {isAdminView
                ? "When a parent registers on /enrol for 1-on-1 Private Tutoring or you enrol a 1-on-1 student in Learners Directory, they will appear here ready for tutor and room assignment."
                : "When the Centre Director assigns you to a 1-on-1 tutoring pupil, their schedule, delivery mode (Online, Gloucester Centre room, or Home/Room visit), and attendance button will appear here."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((stu) => (
              <div
                key={stu.enrolmentId}
                className="p-4 rounded-sm bg-paper border border-line flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-navy-900">{stu.studentName}</h3>
                        <span className="px-2 py-0.5 rounded-xs bg-gold-300/40 border border-gold-500/40 text-navy-900 text-[11px] font-bold">
                          {stu.yearGroupOrLevel}
                        </span>
                      </div>
                      {stu.parentName && (
                        <p className="text-xs text-ink-soft mt-0.5">
                          Parent/Guardian: <strong className="text-ink">{stu.parentName}</strong> ·{" "}
                          {stu.parentPhone}
                        </p>
                      )}
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider border ${
                        stu.deliveryMode === "physical_centre"
                          ? "bg-navy-900 text-gold-300 border-navy-900"
                          : stu.deliveryMode === "room_home_request"
                          ? "bg-amber-50 text-amber-900 border-amber-300"
                          : "bg-emerald-50 text-emerald-900 border-emerald-200"
                      }`}
                    >
                      {getDeliveryLabel(stu.deliveryMode)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white p-3 rounded-sm border border-line">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-ink-soft block font-semibold">
                        Weekly Slot
                      </span>
                      <strong className="text-navy-900">{stu.preferredTimeSlot}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-ink-soft block font-semibold">
                        Assigned Tutor
                      </span>
                      <strong className="text-navy-900">{stu.tutorName}</strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[10px] uppercase tracking-wider text-ink-soft block font-semibold">
                        {stu.deliveryMode === "physical_centre"
                          ? "Assigned Centre Room"
                          : stu.deliveryMode === "room_home_request"
                          ? "Requested Home / Room Address"
                          : "Online Classroom"}
                      </span>
                      <span className="text-ink font-medium">{stu.roomOrAddress}</span>
                    </div>
                    {stu.focusSubjects && (
                      <div className="sm:col-span-2 pt-1 border-t border-line/60">
                        <span className="text-[10px] uppercase tracking-wider text-ink-soft block font-semibold">
                          Focus Subjects / Learning Notes
                        </span>
                        <span className="text-ink-soft">{stu.focusSubjects}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-line/60">
                  <button
                    type="button"
                    onClick={() => openMarkAttendanceForStudent(stu)}
                    className="px-3 py-1.5 rounded-sm bg-navy-900 text-white text-xs font-semibold hover:bg-navy-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Icon name="check-circle" size={14} />
                    <span>Mark attendance</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditStudentAssignment(stu)}
                    className="px-3 py-1.5 rounded-sm border border-line bg-white text-navy-900 text-xs font-semibold hover:bg-paper transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Icon name="clock" size={13} />
                    <span>
                      {isAdminView ? "Assign Tutor / Room / Mode" : "Update Room / Slot"}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: 1-on-1 Attendance & Hours Spreadsheet */}
      <div className="bg-white rounded-md border border-line p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-navy-900">
              1-on-1 Attendance &amp; Delivered Hours Spreadsheet
            </h2>
            <p className="text-xs text-ink-soft">
              Complete log of every 1-on-1 lesson delivered in-person at Gloucester Centre, live online, or via requested room/home tutoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-sm border border-navy-900 text-navy-900 text-xs font-semibold hover:bg-navy-900 hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Icon name="file-text" size={14} />
              <span>Export CSV Spreadsheet</span>
            </button>
            <button
              type="button"
              onClick={() => openMarkAttendanceForStudent(students[0])}
              className="px-3.5 py-2 rounded-sm bg-navy-900 text-white text-xs font-semibold hover:bg-navy-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Icon name="plus" size={14} />
              <span>Add Attendance Row</span>
            </button>
          </div>
        </div>

        {/* Spreadsheet Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-paper p-3.5 rounded-sm border border-line text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-1">
              Filter by Pupil
            </label>
            <select
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
            >
              <option value="all">All 1-on-1 Pupils</option>
              {students.map((s) => (
                <option key={s.enrolmentId} value={s.enrolmentId}>
                  {s.studentName} ({s.yearGroupOrLevel})
                </option>
              ))}
            </select>
          </div>

          {isAdminView && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-1">
                Filter by Tutor
              </label>
              <select
                value={filterTutor}
                onChange={(e) => setFilterTutor(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
              >
                <option value="all">All Assigned Tutors</option>
                {tutorFilterOptions.map((tName) => (
                  <option key={tName} value={tName}>
                    {tName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-1">
              Delivery Mode
            </label>
            <select
              value={filterDelivery}
              onChange={(e) => setFilterDelivery(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
            >
              <option value="all">All Modes (Centre, Online, Home)</option>
              <option value="physical_centre">Gloucester Centre (In-Person)</option>
              <option value="online">Live 1-on-1 Online</option>
              <option value="room_home_request">Home / Room Tutoring</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-1">
              Attendance Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="late">Late Arrival</option>
              <option value="excused_rescheduled">Excused / Rescheduled</option>
              <option value="absent_unexcused">Absent (Unexcused)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-1">
              Billing Month
            </label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-mono"
            >
              <option value="all">All Dates</option>
              {availableMonths.map((ym) => (
                <option key={ym} value={ym}>
                  {ym}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Spreadsheet Table */}
        <div className="overflow-x-auto border border-line rounded-sm">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-paper border-b border-line text-ink-soft font-semibold">
                <th className="py-3 px-3">Date &amp; Slot</th>
                <th className="py-3 px-3">Pupil &amp; Year Group</th>
                {isAdminView && <th className="py-3 px-3">Tutor</th>}
                <th className="py-3 px-3">Delivery Mode &amp; Room / Location</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Topic Covered &amp; Progress Notes</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdminView ? 8 : 7}
                    className="py-8 text-center text-ink-soft"
                  >
                    No 1-on-1 attendance rows recorded for the selected filters. Click &ldquo;Add Attendance Row&rdquo; or &ldquo;Mark attendance&rdquo; above to log a session.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((rec) => {
                  const statusBadge = getStatusBadge(rec.status);
                  return (
                    <tr key={rec.id} className="hover:bg-paper/50 transition-colors">
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <div className="font-mono font-bold text-navy-900">{rec.sessionDate}</div>
                        <div className="text-[11px] text-ink-soft">{rec.timeSlot}</div>
                      </td>
                      <td className="py-3 px-3 align-top">
                        <div className="font-bold text-navy-900">{rec.studentName}</div>
                        <div className="text-[11px] text-ink-soft">
                          {rec.yearGroupOrLevel}
                          {rec.parentName ? ` · Parent: ${rec.parentName}` : ""}
                        </div>
                      </td>
                      {isAdminView && (
                        <td className="py-3 px-3 align-top font-semibold text-navy-900">
                          {rec.tutorName}
                        </td>
                      )}
                      <td className="py-3 px-3 align-top">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded-xs text-[10px] font-bold border mb-0.5 ${
                            rec.deliveryMode === "physical_centre"
                              ? "bg-navy-900/10 text-navy-900 border-navy-900/20"
                              : rec.deliveryMode === "room_home_request"
                              ? "bg-amber-50 text-amber-900 border-amber-200"
                              : "bg-emerald-50 text-emerald-900 border-emerald-200"
                          }`}
                        >
                          {getDeliveryLabel(rec.deliveryMode)}
                        </span>
                        <div className="text-[11px] text-ink-soft">{rec.locationOrRoom}</div>
                      </td>
                      <td className="py-3 px-3 align-top font-mono">
                        <span className="font-bold text-navy-900">{rec.durationMinutes}m</span>
                        <span className="text-[10px] text-ink-soft block">
                          ({((Number(rec.durationMinutes) || 60) / 60).toFixed(2)} hr)
                        </span>
                      </td>
                      <td className="py-3 px-3 align-top">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold border ${statusBadge.classes}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 align-top max-w-xs">
                        <div className="font-semibold text-navy-900">{rec.topicCovered}</div>
                        {rec.homeworkOrNotes && (
                          <div className="text-[11px] text-ink-soft mt-0.5">
                            {rec.homeworkOrNotes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditAttendanceModal(rec)}
                            className="px-2 py-1 rounded-xs border border-line bg-white hover:bg-paper text-navy-900 font-semibold text-[11px] cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAttendance(rec)}
                            className="px-2 py-1 rounded-xs border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold text-[11px] cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Log / Edit 1-on-1 Session Attendance */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-line max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-heading text-xl font-bold text-navy-900">
                  {editingRecordId
                    ? "Edit 1-on-1 Attendance Entry"
                    : "Mark 1-on-1 Session Attendance"}
                </h3>
                <p className="text-xs text-ink-soft">
                  Record attendance, delivery mode (Centre, Online, or Home/Room), and topic covered.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAttendanceModalOpen(false)}
                className="text-ink-soft hover:text-navy-900 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveAttendance} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {students.length > 0 && (
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-navy-900 mb-1">
                      Select Assigned 1-on-1 Pupil
                    </label>
                    <select
                      value={formEnrolmentId}
                      onChange={(e) => {
                        const eid = e.target.value;
                        setFormEnrolmentId(eid);
                        const found = students.find((s) => s.enrolmentId === eid);
                        if (found) {
                          setFormStudentName(found.studentName);
                          setFormParentName(found.parentName || "");
                          setFormYearGroup(found.yearGroupOrLevel);
                          if (found.tutorName && found.tutorName !== "Unassigned / TBA") {
                            setFormTutorName(found.tutorName);
                          }
                          setFormTimeSlot(found.preferredTimeSlot);
                          setFormDeliveryMode(found.deliveryMode);
                          setFormLocationOrRoom(found.roomOrAddress);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-sm border border-line bg-paper font-medium"
                    >
                      {students.map((s) => (
                        <option key={s.enrolmentId} value={s.enrolmentId}>
                          {s.studentName} ({s.yearGroupOrLevel}) — {getDeliveryLabel(s.deliveryMode)}
                        </option>
                      ))}
                      <option value="">Manual / Other Pupil Entry</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-navy-900 mb-1">
                    Pupil / Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formStudentName}
                    onChange={(e) => setFormStudentName(e.target.value)}
                    placeholder="e.g. Leo Smith"
                    className="w-full px-3 py-2 rounded-sm border border-line bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-navy-900 mb-1">
                    Year Group / Level *
                  </label>
                  <input
                    type="text"
                    required
                    value={formYearGroup}
                    onChange={(e) => setFormYearGroup(e.target.value)}
                    placeholder="e.g. Year 6, GCSE, A-Levels"
                    className="w-full px-3 py-2 rounded-sm border border-line bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-navy-900 mb-1">
                    Lesson Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formSessionDate}
                    onChange={(e) => setFormSessionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm border border-line bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-navy-900 mb-1">
                    Scheduled Day &amp; Time Slot *
                  </label>
                  <input
                    type="text"
                    required
                    list="tutoring-slots-list"
                    value={formTimeSlot}
                    onChange={(e) => setFormTimeSlot(e.target.value)}
                    placeholder="e.g. Saturday, 10:00am"
                    className="w-full px-3 py-2 rounded-sm border border-line bg-white"
                  />
                  <datalist id="tutoring-slots-list">
                    {TUTORING_SLOTS.map((slot) => (
                      <option key={slot} value={slot} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-semibold text-navy-900 mb-1">
                    Delivery Mode *
                  </label>
                  <select
                    value={formDeliveryMode}
                    onChange={(e) => {
                      const mode = e.target.value as TutoringDeliveryMode;
                      setFormDeliveryMode(mode);
                      if (mode === "physical_centre" && !formLocationOrRoom.includes("Centre")) {
                        setFormLocationOrRoom("Gloucester College Centre — Room 1");
                      } else if (mode === "online" && !formLocationOrRoom.includes("Zoom")) {
                        setFormLocationOrRoom("Live 1-on-1 Zoom Classroom");
                      }
                    }}
                    className="w-full px-3 py-2 rounded-sm border border-line bg-white font-medium"
                  >
                    <option value="physical_centre">
                      Gloucester College Centre (In-Person Room)
                    </option>
                    <option value="online">Live 1-on-1 Online (Zoom)</option>
                    <option value="room_home_request">
                      Home / Room Tutoring (Requested Location)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-navy-900 mb-1">
                    {formDeliveryMode === "physical_centre"
                      ? "Centre Room / Bay *"
                      : formDeliveryMode === "room_home_request"
                      ? "Home / Requested Room Address *"
                      : "Online Classroom / Zoom *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formLocationOrRoom}
                    onChange={(e) => setFormLocationOrRoom(e.target.value)}
                    placeholder={
                      formDeliveryMode === "physical_centre"
                        ? "e.g. Tutoring Room 2, Gloucester Centre"
                        : formDeliveryMode === "room_home_request"
                        ? "e.g. 14 Brunswick Square, Gloucester"
                        : "e.g. Zoom 1-on-1 Classroom"
                    }
                    className="w-full px-3 py-2 rounded-sm border border-line bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-navy-900 mb-1">
                    Attendance Status *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) =>
                      setFormStatus(e.target.value as TutoringAttendanceStatus)
                    }
                    className="w-full px-3 py-2 rounded-sm border border-line bg-white font-semibold"
                  >
                    <option value="present">Present (Completed on time)</option>
                    <option value="late">Late Arrival</option>
                    <option value="excused_rescheduled">
                      Excused / Rescheduled (Notice given)
                    </option>
                    <option value="absent_unexcused">Absent (No-show / Unexcused)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-navy-900 mb-1">
                    Session Duration (Minutes) *
                  </label>
                  <select
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm border border-line bg-white font-mono"
                  >
                    <option value="60">60 mins (1.0 hr standard lesson)</option>
                    <option value="75">75 mins (60m lesson + 15m breakout)</option>
                    <option value="90">90 mins (1.5 hrs extended session)</option>
                    <option value="120">120 mins (2.0 hrs double session)</option>
                  </select>
                </div>

                {isAdminView && (
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-navy-900 mb-1">
                      Delivered By Tutor *
                    </label>
                    <select
                      value={formTutorName}
                      onChange={(e) => setFormTutorName(e.target.value)}
                      className="w-full px-3 py-2 rounded-sm border border-line bg-white"
                    >
                      {tutorFilterOptions.map((tName) => (
                        <option key={tName} value={tName}>
                          {tName}
                        </option>
                      ))}
                      {!tutorFilterOptions.includes(formTutorName) && formTutorName && (
                        <option value={formTutorName}>{formTutorName}</option>
                      )}
                    </select>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-navy-900 mb-1">
                    Lesson Topic Covered *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTopicCovered}
                    onChange={(e) => setFormTopicCovered(e.target.value)}
                    placeholder="e.g. GCSE Maths Higher — Simultaneous Equations & Past Paper Q1-Q12"
                    className="w-full px-3 py-2 rounded-sm border border-line bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-navy-900 mb-1">
                    Homework Set &amp; Parent Progress Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formHomeworkOrNotes}
                    onChange={(e) => setFormHomeworkOrNotes(e.target.value)}
                    placeholder="e.g. Completed worksheet 4; strong progress on algebraic fractions. Homework: Practice paper section B."
                    className="w-full px-3 py-2 rounded-sm border border-line bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="px-4 py-2 rounded-sm border border-line text-ink-soft hover:text-navy-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAttendance}
                  className="px-4 py-2 rounded-sm bg-navy-900 text-white font-semibold hover:bg-navy-700 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingAttendance
                    ? "Saving..."
                    : editingRecordId
                    ? "Update Attendance Row"
                    : "Save Attendance to Spreadsheet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Assign Tutor, Delivery Mode, Room/Address & Weekly Slot */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-line max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-heading text-xl font-bold text-navy-900">
                  1-on-1 Delivery &amp; Room Assignment: {editingStudent.studentName}
                </h3>
                <p className="text-xs text-ink-soft">
                  {editingStudent.yearGroupOrLevel}
                  {editingStudent.parentName ? ` · Parent: ${editingStudent.parentName}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="text-ink-soft hover:text-navy-900 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveStudentAssignment} className="space-y-4 text-xs">
              {isAdminView && (
                <div>
                  <label className="block font-semibold text-navy-900 mb-1">
                    Assigned 1-on-1 Tutor *
                  </label>
                  <select
                    value={assignTutorName}
                    onChange={(e) => setAssignTutorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm border border-line bg-white font-medium"
                  >
                    <option value="Unassigned / TBA">Unassigned / TBA</option>
                    {tutors.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.email})
                        {t.specialism ? ` — ${t.specialism}` : ""}
                      </option>
                    ))}
                    {assignTutorName &&
                      assignTutorName !== "Unassigned / TBA" &&
                      !tutors.some((t) => t.name === assignTutorName) && (
                        <option value={assignTutorName}>{assignTutorName}</option>
                      )}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-navy-900 mb-1">
                  Weekly Tutoring Day &amp; Time Slot *
                </label>
                <select
                  value={assignTimeSlot}
                  onChange={(e) => setAssignTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-white font-medium"
                >
                  {TUTORING_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                  {!TUTORING_SLOTS.includes(assignTimeSlot) && assignTimeSlot && (
                    <option value={assignTimeSlot}>{assignTimeSlot}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-navy-900 mb-1">
                  1-on-1 Delivery Mode *
                </label>
                <select
                  value={assignDeliveryMode}
                  onChange={(e) =>
                    setAssignDeliveryMode(e.target.value as TutoringDeliveryMode)
                  }
                  className="w-full px-3 py-2 rounded-sm border border-line bg-white font-medium"
                >
                  <option value="physical_centre">
                    Gloucester College Centre (In-Person Room)
                  </option>
                  <option value="online">Live 1-on-1 Online (Zoom Classroom)</option>
                  <option value="room_home_request">
                    Home / Room Tutoring (Requested Location)
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-navy-900 mb-1">
                  {assignDeliveryMode === "physical_centre"
                    ? "Assigned Centre Room / Bay *"
                    : assignDeliveryMode === "room_home_request"
                    ? "Requested Home / Room Address *"
                    : "1-on-1 Zoom Classroom URL *"}
                </label>
                <input
                  type="text"
                  required
                  value={assignRoomOrAddress}
                  onChange={(e) => setAssignRoomOrAddress(e.target.value)}
                  placeholder={
                    assignDeliveryMode === "physical_centre"
                      ? "e.g. Tutoring Room 2, Gloucester Centre"
                      : assignDeliveryMode === "room_home_request"
                      ? "e.g. 14 Brunswick Square, Gloucester GL1 1UG"
                      : "e.g. https://zoom.us/j/1to1-classroom"
                  }
                  className="w-full px-3 py-2 rounded-sm border border-line bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-navy-900 mb-1">
                  Focus Subjects / Learning Notes
                </label>
                <input
                  type="text"
                  value={assignFocusSubjects}
                  onChange={(e) => setAssignFocusSubjects(e.target.value)}
                  placeholder="e.g. Maths & English SATs / GCSE Exam Prep"
                  className="w-full px-3 py-2 rounded-sm border border-line bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-sm border border-line text-ink-soft hover:text-navy-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAssignment}
                  className="px-4 py-2 rounded-sm bg-navy-900 text-white font-semibold hover:bg-navy-700 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingAssignment ? "Saving..." : "Save 1-on-1 Setup"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

