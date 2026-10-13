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

interface FundedEligibilityFormProps {
  sourcePage?: string;
  className?: string;
}

export const FundedEligibilityForm: React.FC<FundedEligibilityFormProps> = ({
  sourcePage = "/funding",
  className = "",
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [courseInterest, setCourseInterest] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("Employed (under £25k)");
  const [priorQualification, setPriorQualification] = useState("Below Level 3");
  const [postcode, setPostcode] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [botCheck, setBotCheck] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LeadSubmissionResult | null>(null);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientErrors({});

    if (!consent) {
      setClientErrors((prev) => ({
        ...prev,
        consent:
          "You must consent to our Privacy Policy to submit an eligibility check.",
      }));
      return;
    }

    if (!phone.trim()) {
      setClientErrors((prev) => ({
        ...prev,
        phone: "Phone number is required for funding eligibility checks.",
      }));
      return;
    }

    setLoading(true);
    setResult(null);

    const utm = getStoredUtmParams();

    const res = await submitLeadAction({
      type: "funded_eligibility",
      name,
      email,
      phone,
      course_interest: courseInterest,
      employment_status: employmentStatus,
      prior_qualification: priorQualification,
      postcode,
      message,
      consent,
      botCheck,
      source_page: sourcePage,
      ...utm,
    });

    setLoading(false);
    setResult(res);

    if (res.success) {
      setName("");
      setEmail("");
      setPhone("");
      setCourseInterest("");
      setPostcode("");
      setMessage("");
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
          Eligibility Check Submitted!
        </h3>
        <p className="text-sm text-ink-soft max-w-md mx-auto leading-relaxed">
          {result.message}
        </p>
        <p className="text-xs text-ink-soft">
          Our funding team will review regional allocation and contact you
          within 48 hours.
        </p>
        <div className="pt-3 border-t border-line">
          <a
            href={siteConfig.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-navy-900 hover:text-navy-700 underline underline-offset-4 inline-flex items-center gap-1.5"
          >
            <Icon name="whatsapp" size={14} className="text-gold-500" />
            Have questions now? Message admissions on WhatsApp
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
          Check Your Funding Eligibility
        </h3>
        <p className="text-xs text-ink-soft">
          Complete these quick details to check if you qualify for
          government-funded training (AEB / Free Courses for Jobs).
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

      {/* Name */}
      <div>
        <label
          htmlFor="fe-name"
          className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1"
        >
          Full Name <span className="text-navy-900">*</span>
        </label>
        <input
          id="fe-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Jane Doe"
          className="w-full px-3 py-2.5 rounded-sm border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
        />
        {result?.fieldErrors?.name && (
          <span className="text-xs text-rose-600 block mt-1">
            {result.fieldErrors.name[0]}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Email */}
        <div>
          <label
            htmlFor="fe-email"
            className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1"
          >
            Email Address <span className="text-navy-900">*</span>
          </label>
          <input
            id="fe-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.co.uk"
            className="w-full px-3 py-2.5 rounded-sm border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
          />
          {result?.fieldErrors?.email && (
            <span className="text-xs text-rose-600 block mt-1">
              {result.fieldErrors.email[0]}
            </span>
          )}
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="fe-phone"
            className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1"
          >
            Phone Number <span className="text-navy-900">*</span>
          </label>
          <input
            id="fe-phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07123 456789"
            className="w-full px-3 py-2.5 rounded-sm border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
          />
          {clientErrors.phone && (
            <span className="text-xs text-rose-600 block mt-1">
              {clientErrors.phone}
            </span>
          )}
        </div>
      </div>

      {/* Course of Interest */}
      <div>
        <label
          htmlFor="fe-course"
          className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1"
        >
          Qualification Interested In <span className="text-navy-900">*</span>
        </label>
        <input
          id="fe-course"
          type="text"
          required
          value={courseInterest}
          onChange={(e) => setCourseInterest(e.target.value)}
          placeholder="e.g. Level 3 Diploma in Adult Care"
          className="w-full px-3 py-2.5 rounded-sm border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Employment Status */}
        <div>
          <label
            htmlFor="fe-employment"
            className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1"
          >
            Employment Status <span className="text-navy-900">*</span>
          </label>
          <select
            id="fe-employment"
            value={employmentStatus}
            onChange={(e) => setEmploymentStatus(e.target.value)}
            className="w-full px-3 py-2.5 rounded-sm border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
          >
            <option value="Employed (under £25k)">
              Employed (under £25,000 threshold)
            </option>
            <option value="Employed (£25k+)">
              Employed (£25,000 or above)
            </option>
            <option value="Unemployed / Jobseeker">
              Unemployed (seeking work)
            </option>
            <option value="Self-employed">
              Self-employed
            </option>
          </select>
        </div>

        {/* Prior Qualification */}
        <div>
          <label
            htmlFor="fe-prior"
            className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1"
          >
            Highest Existing Qualification{" "}
            <span className="text-navy-900">*</span>
          </label>
          <select
            id="fe-prior"
            value={priorQualification}
            onChange={(e) => setPriorQualification(e.target.value)}
            className="w-full px-3 py-2.5 rounded-sm border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
          >
            <option value="Below Level 3">
              Below Level 3 (GCSE / Level 1–2)
            </option>
            <option value="Level 3 or above">
              Level 3 or higher (A-Level / Level 3+)
            </option>
            <option value="No formal qualifications">
              No formal qualifications
            </option>
          </select>
        </div>
      </div>

      {/* UK Postcode */}
      <div>
        <label
          htmlFor="fe-postcode"
          className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1"
        >
          UK Postcode <span className="text-navy-900">*</span>
        </label>
        <input
          id="fe-postcode"
          type="text"
          required
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          placeholder="e.g. SE1 7PB"
          className="w-full px-3 py-2.5 rounded-sm border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
        />
        <span className="text-[11px] text-ink-soft block mt-0.5">
          Required to verify regional funding allocation in your local
          authority.
        </span>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="fe-message"
          className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1"
        >
          Additional Information (Optional)
        </label>
        <textarea
          id="fe-message"
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Any specific questions regarding funding eligibility..."
          className="w-full px-3 py-2.5 rounded-sm border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
        />
      </div>

      {/* Consent Checkbox */}
      <div className="pt-2">
        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-ink-soft leading-relaxed">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="w-4 h-4 rounded-sm border-line text-navy-900 focus:ring-navy-900 mt-0.5 flex-shrink-0"
          />
          <span>
            I consent to Smartminds Training College assessing my funding
            eligibility in line with the{" "}
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
          {loading ? "Checking eligibility..." : "Submit funding enquiry"}
        </Button>
      </div>
    </form>
  );
};
