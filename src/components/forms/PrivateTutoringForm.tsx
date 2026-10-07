"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  submitLeadAction,
  LeadSubmissionResult,
} from "@/app/actions/leadActions";
import { getStoredUtmParams } from "@/lib/utm";
import { siteConfig } from "@/content/siteConfig";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

interface PrivateTutoringFormProps {
  sourcePage?: string;
  className?: string;
}

export const PrivateTutoringForm: React.FC<PrivateTutoringFormProps> = ({
  sourcePage = "/private-tutoring",
  className = "",
}) => {
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentName, setStudentName] = useState("");
  const [yearGroup, setYearGroup] = useState("Year 10 (GCSE)");
  const [subject, setSubject] = useState("Mathematics & English (Both)");
  const [message, setMessage] = useState("");
  const [parentConsent, setParentConsent] = useState(false);
  const [consent, setConsent] = useState(false);
  const [botCheck, setBotCheck] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LeadSubmissionResult | null>(null);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientErrors({});

    if (!parentConsent) {
      setClientErrors((prev) => ({
        ...prev,
        parentConsent:
          "Parent or legal guardian consent is required for children's tutoring.",
      }));
      return;
    }

    if (!consent) {
      setClientErrors((prev) => ({
        ...prev,
        consent:
          "You must consent to our Privacy Policy to submit this enquiry.",
      }));
      return;
    }

    setLoading(true);
    setResult(null);

    const utm = getStoredUtmParams();

    const res = await submitLeadAction({
      type: "private_tutoring",
      name: parentName,
      email,
      phone,
      student_name: studentName,
      student_year_group: yearGroup,
      subject_interest: subject,
      message,
      parent_consent: parentConsent,
      consent,
      botCheck,
      source_page: sourcePage,
      ...utm,
    });

    setLoading(false);
    setResult(res);

    if (res.success) {
      setParentName("");
      setEmail("");
      setPhone("");
      setStudentName("");
      setMessage("");
      setParentConsent(false);
      setConsent(false);
    }
  };

  if (result?.success) {
    return (
      <div className="p-8 rounded-lg bg-paper border border-line text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-navy-900 text-white flex items-center justify-center mx-auto">
          <Icon name="check" size={24} className="text-gold-500" />
        </div>
        <h3 className="font-heading text-2xl font-bold text-navy-900">
          Tutoring Enquiry Submitted!
        </h3>
        <p className="text-sm text-ink-soft max-w-md mx-auto leading-relaxed">
          {result.message}
        </p>
        <p className="text-xs text-ink-soft">
          Our tutoring coordinator will review subject availability and contact
          you with tutor profiles.
        </p>
        <div className="pt-3 border-t border-line">
          <a
            href={siteConfig.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-navy-900 hover:text-navy-700 underline underline-offset-4 inline-flex items-center gap-1.5"
          >
            <Icon name="whatsapp" size={14} className="text-gold-500" />
            Speak with the tutoring team on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 bg-white rounded-lg border border-line p-6 sm:p-8 shadow-subtle ${className}`.trim()}
      noValidate
    >
      <div className="hidden" aria-hidden="true">
        <input
          type="text"
          name="botCheck"
          value={botCheck}
          onChange={(e) => setBotCheck(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="space-y-1">
        <h3 className="font-heading text-xl font-bold text-navy-900">
          Enquire About 1-on-1 Tutoring
        </h3>
        <p className="text-xs text-ink-soft">
          Structured online tutoring for KS3 and GCSE students with verified,
          DBS-checked educators.
        </p>
      </div>

      {result?.message && !result.success && (
        <div
          role="alert"
          className="p-3 rounded-sm bg-rose-50 border border-rose-200 text-rose-800 text-xs"
        >
          {result.message}
        </div>
      )}

      {/* Parent/Guardian Details */}
      <div className="p-4 rounded-sm bg-paper border border-line space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-navy-900 block font-heading">
          Parent or Legal Guardian Information
        </span>

        <div>
          <label
            htmlFor="pt-parent"
            className="block text-xs font-bold text-ink-soft mb-1"
          >
            Parent/Guardian Full Name <span className="text-navy-900">*</span>
          </label>
          <input
            id="pt-parent"
            type="text"
            required
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder="e.g. Rachel Thomas"
            className="w-full px-3 py-2 rounded-sm border border-line bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="pt-email"
              className="block text-xs font-bold text-ink-soft mb-1"
            >
              Email Address <span className="text-navy-900">*</span>
            </label>
            <input
              id="pt-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rachel@example.com"
              className="w-full px-3 py-2 rounded-sm border border-line bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
            />
          </div>

          <div>
            <label
              htmlFor="pt-phone"
              className="block text-xs font-bold text-ink-soft mb-1"
            >
              Phone Number <span className="text-navy-900">*</span>
            </label>
            <input
              id="pt-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07987 654321"
              className="w-full px-3 py-2 rounded-sm border border-line bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
            />
          </div>
        </div>
      </div>

      {/* Student Details */}
      <div className="p-4 rounded-sm bg-paper border border-line space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-navy-900 block font-heading">
          Student Details (Child)
        </span>

        <div>
          <label
            htmlFor="pt-student"
            className="block text-xs font-bold text-ink-soft mb-1"
          >
            Student First Name <span className="text-navy-900">*</span>
          </label>
          <input
            id="pt-student"
            type="text"
            required
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="e.g. Leo"
            className="w-full px-3 py-2 rounded-sm border border-line bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="pt-year"
              className="block text-xs font-bold text-ink-soft mb-1"
            >
              Current Year Group <span className="text-navy-900">*</span>
            </label>
            <select
              id="pt-year"
              value={yearGroup}
              onChange={(e) => setYearGroup(e.target.value)}
              className="w-full px-3 py-2 rounded-sm border border-line bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
            >
              <option value="Year 7 (KS3)">Year 7 (KS3)</option>
              <option value="Year 8 (KS3)">Year 8 (KS3)</option>
              <option value="Year 9 (KS3)">Year 9 (KS3)</option>
              <option value="Year 10 (GCSE)">Year 10 (GCSE Prep)</option>
              <option value="Year 11 (GCSE)">Year 11 (GCSE Final Year)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="pt-subject"
              className="block text-xs font-bold text-ink-soft mb-1"
            >
              Subject Needed <span className="text-navy-900">*</span>
            </label>
            <select
              id="pt-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-sm border border-line bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
            >
              <option value="Mathematics">Mathematics</option>
              <option value="English Language & Literature">
                English Language & Literature
              </option>
              <option value="Mathematics & English (Both)">
                Both Mathematics & English
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="pt-message"
          className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1"
        >
          Learning Targets or Needs (Optional)
        </label>
        <textarea
          id="pt-message"
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. Aiming for Grade 7+ in GCSE Maths, needs help with algebra..."
          className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
        />
      </div>

      {/* Safeguarding & Parent Consent per PRD Section 10.6 & 16 */}
      <div className="space-y-2 pt-2">
        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-ink-soft leading-relaxed">
          <input
            type="checkbox"
            required
            checked={parentConsent}
            onChange={(e) => setParentConsent(e.target.checked)}
            className="w-4 h-4 rounded-sm border-line text-navy-900 focus:ring-navy-900 mt-0.5 flex-shrink-0"
          />
          <span>
            I confirm that I am the parent or legal guardian of the named
            student and consent to enquiring on their behalf. All tutors are
            enhanced DBS checked in line with our safeguarding policy
            (PLACEHOLDER: safeguarding policy supplied by owner).{" "}
            <span className="text-navy-900 font-bold">*</span>
          </span>
        </label>
        {clientErrors.parentConsent && (
          <span className="text-xs text-rose-600 block mt-1">
            {clientErrors.parentConsent}
          </span>
        )}

        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-ink-soft leading-relaxed">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="w-4 h-4 rounded-sm border-line text-navy-900 focus:ring-navy-900 mt-0.5 flex-shrink-0"
          />
          <span>
            I agree to the Smartminds{" "}
            <Link
              href="/privacy"
              className="text-navy-900 underline underline-offset-2 font-semibold"
            >
              Privacy Policy
            </Link>
            . <span className="text-navy-900 font-bold">*</span>
          </span>
        </label>
        {clientErrors.consent && (
          <span className="text-xs text-rose-600 block mt-1">
            {clientErrors.consent}
          </span>
        )}
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full"
          disabled={loading}
        >
          {loading
            ? "Submitting tutoring request..."
            : "Submit tutoring enquiry"}
        </Button>
      </div>
    </form>
  );
};
