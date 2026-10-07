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

interface FreeAdviceFormProps {
  defaultCourse?: string;
  sourcePage?: string;
  className?: string;
}

export const FreeAdviceForm: React.FC<FreeAdviceFormProps> = ({
  defaultCourse = "",
  sourcePage = "/courses",
  className = "",
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [courseInterest, setCourseInterest] = useState(defaultCourse);
  const [preferredTime, setPreferredTime] = useState("Any time");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [botCheck, setBotCheck] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LeadSubmissionResult | null>(null);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientErrors({});

    // Client-side quick check
    if (!consent) {
      setClientErrors((prev) => ({
        ...prev,
        consent: "You must consent to our Privacy Policy to submit an enquiry.",
      }));
      return;
    }

    setLoading(true);
    setResult(null);

    const utm = getStoredUtmParams();

    const res = await submitLeadAction({
      type: "free_advice",
      name,
      email,
      phone,
      course_interest: courseInterest,
      preferred_time: preferredTime,
      message,
      consent,
      botCheck,
      source_page: sourcePage,
      ...utm,
    });

    setLoading(false);
    setResult(res);

    if (res.success) {
      // Clear inputs
      setName("");
      setEmail("");
      setPhone("");
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
          Enquiry Received!
        </h3>
        <p className="text-sm text-ink-soft max-w-md mx-auto leading-relaxed">
          {result.message}
        </p>
        <div className="pt-3 border-t border-line">
          <a
            href={siteConfig.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-navy-900 hover:text-navy-700 underline underline-offset-4 inline-flex items-center gap-1.5"
          >
            <Icon name="whatsapp" size={14} className="text-gold-500" />
            Need an immediate answer? Chat with us on WhatsApp
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
      {/* Honeypot field for anti-spam bots */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="fa-botCheck">Leave empty</label>
        <input
          type="text"
          id="fa-botCheck"
          name="botCheck"
          value={botCheck}
          onChange={(e) => setBotCheck(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="space-y-1">
        <h3 className="font-heading text-xl font-bold text-navy-900">
          Request Free Course Advice
        </h3>
        <p className="text-xs text-ink-soft">
          Fill out this form and a course adviser will contact you within 24
          hours.
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

      {/* Full Name */}
      <div>
        <label
          htmlFor="fa-name"
          className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1"
        >
          Full Name <span className="text-navy-900">*</span>
        </label>
        <input
          id="fa-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sarah Jenkins"
          className="w-full px-3 py-2.5 rounded-sm border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
        />
        {result?.fieldErrors?.name && (
          <span className="text-xs text-rose-600 block mt-1">
            {result.fieldErrors.name[0]}
          </span>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="fa-email"
          className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1"
        >
          Email Address <span className="text-navy-900">*</span>
        </label>
        <input
          id="fa-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="sarah@example.co.uk"
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
          htmlFor="fa-phone"
          className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1"
        >
          Phone Number (Optional)
        </label>
        <input
          id="fa-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="07123 456789"
          className="w-full px-3 py-2.5 rounded-sm border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
        />
      </div>

      {/* Course of Interest */}
      <div>
        <label
          htmlFor="fa-course"
          className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1"
        >
          Course of Interest
        </label>
        <input
          id="fa-course"
          type="text"
          value={courseInterest}
          onChange={(e) => setCourseInterest(e.target.value)}
          placeholder="e.g. Level 3 Diploma in Adult Care"
          className="w-full px-3 py-2.5 rounded-sm border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
        />
      </div>

      {/* Preferred Contact Time */}
      <div>
        <label
          htmlFor="fa-time"
          className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1"
        >
          Preferred Call Time
        </label>
        <select
          id="fa-time"
          value={preferredTime}
          onChange={(e) => setPreferredTime(e.target.value)}
          className="w-full px-3 py-2.5 rounded-sm border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
        >
          <option value="Any time">Any time during office hours</option>
          <option value="Morning (9am - 12pm)">
            Morning (9:00 AM – 12:00 PM)
          </option>
          <option value="Afternoon (12pm - 4pm)">
            Afternoon (12:00 PM – 4:00 PM)
          </option>
          <option value="Evening (4pm - 6pm)">
            Late Afternoon / Evening (4:00 PM – 6:00 PM)
          </option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="fa-message"
          className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1"
        >
          Your Questions or Background (Optional)
        </label>
        <textarea
          id="fa-message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your current role or goals..."
          className="w-full px-3 py-2.5 rounded-sm border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
        />
      </div>

      {/* Required Consent Checkbox per PRD Section 14 */}
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
            I agree to Smartminds Training College contacting me regarding this
            course enquiry in accordance with the{" "}
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

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Submitting enquiry..." : "Submit advice request"}
        </Button>
      </div>
    </form>
  );
};
