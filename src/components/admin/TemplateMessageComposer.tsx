"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { MessageTemplate, MessageLogEntry, Learner, Enrolment, ClassCohort, Coupon } from "@/lib/repositories/types";
import { sendTemplateMessageAction, broadcastTemplateMessageAction } from "@/app/admin/actions";

interface Props {
  templates: MessageTemplate[];
  initialLogs: MessageLogEntry[];
  learners: Learner[];
  enrolments?: Enrolment[];
  classes?: ClassCohort[];
  coupons?: Coupon[];
  presetTemplateKey?: string;
  presetPlaceholders?: Record<string, string>;
}

export const TemplateMessageComposer: React.FC<Props> = ({
  templates,
  initialLogs,
  learners,
  enrolments = [],
  classes = [],
  coupons = [],
  presetTemplateKey,
  presetPlaceholders,
}) => {
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>(
    presetTemplateKey || templates[0]?.key || "welcome_induction"
  );
  const [dispatchMode, setDispatchMode] = useState<"individual" | "broadcast">("individual");
  const [cohortCourseId, setCohortCourseId] = useState<string>("all");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [selectedCouponCode, setSelectedCouponCode] = useState<string>("");
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>(
    presetPlaceholders || {}
  );

  React.useEffect(() => {
    if (presetTemplateKey) {
      setSelectedTemplateKey(presetTemplateKey);
    }
  }, [presetTemplateKey]);

  React.useEffect(() => {
    if (presetPlaceholders) {
      setPlaceholderValues((prev) => ({ ...prev, ...presetPlaceholders }));
    }
  }, [presetPlaceholders]);
  const [logs, setLogs] = useState<MessageLogEntry[]>(initialLogs);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.key === selectedTemplateKey) || templates[0],
    [templates, selectedTemplateKey]
  );

  const activeCoupons = useMemo(() => {
    return coupons.filter((c) => c.isActive !== false);
  }, [coupons]);

  const hasCouponPlaceholder = useMemo(() => {
    return (selectedTemplate?.allowedPlaceholders || []).includes("coupon_code");
  }, [selectedTemplate]);

  // Handle selecting a coupon from the smart dropdown
  const handleSelectCoupon = (code: string) => {
    setSelectedCouponCode(code);
    if (!code) {
      setPlaceholderValues((prev) => ({
        ...prev,
        coupon_code: "",
        discount_text: "",
        expiry_date: "",
      }));
      return;
    }

    const c = coupons.find((it) => it.code.toUpperCase() === code.toUpperCase());
    if (c) {
      const discountText =
        c.discountType === "percent" ? `${c.discountValue}% discount` : `£${c.discountValue} voucher`;
      const expiry = c.validUntil
        ? new Date(c.validUntil).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "Next 30 Days";
      const reco =
        c.appliesTo === "tutoring"
          ? "1-on-1 Academic Tutoring"
          : c.appliesTo === "qualifications"
          ? "Accredited Level 3 or Level 5 Diploma"
          : "All Smartminds Courses & Tutoring";

      setPlaceholderValues((prev) => ({
        ...prev,
        coupon_code: c.code,
        discount_text: discountText,
        expiry_date: expiry,
        course_recommendation: prev.course_recommendation || reco,
      }));
    }
  };

  const cohortOptions = useMemo(() => {
    const list: Array<{ id: string; label: string; count: number }> = [];

    // 1. By Classes / Cohorts
    classes.forEach((cl) => {
      const count = enrolments.filter((e) => e.classId === cl.id).length;
      list.push({
        id: `cohort-${cl.id}`,
        label: `Cohort: ${cl.name} (${cl.scheduleDescription || cl.intakeLabel || "Blended"})`,
        count,
      });
    });

    // 2. By Courses
    const courseMap = new Map<string, { title: string; count: number }>();
    enrolments.forEach((e) => {
      if (e.courseId && e.courseTitle) {
        const cur = courseMap.get(e.courseId) || { title: e.courseTitle, count: 0 };
        cur.count++;
        courseMap.set(e.courseId, cur);
      }
    });

    learners.forEach((l) => {
      if (l.courseId && l.courseTitle && !courseMap.has(l.courseId)) {
        courseMap.set(l.courseId, { title: l.courseTitle, count: 1 });
      }
    });

    courseMap.forEach((val, id) => {
      list.push({
        id,
        label: `Course: ${val.title}`,
        count: val.count,
      });
    });

    return list;
  }, [classes, enrolments, learners]);

  const targetLearnerCount = useMemo(() => {
    if (cohortCourseId === "all") return learners.length;
    if (cohortCourseId.startsWith("cohort-")) {
      const classId = cohortCourseId.replace(/^cohort-/, "");
      const matchingLearnerIds = new Set(
        enrolments.filter((e) => e.classId === classId).map((e) => e.learnerId)
      );
      return learners.filter((l) => matchingLearnerIds.has(l.id)).length;
    }
    const matchingLearnerIds = new Set(
      enrolments.filter((e) => e.courseId === cohortCourseId).map((e) => e.learnerId)
    );
    return learners.filter(
      (l) => l.courseId === cohortCourseId || matchingLearnerIds.has(l.id)
    ).length;
  }, [learners, enrolments, cohortCourseId]);

  const handleSelectLearner = (learnerId: string) => {
    const l = learners.find((item) => item.id === learnerId);
    if (l) {
      setRecipientEmail(l.email);
      setRecipientName(`${l.firstName} ${l.lastName}`);
      setPlaceholderValues((prev) => ({
        ...prev,
        first_name: l.firstName,
      }));
    }
  };

  const handlePlaceholderChange = (key: string, val: string) => {
    setPlaceholderValues((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  // Live Rendered Preview
  const renderedSubject = useMemo(() => {
    if (!selectedTemplate) return "";
    let s = selectedTemplate.subject || "";
    for (const ph of selectedTemplate.allowedPlaceholders || []) {
      const v = placeholderValues[ph] || (dispatchMode === "broadcast" && ph === "first_name" ? "{Recipient Name}" : `{${ph}}`);
      s = s.replace(new RegExp(`\\{${ph}\\}`, "g"), v);
    }
    return s;
  }, [selectedTemplate, placeholderValues, dispatchMode]);

  const renderedBody = useMemo(() => {
    if (!selectedTemplate) return "";
    let b = selectedTemplate.bodyTemplate || "";
    for (const ph of selectedTemplate.allowedPlaceholders || []) {
      const v = placeholderValues[ph] || (dispatchMode === "broadcast" && ph === "first_name" ? "{Recipient First Name}" : `{${ph}}`);
      b = b.replace(new RegExp(`\\{${ph}\\}`, "g"), v);
    }
    return b;
  }, [selectedTemplate, placeholderValues, dispatchMode]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (dispatchMode === "broadcast") {
      if (targetLearnerCount === 0) {
        alert("No learners found matching this cohort.");
        return;
      }

      setIsSending(true);
      try {
        const res = await broadcastTemplateMessageAction({
          templateKey: selectedTemplate.key,
          placeholders: placeholderValues,
          cohortCourseId,
        });

        setFeedback(
          `Mass broadcast successful: Dispatched "${selectedTemplate.title}" to ${res.count} enrolled learners. All deliveries recorded in Outbox.`
        );
        setTimeout(() => setFeedback(null), 6000);
        setPlaceholderValues({});
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to broadcast message");
      } finally {
        setIsSending(false);
      }
      return;
    }

    if (!recipientEmail || !recipientName) {
      alert("Please provide recipient email and name.");
      return;
    }

    setIsSending(true);
    try {
      const res = await sendTemplateMessageAction({
        templateKey: selectedTemplate.key,
        recipientEmail: recipientEmail.trim(),
        recipientName: recipientName.trim(),
        placeholders: placeholderValues,
      });

      if (res.logEntry) {
        setLogs((prev) => [res.logEntry, ...prev]);
      }

      setFeedback(
        `Approved template "${selectedTemplate?.title || "Notification"}" dispatched to ${recipientEmail} and logged in Outbox.`
      );
      setTimeout(() => setFeedback(null), 5000);

      // Reset form fields
      setRecipientEmail("");
      setRecipientName("");
      setPlaceholderValues({});
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {feedback && (
        <div
          role="status"
          className="p-4 rounded-sm bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2"
        >
          <Icon name="check-circle" size={16} className="text-emerald-700" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Compliance Notice */}
      <div className="p-4 rounded-sm bg-paper border border-line text-xs text-ink space-y-1">
        <div className="flex items-center gap-2 font-bold text-navy-900">
          <Icon name="shield-check" size={16} className="text-navy-900" />
          <span>Standard Operating Policy: Approved Templates Only</span>
        </div>
        <p className="text-ink-soft leading-relaxed text-[11px]">
          Administrative staff communications must adhere to owner-approved legal and academic templates. Free-text messaging is restricted. You may substitute verified learner placeholders (e.g. name, course, deadline). Every dispatch is logged.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Template & Placeholder Inputs */}
        <div className="bg-white rounded-md border border-line p-6 space-y-5 shadow-sm">
          <h2 className="font-heading text-xl font-bold text-navy-900">
            Dispatch Approved Template
          </h2>

          <form onSubmit={handleSend} className="space-y-4 text-xs">
            {/* Mode Selector */}
            <div>
              <label className="font-bold text-navy-900 block mb-1.5 uppercase tracking-wider text-[11px]">
                Dispatch Target
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-paper border border-line rounded-sm">
                <button
                  type="button"
                  onClick={() => setDispatchMode("individual")}
                  className={`py-1.5 px-3 rounded-xs font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 ${
                    dispatchMode === "individual"
                      ? "bg-navy-900 text-white shadow-xs"
                      : "text-ink-soft hover:text-navy-900"
                  }`}
                >
                  <Icon name="user" size={13} />
                  <span>Individual Learner</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDispatchMode("broadcast")}
                  className={`py-1.5 px-3 rounded-xs font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 ${
                    dispatchMode === "broadcast"
                      ? "bg-navy-900 text-white shadow-xs"
                      : "text-ink-soft hover:text-navy-900"
                  }`}
                >
                  <Icon name="mail" size={13} />
                  <span>Broadcast to Cohort</span>
                </button>
              </div>
            </div>

            {/* Template Selection */}
            <div>
              <label className="font-bold text-navy-900 block mb-1">
                Choose Owner-Approved Template
              </label>
              <select
                value={selectedTemplateKey}
                onChange={(e) => {
                  setSelectedTemplateKey(e.target.value);
                  setPlaceholderValues({});
                }}
                className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-navy-900 font-semibold focus:outline-none focus:ring-1 focus:ring-navy-900"
              >
                {templates.length === 0 ? (
                  <option value="">No templates available</option>
                ) : (
                  templates.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.title} ({t.category.toUpperCase()})
                    </option>
                  ))
                )}
              </select>
            </div>

            {dispatchMode === "individual" ? (
              <>
                {/* Quick Fill From Enrolled Learner */}
                <div>
                  <label className="text-[11px] font-semibold text-ink-soft block mb-1">
                    Autofill from Enrolled Learner (Optional)
                  </label>
                  <select
                    defaultValue=""
                    onChange={(e) => handleSelectLearner(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-sm border border-line bg-white text-ink text-xs focus:outline-none focus:ring-1 focus:ring-navy-900"
                  >
                    <option value="">-- Select learner --</option>
                    {learners.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.firstName} {l.lastName} ({l.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recipient Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-navy-900 block mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-navy-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-navy-900 block mb-1">
                      Recipient Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="learner@example.com"
                      className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-navy-900"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3 p-3 bg-paper border border-line rounded-sm">
                <div>
                  <label className="font-bold text-navy-900 block mb-1">
                    Select Target Learner Cohort or Course
                  </label>
                  <select
                    value={cohortCourseId}
                    onChange={(e) => setCohortCourseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm border border-line bg-white text-navy-900 font-semibold focus:outline-none focus:ring-1 focus:ring-navy-900"
                  >
                    <option value="all">
                      All Enrolled Learners Across All Courses ({learners.length} active learners)
                    </option>
                    {cohortOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label} ({c.count} learner{c.count === 1 ? "" : "s"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-navy-900">
                  <Icon name="check-circle" size={14} className="text-emerald-700" />
                  <span>
                    Batch Target: <strong>{targetLearnerCount} learners</strong> will receive this personalized email.
                  </span>
                </div>
                <p className="text-[11px] text-ink-soft">
                  The placeholder <code>{`{first_name}`}</code> is dynamically populated for each recipient. Every email is dispatched and logged into the Outbox registry.
                </p>
              </div>
            )}

            {/* Smart Coupon Selector (Only shows when template needs coupon_code) */}
            {hasCouponPlaceholder && (
              <div className="p-3.5 bg-paper rounded-sm border border-gold-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-navy-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <Icon name="tag" size={13} className="text-gold-700" />
                    <span>Select Active Voucher / Promo Code</span>
                  </label>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
                    Auto-fills code, discount &amp; expiry
                  </span>
                </div>
                <select
                  value={selectedCouponCode}
                  onChange={(e) => handleSelectCoupon(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-white text-navy-900 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-navy-900"
                >
                  <option value="">-- Choose from Created Vouchers --</option>
                  {activeCoupons.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.code} — {c.discountType === "percent" ? `${c.discountValue}% Off` : `£${c.discountValue} Off`} ({c.description})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-ink-soft">
                  Selecting a voucher automatically sets <code>{`{coupon_code}`}</code>, <code>{`{discount_text}`}</code> and <code>{`{expiry_date}`}</code> across your template.
                </p>
              </div>
            )}

            {/* Dynamic Placeholder Inputs */}
            <div className="pt-2 border-t border-line space-y-3">
              <span className="font-bold text-navy-900 block uppercase tracking-wider text-[11px]">
                Allowed Placeholders for this template
              </span>
              {(selectedTemplate?.allowedPlaceholders || []).map((ph) => {
                const label = ph.replace(/_/g, " ");
                const isAutoFilledByCoupon =
                  (ph === "coupon_code" || ph === "discount_text" || ph === "expiry_date") &&
                  Boolean(selectedCouponCode);

                return (
                  <div key={ph}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="capitalize font-semibold text-navy-900 text-[11px]">
                        {label} <code className="font-mono text-ink-soft">({`{${ph}}`})</code>
                      </label>
                      {isAutoFilledByCoupon && (
                        <span className="text-[9px] text-emerald-700 font-bold flex items-center gap-1">
                          <Icon name="check" size={10} /> Auto-filled from voucher
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={placeholderValues[ph] || ""}
                      onChange={(e) => handlePlaceholderChange(ph, e.target.value)}
                      placeholder={`Enter ${label}...`}
                      className={`w-full px-3 py-1.5 rounded-sm border text-xs focus:outline-none focus:ring-1 focus:ring-navy-900 ${
                        isAutoFilledByCoupon
                          ? "bg-emerald-50/50 border-emerald-300 font-semibold text-emerald-950"
                          : "border-line bg-white text-ink"
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-line flex items-center justify-end">
              <button
                type="submit"
                disabled={isSending || (dispatchMode === "broadcast" && targetLearnerCount === 0)}
                className="px-5 py-2.5 rounded-sm bg-navy-900 text-white font-bold hover:bg-navy-700 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <Icon name="mail" size={14} />
                <span>
                  {isSending
                    ? "Dispatching..."
                    : dispatchMode === "broadcast"
                    ? `Broadcast to ${targetLearnerCount} learners`
                    : "Send template email"}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Rendered Preview */}
        <div className="space-y-4">
          <div className="bg-white rounded-md border border-line p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="font-heading text-xl font-bold text-navy-900">
                Live Rendered Email Preview
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200">
                Template Locked
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-ink-soft block text-[11px]">Subject line:</span>
                <p className="font-bold text-navy-900 bg-paper p-2 rounded-sm border border-line">
                  {renderedSubject || "Subject preview..."}
                </p>
              </div>

              <div>
                <span className="text-ink-soft block text-[11px]">Body content:</span>
                <div className="p-4 rounded-sm bg-paper border border-line text-ink whitespace-pre-line leading-relaxed font-sans min-h-[160px]">
                  {renderedBody || "Select a template to view preview."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Audit Log */}
      <div className="bg-white rounded-md border border-line shadow-sm overflow-hidden space-y-0">
        <div className="p-4 border-b border-line bg-paper/60 flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-navy-900">
            Dispatched Messages Audit Log
          </h3>
          <span className="text-xs text-ink-soft">
            {logs.length} logged messages
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line text-ink-soft font-semibold bg-white">
                <th className="py-2.5 px-4">Recipient</th>
                <th className="py-2.5 px-4">Subject</th>
                <th className="py-2.5 px-4">Dispatched At</th>
                <th className="py-2.5 px-4">Sent By Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-paper/30">
                  <td className="py-2.5 px-4 font-bold text-navy-900">
                    {log.recipientEmail}
                  </td>
                  <td className="py-2.5 px-4 text-ink-soft truncate max-w-md">
                    {log.subject}
                  </td>
                  <td className="py-2.5 px-4 text-ink-soft font-mono text-[11px]">
                    {new Date(log.sentAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-2.5 px-4 uppercase text-[10px] font-semibold text-navy-900">
                    {log.sentByRole}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
