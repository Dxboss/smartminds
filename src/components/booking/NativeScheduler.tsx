"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/content/siteConfig";
import { courses } from "@/content/courses";
import {
  getPublicAvailableSlotsAction,
  createPublicBookingAction,
  DaySlotInfo,
} from "@/app/actions/bookingActions";

interface NativeSchedulerProps {
  courseInterest?: string;
  onBooked?: () => void;
}

export const NativeScheduler: React.FC<NativeSchedulerProps> = ({
  courseInterest,
  onBooked,
}) => {
  const [days, setDays] = useState<DaySlotInfo[]>([]);
  const [loadingDays, setLoadingDays] = useState(true);

  // Form states
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(courseInterest || "Diploma in Adult Care (RQF)");
  const [notes, setNotes] = useState("");

  const [meetingPlatform, setMeetingPlatform] = useState<"google_meet" | "phone">("google_meet");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    formattedDate: string;
    phone: string;
    course: string;
    platform: "google_meet" | "phone" | "zoom";
    meetingLink?: string;
  } | null>(null);

  // Fetch available dates and times
  useEffect(() => {
    async function loadSlots() {
      try {
        const available = await getPublicAvailableSlotsAction();
        setDays(available);
        const firstAvailable = available.find((d) => !d.isBlocked && d.availableTimes.length > 0);
        if (firstAvailable) {
          setSelectedDate(firstAvailable.dateString);
          setSelectedTime(firstAvailable.availableTimes[0] || "11:00");
        }
      } catch (err) {
        console.error("Failed to load appointment slots:", err);
      } finally {
        setLoadingDays(false);
      }
    }
    loadSlots();
  }, []);

  const currentDayInfo = days.find((d) => d.dateString === selectedDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedDate || !selectedTime) {
      setError("Please select a date and an available time slot.");
      return;
    }
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError("Please provide your name, email, and UK contact phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createPublicBookingAction({
        fullName,
        email,
        phone,
        courseInterest: selectedCourse,
        date: selectedDate,
        time: selectedTime,
        notes,
        meetingPlatform,
      });

      setConfirmedBooking({
        formattedDate: res.formattedDate,
        phone,
        course: selectedCourse,
        platform: (res.meetingPlatform as "google_meet" | "phone" | "zoom") || meetingPlatform,
        meetingLink: res.meetingLink,
      });

      if (onBooked) {
        onBooked();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to book consultation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Success confirmation screen
  if (confirmedBooking) {
    return (
      <div className="py-6 px-4 sm:px-6 text-center space-y-6 animate-fade-in bg-paper rounded-lg border border-line">
        <div className="w-16 h-16 rounded-full bg-navy-900 text-white flex items-center justify-center mx-auto shadow-md border-2 border-gold-500">
          <Icon name="check" size={32} className="text-gold-300" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            Consultation Confirmed
          </span>
          <h3 className="font-heading text-2xl sm:text-3xl font-bold text-navy-900">
            We Look Forward to Speaking With You
          </h3>
          <p className="text-sm text-ink-soft max-w-md mx-auto leading-relaxed">
            Your appointment has been registered directly with our college admissions team. A calendar confirmation has been sent to your inbox.
          </p>
        </div>

        {/* Appointment summary card */}
        <div className="bg-white p-5 rounded-md border border-line max-w-md mx-auto text-left space-y-3 shadow-subtle">
          <div className="flex items-start justify-between border-b border-line pb-3">
            <div>
              <span className="text-xs font-mono text-ink-soft block uppercase">Scheduled Time</span>
              <strong className="text-sm font-semibold text-navy-900">{confirmedBooking.formattedDate}</strong>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-sm bg-navy-900 text-gold-300">
              15 Mins
            </span>
          </div>

          <div className="text-xs space-y-2 text-ink-soft">
            <div>
              <span className="font-semibold text-navy-900">Target Qualification:</span> {confirmedBooking.course}
            </div>
            <div>
              <span className="font-semibold text-navy-900">Contact Number:</span> {confirmedBooking.phone}
            </div>
            <div>
              <span className="font-semibold text-navy-900">Consultation Format:</span>{" "}
              {confirmedBooking.platform === "google_meet"
                ? "Live Google Meet (Opens in your web browser)"
                : "Telephone Call (Adviser calls your number directly)"}
            </div>
            {confirmedBooking.platform === "google_meet" && confirmedBooking.meetingLink && (
              <div className="pt-2 p-3 rounded-sm bg-paper border border-line space-y-2">
                <span className="block text-[11px] font-bold text-navy-900">
                  Your Google Meet Room Link:
                </span>
                <a
                  href={confirmedBooking.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono font-bold text-navy-900 underline break-all inline-flex items-center gap-1.5 hover:text-navy-700"
                >
                  <Icon name="video" size={14} className="text-gold-500 shrink-0" />
                  <span>{confirmedBooking.meetingLink}</span>
                </a>
                <p className="text-[10px] text-ink-soft">
                  Click to open at your scheduled time. Works directly on mobile or desktop with zero app downloads.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Direct Action Links */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <a
            href={siteConfig.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs tracking-wide transition-colors min-h-[44px]"
          >
            <Icon name="whatsapp" size={16} />
            <span>Chat on WhatsApp Now</span>
          </a>
          <a
            href={`tel:${siteConfig.contact.phone.replace(/\s+/g, "")}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm border border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white font-semibold text-xs tracking-wide transition-colors min-h-[44px]"
          >
            <Icon name="phone" size={16} />
            <span>Call Admissions</span>
          </a>
        </div>
      </div>
    );
  }

  // 2. Booking form & slot selector
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-sm bg-red-50 border border-red-200 text-xs font-semibold text-red-900 flex items-center gap-2"
        >
          <Icon name="alert-circle" size={16} className="text-red-700 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Select Consultation Date */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-navy-900">
            1. Select Consultation Date
          </label>
          <span className="text-[11px] text-ink-soft font-mono">UK Time (London)</span>
        </div>

        {loadingDays ? (
          <div className="py-6 text-center text-xs text-ink-soft animate-pulse">
            Loading available dates from college calendar...
          </div>
        ) : (
          <div className="flex sm:grid sm:grid-cols-5 gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0">
            {days.slice(0, 10).map((d) => {
              const isSelected = selectedDate === d.dateString;
              const isBlocked = d.isBlocked;

              return (
                <button
                  key={d.dateString}
                  type="button"
                  disabled={isBlocked}
                  onClick={() => {
                    setSelectedDate(d.dateString);
                    if (d.availableTimes.length > 0) {
                      setSelectedTime(d.availableTimes[0]);
                    }
                  }}
                  className={`flex-shrink-0 w-20 sm:w-auto p-2.5 rounded-sm text-center transition-all flex flex-col justify-center items-center min-h-[64px] border ${
                    isBlocked
                      ? "bg-paper/50 border-line text-ink-soft/40 cursor-not-allowed opacity-60 line-through"
                      : isSelected
                      ? "bg-navy-900 text-white border-navy-900 shadow-sm ring-2 ring-gold-500"
                      : "bg-white hover:bg-paper border-line text-navy-900 hover:border-navy-700"
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase block ${isSelected ? "text-gold-300" : "text-ink-soft"}`}>
                    {d.dayLabel}
                  </span>
                  <span className="text-xs font-bold block mt-0.5">
                    {d.dateLabel}
                  </span>
                  {isBlocked && (
                    <span className="text-[9px] text-red-600 font-semibold block mt-0.5">
                      Unavailable
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 2: Select Available Time Slot */}
      {currentDayInfo && !currentDayInfo.isBlocked && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-2">
            2. Pick an Available Time Slot
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {currentDayInfo.availableTimes.map((t) => {
              const isSelected = selectedTime === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTime(t)}
                  className={`py-2 px-3 rounded-sm text-xs font-bold transition-all min-h-[44px] flex items-center justify-center border ${
                    isSelected
                      ? "bg-navy-900 text-gold-300 border-navy-900 shadow-sm ring-2 ring-gold-500"
                      : "bg-white hover:bg-paper border-line text-navy-900 hover:border-navy-900"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Contact & Qualification Details */}
      <div className="space-y-4 pt-4 border-t border-line">
        <label className="block text-xs font-bold uppercase tracking-wider text-navy-900">
          3. Your Contact Information
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="booking-name" className="block text-xs font-semibold text-navy-900 mb-1">
              Full Name *
            </label>
            <input
              id="booking-name"
              type="text"
              required
              placeholder="e.g. Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full py-2.5 px-3 rounded-sm border border-line bg-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
            />
          </div>

          <div>
            <label htmlFor="booking-email" className="block text-xs font-semibold text-navy-900 mb-1">
              Email Address *
            </label>
            <input
              id="booking-email"
              type="email"
              required
              placeholder="e.g. name@example.co.uk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-2.5 px-3 rounded-sm border border-line bg-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="booking-phone" className="block text-xs font-semibold text-navy-900 mb-1">
              Phone Number (For Adviser to Call) *
            </label>
            <input
              id="booking-phone"
              type="tel"
              required
              placeholder="e.g. 07932 034 548"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full py-2.5 px-3 rounded-sm border border-line bg-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
            />
          </div>

          <div>
            <label htmlFor="booking-course" className="block text-xs font-semibold text-navy-900 mb-1">
              Qualification of Interest
            </label>
            <select
              id="booking-course"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full py-2.5 px-3 rounded-sm border border-line bg-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[44px]"
            >
              {courses
                .filter((c) => c.published)
                .map((c) => (
                  <option key={c.id} value={c.title}>
                    {c.title}
                  </option>
                ))}
              <option value="General Course Advice">General Course Advice / Multiple Courses</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy-900 mb-1.5">
            Consultation Format
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMeetingPlatform("google_meet")}
              className={`p-3 rounded-sm border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                meetingPlatform === "google_meet"
                  ? "bg-navy-900 text-white border-navy-900 shadow-sm ring-1 ring-gold-500"
                  : "bg-white text-navy-900 border-line hover:border-navy-700"
              }`}
            >
              <Icon name="video" size={18} className={meetingPlatform === "google_meet" ? "text-gold-300" : "text-navy-900"} />
              <div>
                <strong className="block text-xs font-heading font-bold">Google Meet Video Call</strong>
                <span className={`text-[11px] block mt-0.5 ${meetingPlatform === "google_meet" ? "text-white/80" : "text-ink-soft"}`}>
                  1-click browser video call • No software download
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMeetingPlatform("phone")}
              className={`p-3 rounded-sm border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                meetingPlatform === "phone"
                  ? "bg-navy-900 text-white border-navy-900 shadow-sm ring-1 ring-gold-500"
                  : "bg-white text-navy-900 border-line hover:border-navy-700"
              }`}
            >
              <Icon name="phone" size={18} className={meetingPlatform === "phone" ? "text-gold-300" : "text-navy-900"} />
              <div>
                <strong className="block text-xs font-heading font-bold">Phone Consultation</strong>
                <span className={`text-[11px] block mt-0.5 ${meetingPlatform === "phone" ? "text-white/80" : "text-ink-soft"}`}>
                  Adviser calls your UK phone number directly
                </span>
              </div>
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="booking-notes" className="block text-xs font-semibold text-navy-900 mb-1">
            Questions or Specific Requirements (Optional)
          </label>
          <input
            id="booking-notes"
            type="text"
            placeholder="e.g. Would like to ask about instalment options and start dates"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full py-2 px-3 rounded-sm border border-line bg-white text-xs focus:outline-none focus:ring-2 focus:ring-navy-900 min-h-[40px]"
          />
        </div>
      </div>

      {/* Confirmation CTA */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3.5"
        >
          {isSubmitting ? (
            <span>Registering Appointment...</span>
          ) : (
            <>
              <span>Confirm Free Consultation</span>
              <Icon name="arrow-right" size={16} />
            </>
          )}
        </Button>
        <p className="text-[11px] text-ink-soft text-center mt-2.5">
          Zero commitment. We will send you an appointment confirmation email and calendar reminder.
        </p>
      </div>
    </form>
  );
};
