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

interface GeneralContactFormProps {
  sourcePage?: string;
  className?: string;
}

export const GeneralContactForm: React.FC<GeneralContactFormProps> = ({
  sourcePage = "/contact",
  className = "",
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
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
        consent: "You must consent to our Privacy Policy to submit a message.",
      }));
      return;
    }

    if (!subject.trim()) {
      setClientErrors((prev) => ({
        ...prev,
        subject: "Please provide a subject for your enquiry.",
      }));
      return;
    }

    if (message.trim().length < 10) {
      setClientErrors((prev) => ({
        ...prev,
        message: "Message must be at least 10 characters.",
      }));
      return;
    }

    setLoading(true);
    setResult(null);

    const utm = getStoredUtmParams();

    const res = await submitLeadAction({
      type: "general_contact",
      name,
      email,
      phone,
      subject,
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
      setSubject("");
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
          Message Sent!
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
            Prefer an instant response? Message us on WhatsApp
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
          Send Us a Message
        </h3>
        <p className="text-xs text-ink-soft">
          Our college administration team will reply to your enquiry within one
          working day.
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
          htmlFor="gc-name"
          className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1"
        >
          Full Name <span className="text-navy-900">*</span>
        </label>
        <input
          id="gc-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. David Williams"
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
            htmlFor="gc-email"
            className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1"
          >
            Email Address <span className="text-navy-900">*</span>
          </label>
          <input
            id="gc-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="david@example.co.uk"
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
            htmlFor="gc-phone"
            className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1"
          >
            Phone Number (Optional)
          </label>
          <input
            id="gc-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07123 456789"
            className="w-full px-3 py-2.5 rounded-sm border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label
          htmlFor="gc-subject"
          className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1"
        >
          Subject <span className="text-navy-900">*</span>
        </label>
        <input
          id="gc-subject"
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Question about Level 4 Adult Care intake dates"
          className="w-full px-3 py-2.5 rounded-sm border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
        />
        {clientErrors.subject && (
          <span className="text-xs text-rose-600 block mt-1">
            {clientErrors.subject}
          </span>
        )}
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="gc-message"
          className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1"
        >
          Message <span className="text-navy-900">*</span>
        </label>
        <textarea
          id="gc-message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message here..."
          className="w-full px-3 py-2.5 rounded-sm border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
        />
        {clientErrors.message && (
          <span className="text-xs text-rose-600 block mt-1">
            {clientErrors.message}
          </span>
        )}
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
            I agree to Smartminds processing my contact details to reply to this
            enquiry per the{" "}
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
          {loading ? "Sending message..." : "Send message"}
        </Button>
      </div>
    </form>
  );
};
