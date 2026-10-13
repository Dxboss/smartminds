"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { EmailSettings, DepartmentKey } from "@/lib/emailSettings";
import {
  saveEmailSettingsAction,
  sendTestDepartmentEmailAction,
  sendBirthdayPromotionAction,
  sendCourseCompletedAction,
} from "@/app/admin/actions";

interface Props {
  initialSettings: EmailSettings;
  canEdit: boolean;
}

export const EmailSettingsManager: React.FC<Props> = ({
  initialSettings,
  canEdit,
}) => {
  const [settings, setSettings] = useState<EmailSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Test Dispatch State
  const [testDept, setTestDept] = useState<DepartmentKey>("admissions");
  const [testEmail, setTestEmail] = useState(initialSettings.adminNotificationEmail || "");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Campaign Simulation State
  const [campaignStudentName, setCampaignStudentName] = useState("Jane Doe");
  const [campaignStudentEmail, setCampaignStudentEmail] = useState(
    initialSettings.adminNotificationEmail || ""
  );
  const [isSendingCampaign, setIsSendingCampaign] = useState(false);
  const [campaignFeedback, setCampaignFeedback] = useState<string | null>(null);

  const handleDeptChange = (
    dept: DepartmentKey,
    field: "email" | "senderName",
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      [dept]: {
        ...prev[dept],
        [field]: value,
      },
    }));
  };

  const handleAutomationToggle = (
    key: keyof EmailSettings["automations"],
    value: boolean | number | string
  ) => {
    setSettings((prev) => ({
      ...prev,
      automations: {
        ...prev.automations,
        [key]: value,
      },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      alert("Permission denied. Only College Owner or Superadmin can modify email settings.");
      return;
    }

    setIsSaving(true);
    setSaveFeedback(null);
    setErrorMessage(null);

    try {
      const res = await saveEmailSettingsAction(settings);
      if (res.success) {
        setSettings(res.settings);
        setSaveFeedback("Email sender configuration successfully saved and active across the college.");
        setTimeout(() => setSaveFeedback(null), 5000);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      alert("Please enter a valid destination email address for testing.");
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await sendTestDepartmentEmailAction({
        department: testDept,
        toEmail: testEmail,
      });

      if (res.success) {
        setTestResult(
          `Test email successfully dispatched via ${res.dispatchedVia === "resend" ? "Live Resend API (ID: " + res.id + ")" : "Local Outbox"} to ${testEmail}.`
        );
      } else {
        setTestResult(`Notice: Dispatched to dev outbox (${res.error || "Simulated"}).`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Test dispatch failed");
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleTriggerBirthdayTest = async () => {
    if (!campaignStudentEmail) {
      alert("Please provide recipient email.");
      return;
    }

    setIsSendingCampaign(true);
    setCampaignFeedback(null);

    try {
      const res = await sendBirthdayPromotionAction({
        studentEmail: campaignStudentEmail,
        studentName: campaignStudentName,
        discountPercent: settings.automations.birthdayDiscountPercent,
        promoCode: settings.automations.birthdayPromoCode,
      });

      if (res.success) {
        setCampaignFeedback(
          `Birthday ${settings.automations.birthdayDiscountPercent}% promotion email successfully dispatched to ${campaignStudentEmail}.`
        );
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to dispatch birthday campaign");
    } finally {
      setIsSendingCampaign(false);
    }
  };

  const handleTriggerCompletionTest = async () => {
    if (!campaignStudentEmail) {
      alert("Please provide recipient email.");
      return;
    }

    setIsSendingCampaign(true);
    setCampaignFeedback(null);

    try {
      const res = await sendCourseCompletedAction({
        studentEmail: campaignStudentEmail,
        studentName: campaignStudentName,
        studentId: "STU-000000",
        courseTitle: "Level 3 Award in Education and Training (AET)",
        levelName: "Level 3",
        awardingBody: "TQUK",
      });

      if (res.success) {
        setCampaignFeedback(
          `Course completion congratulations email successfully dispatched to ${campaignStudentEmail}.`
        );
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to dispatch course completion email");
    } finally {
      setIsSendingCampaign(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Alert */}
      <div className="bg-paper border border-line rounded-md p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-navy-900 text-gold-500 flex items-center justify-center shrink-0">
            <Icon name="mail" className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy-900">
              Departmental Email Routing &amp; Sender Configuration
            </h2>
            <p className="text-sm text-ink-soft mt-1">
              Configure authorized sender identities across admissions, finance, student services, and marketing.
              All transactional emails automatically adapt to these settings without changing code or restarting servers.
            </p>
          </div>
        </div>
      </div>

      {saveFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-md flex items-center gap-3 text-sm">
          <Icon name="check-circle" className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveFeedback}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md flex items-center gap-3 text-sm">
          <Icon name="alert-circle" className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION 1: DEPARTMENTAL SENDERS */}
        <div className="bg-white border border-line rounded-md p-6 space-y-6">
          <div className="border-b border-line pb-4">
            <h3 className="text-base font-bold text-navy-900">
              Authorized Departmental Senders
            </h3>
            <p className="text-xs text-ink-soft mt-0.5">
              Email addresses and display names presented to learners and applicants in their inboxes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Admissions */}
            <div className="bg-paper p-4 rounded border border-line space-y-3">
              <div className="flex items-center gap-2 text-navy-900 font-bold text-sm">
                <Icon name="user" className="w-4 h-4 text-gold-700" />
                <span>Admissions &amp; Enquiries</span>
              </div>
              <p className="text-xs text-ink-soft">
                Dispatches welcome packs, lead responses, and induction webinars.
              </p>
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Sender Display Name
                </label>
                <input
                  type="text"
                  value={settings.admissions.senderName}
                  onChange={(e) => handleDeptChange("admissions", "senderName", e.target.value)}
                  disabled={!canEdit}
                  className="w-full text-sm bg-white border border-line rounded px-3 py-1.5 text-ink focus:border-navy-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.admissions.email}
                  onChange={(e) => handleDeptChange("admissions", "email", e.target.value)}
                  disabled={!canEdit}
                  className="w-full text-sm bg-white border border-line rounded px-3 py-1.5 text-ink focus:border-navy-900 outline-none"
                />
              </div>
            </div>

            {/* Finance & Accounts */}
            <div className="bg-paper p-4 rounded border border-line space-y-3">
              <div className="flex items-center gap-2 text-navy-900 font-bold text-sm">
                <Icon name="credit-card" className="w-4 h-4 text-gold-700" />
                <span>Finance &amp; Accounts</span>
              </div>
              <p className="text-xs text-ink-soft">
                Dispatches tuition receipts, payment schedules, and instalment notices.
              </p>
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Sender Display Name
                </label>
                <input
                  type="text"
                  value={settings.finance.senderName}
                  onChange={(e) => handleDeptChange("finance", "senderName", e.target.value)}
                  disabled={!canEdit}
                  className="w-full text-sm bg-white border border-line rounded px-3 py-1.5 text-ink focus:border-navy-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.finance.email}
                  onChange={(e) => handleDeptChange("finance", "email", e.target.value)}
                  disabled={!canEdit}
                  className="w-full text-sm bg-white border border-line rounded px-3 py-1.5 text-ink focus:border-navy-900 outline-none"
                />
              </div>
            </div>

            {/* Student Services */}
            <div className="bg-paper p-4 rounded border border-line space-y-3">
              <div className="flex items-center gap-2 text-navy-900 font-bold text-sm">
                <Icon name="graduation-cap" className="w-4 h-4 text-gold-700" />
                <span>Student Services &amp; Academic Support</span>
              </div>
              <p className="text-xs text-ink-soft">
                Dispatches tutor feedback, coursework grades, and course completions.
              </p>
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Sender Display Name
                </label>
                <input
                  type="text"
                  value={settings.students.senderName}
                  onChange={(e) => handleDeptChange("students", "senderName", e.target.value)}
                  disabled={!canEdit}
                  className="w-full text-sm bg-white border border-line rounded px-3 py-1.5 text-ink focus:border-navy-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.students.email}
                  onChange={(e) => handleDeptChange("students", "email", e.target.value)}
                  disabled={!canEdit}
                  className="w-full text-sm bg-white border border-line rounded px-3 py-1.5 text-ink focus:border-navy-900 outline-none"
                />
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-paper p-4 rounded border border-line space-y-3">
              <div className="flex items-center gap-2 text-navy-900 font-bold text-sm">
                <Icon name="shield-check" className="w-4 h-4 text-gold-700" />
                <span>Account Security</span>
              </div>
              <p className="text-xs text-ink-soft">
                Dispatches password reset tokens and security update alerts.
              </p>
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Sender Display Name
                </label>
                <input
                  type="text"
                  value={settings.security.senderName}
                  onChange={(e) => handleDeptChange("security", "senderName", e.target.value)}
                  disabled={!canEdit}
                  className="w-full text-sm bg-white border border-line rounded px-3 py-1.5 text-ink focus:border-navy-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.security.email}
                  onChange={(e) => handleDeptChange("security", "email", e.target.value)}
                  disabled={!canEdit}
                  className="w-full text-sm bg-white border border-line rounded px-3 py-1.5 text-ink focus:border-navy-900 outline-none"
                />
              </div>
            </div>

            {/* Marketing & Promotions */}
            <div className="bg-paper p-4 rounded border border-line space-y-3 md:col-span-2">
              <div className="flex items-center gap-2 text-navy-900 font-bold text-sm">
                <Icon name="sparkles" className="w-4 h-4 text-gold-700" />
                <span>Promotions &amp; Alumni Rewards</span>
              </div>
              <p className="text-xs text-ink-soft">
                Dispatches student birthday discounts, alumni progression scholarships, and newsletters.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-soft mb-1">
                    Sender Display Name
                  </label>
                  <input
                    type="text"
                    value={settings.marketing.senderName}
                    onChange={(e) => handleDeptChange("marketing", "senderName", e.target.value)}
                    disabled={!canEdit}
                    className="w-full text-sm bg-white border border-line rounded px-3 py-1.5 text-ink focus:border-navy-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-soft mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.marketing.email}
                    onChange={(e) => handleDeptChange("marketing", "email", e.target.value)}
                    disabled={!canEdit}
                    className="w-full text-sm bg-white border border-line rounded px-3 py-1.5 text-ink focus:border-navy-900 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: ADMIN ALERT RECIPIENT */}
        <div className="bg-white border border-line rounded-md p-6 space-y-4">
          <div className="border-b border-line pb-4">
            <h3 className="text-base font-bold text-navy-900">
              Administration Alert Inbox
            </h3>
            <p className="text-xs text-ink-soft mt-0.5">
              The internal staff email destination where copies of student payment receipts and prospective student leads are delivered.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-soft mb-1">
              Admin &amp; Finance Notification Email
            </label>
            <input
              type="email"
              value={settings.adminNotificationEmail}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  adminNotificationEmail: e.target.value,
                }))
              }
              disabled={!canEdit}
              placeholder="e.g. director@smartmindstraining.co.uk"
              className="max-w-md w-full text-sm bg-paper border border-line rounded px-3 py-2 text-ink focus:border-navy-900 outline-none font-medium"
            />
          </div>
        </div>

        {/* SECTION 3: AUTOMATIONS & PROMOTIONS */}
        <div className="bg-white border border-line rounded-md p-6 space-y-6">
          <div className="border-b border-line pb-4">
            <h3 className="text-base font-bold text-navy-900">
              Automated Lifecycle Triggers &amp; Marketing
            </h3>
            <p className="text-xs text-ink-soft mt-0.5">
              Configure event-driven emails triggered by student milestones and dates.
            </p>
          </div>

          <div className="space-y-4">
            {/* Birthday Marketing */}
            <div className="p-4 bg-paper rounded border border-line flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-navy-900">
                    Student Birthday Marketing Offer
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-gold-100 text-gold-800 border border-gold-300">
                    High Conversion
                  </span>
                </div>
                <p className="text-xs text-ink-soft mt-1">
                  Automatically delivers a celebratory branded email with an exclusive discount code on the student&apos;s birthday.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-navy-900">Discount:</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={settings.automations.birthdayDiscountPercent}
                    onChange={(e) =>
                      handleAutomationToggle("birthdayDiscountPercent", parseInt(e.target.value) || 10)
                    }
                    disabled={!canEdit}
                    className="w-16 text-center text-sm bg-white border border-line rounded py-1 px-1 font-bold text-navy-900"
                  />
                  <span className="text-xs font-bold text-navy-900">%</span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-navy-900">Code:</label>
                  <input
                    type="text"
                    value={settings.automations.birthdayPromoCode}
                    onChange={(e) =>
                      handleAutomationToggle("birthdayPromoCode", e.target.value.toUpperCase())
                    }
                    disabled={!canEdit}
                    className="w-24 text-center text-sm bg-white border border-line rounded py-1 px-1 font-mono font-bold text-navy-900"
                  />
                </div>

                <label className="relative inline-flex items-center cursor-pointer ml-2">
                  <input
                    type="checkbox"
                    checked={settings.automations.birthdayDiscountEnabled}
                    onChange={(e) => handleAutomationToggle("birthdayDiscountEnabled", e.target.checked)}
                    disabled={!canEdit}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy-900"></div>
                </label>
              </div>
            </div>

            {/* Course Completion Congratulations */}
            <div className="p-4 bg-paper rounded border border-line flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-sm text-navy-900">
                  Course Completion &amp; Certification Notification
                </span>
                <p className="text-xs text-ink-soft mt-1">
                  Dispatches congratulations and awarding body certificate dispatch details when a student completes all units.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.automations.courseCompletionEmailEnabled}
                  onChange={(e) => handleAutomationToggle("courseCompletionEmailEnabled", e.target.checked)}
                  disabled={!canEdit}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy-900"></div>
              </label>
            </div>

            {/* Lead Enquiry Auto-Reply */}
            <div className="p-4 bg-paper rounded border border-line flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-sm text-navy-900">
                  Prospective Learner Enquiry Auto-Reply
                </span>
                <p className="text-xs text-ink-soft mt-1">
                  Instantly sends a branded confirmation to visitors who submit contact or course enquiry forms.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.automations.leadAutoReplyEnabled}
                  onChange={(e) => handleAutomationToggle("leadAutoReplyEnabled", e.target.checked)}
                  disabled={!canEdit}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy-900"></div>
              </label>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        {canEdit && (
          <div className="flex items-center justify-between bg-paper p-4 rounded-md border border-line">
            <span className="text-xs text-ink-soft">
              Last saved: {new Date(settings.updatedAt).toLocaleString("en-GB")}
            </span>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-navy-900 hover:bg-navy-700 text-white font-bold px-6 py-2.5 rounded text-sm transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Icon name="clock" className="w-4 h-4 animate-spin" />
                  <span>Saving Configuration...</span>
                </>
              ) : (
                <>
                  <Icon name="check-circle" className="w-4 h-4 text-gold-500" />
                  <span>Save Email Configuration</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>

      {/* SECTION 4: LIVE TRANSMISSION TESTING & VERIFICATION */}
      <div className="bg-white border border-line rounded-md p-6 space-y-6">
        <div className="border-b border-line pb-4">
          <h3 className="text-base font-bold text-navy-900">
            Inbox Delivery Verification &amp; Test Transmission
          </h3>
          <p className="text-xs text-ink-soft mt-0.5">
            Test and verify that each departmental sender renders cleanly in Gmail, Outlook, and mobile devices.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Departmental Sender Test */}
          <div className="bg-paper p-5 rounded border border-line space-y-4">
            <h4 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <Icon name="mail" className="w-4 h-4 text-gold-700" />
              <span>Test Departmental Dispatch</span>
            </h4>

            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1">
                Select Department
              </label>
              <select
                value={testDept}
                onChange={(e) => setTestDept(e.target.value as DepartmentKey)}
                className="w-full text-sm bg-white border border-line rounded px-3 py-1.5 text-ink outline-none"
              >
                <option value="admissions">Admissions ({settings.admissions.email})</option>
                <option value="finance">Finance ({settings.finance.email})</option>
                <option value="students">Student Services ({settings.students.email})</option>
                <option value="security">Account Security ({settings.security.email})</option>
                <option value="marketing">Promotions ({settings.marketing.email})</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1">
                Destination Email
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your-email@example.com"
                className="w-full text-sm bg-white border border-line rounded px-3 py-1.5 text-ink outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSendTest}
              disabled={isSendingTest}
              className="w-full bg-navy-900 hover:bg-navy-700 text-white font-bold py-2 px-4 rounded text-xs transition-colors flex items-center justify-center gap-2"
            >
              {isSendingTest ? (
                <>
                  <Icon name="clock" className="w-4 h-4 animate-spin" />
                  <span>Transmitting Test...</span>
                </>
              ) : (
                <>
                  <Icon name="mail" className="w-4 h-4 text-gold-500" />
                  <span>Dispatch Verified Department Test</span>
                </>
              )}
            </button>

            {testResult && (
              <p className="text-xs text-navy-900 bg-emerald-50 border border-emerald-200 p-2.5 rounded font-medium">
                {testResult}
              </p>
            )}
          </div>

          {/* 2. Automated Campaign Simulation */}
          <div className="bg-paper p-5 rounded border border-line space-y-4">
            <h4 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <Icon name="sparkles" className="w-4 h-4 text-gold-700" />
              <span>Simulate Automated Lifecycle Campaigns</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={campaignStudentName}
                  onChange={(e) => setCampaignStudentName(e.target.value)}
                  className="w-full text-sm bg-white border border-line rounded px-2.5 py-1.5 text-ink outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={campaignStudentEmail}
                  onChange={(e) => setCampaignStudentEmail(e.target.value)}
                  className="w-full text-sm bg-white border border-line rounded px-2.5 py-1.5 text-ink outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleTriggerBirthdayTest}
                disabled={isSendingCampaign}
                className="flex-1 bg-white hover:bg-gold-50 border border-gold-500 text-navy-900 font-bold py-2 px-2 rounded text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Icon name="sparkles" className="w-3.5 h-3.5 text-gold-700" />
                <span>Test Birthday Email</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerCompletionTest}
                disabled={isSendingCampaign}
                className="flex-1 bg-white hover:bg-gold-50 border border-gold-500 text-navy-900 font-bold py-2 px-2 rounded text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Icon name="graduation-cap" className="w-3.5 h-3.5 text-gold-700" />
                <span>Test Completion Email</span>
              </button>
            </div>

            {campaignFeedback && (
              <p className="text-xs text-navy-900 bg-emerald-50 border border-emerald-200 p-2.5 rounded font-medium">
                {campaignFeedback}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
