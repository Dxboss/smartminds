"use client";

import React, { useRef, useState, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { submitSafeguardingFormAction } from "@/app/actions/enrolmentActions";

interface SafeguardingCardProps {
  learnerId?: string;
  learnerEmail?: string;
  childName?: string;
  childYearGroup?: string;
  safeguardingCompleted?: boolean;
  initialConcerns?: string;
  initialEmergencyPhone?: string;
  parentSignature?: string;
}

export const SafeguardingCard: React.FC<SafeguardingCardProps> = ({
  learnerId,
  learnerEmail,
  childName = "Your Child",
  childYearGroup = "School Student",
  safeguardingCompleted = false,
  initialConcerns = "",
  initialEmergencyPhone = "",
  parentSignature: initialSig = "",
}) => {
  const [completed, setCompleted] = useState(safeguardingCompleted);
  const [emergencyPhone, setEmergencyPhone] = useState(initialEmergencyPhone);
  const [concerns, setConcerns] = useState(initialConcerns);
  const [consentChecked, setConsentChecked] = useState(false);
  const [savedSig, setSavedSig] = useState<string>(initialSig);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Canvas signature state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(Boolean(initialSig));

  // Initialize canvas context
  useEffect(() => {
    if (completed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#1B1B2B";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [completed]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!consentChecked) {
      setErrorMsg("Please tick the parental consent and safeguarding declaration.");
      return;
    }

    let signatureData = savedSig;
    if (canvasRef.current && hasDrawn) {
      signatureData = canvasRef.current.toDataURL("image/png");
    }

    if (!signatureData) {
      setErrorMsg("Please sign in the signature pad using your finger or mouse before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitSafeguardingFormAction({
        learnerId,
        learnerEmail,
        parentSignature: signatureData,
        childConcerns: concerns.trim(),
        emergencyPhone: emergencyPhone.trim(),
      });

      if (res.success) {
        setSavedSig(signatureData);
        setCompleted(true);
      } else {
        setErrorMsg("Failed to save agreement. Please try again.");
      }
    } catch {
      setErrorMsg("Error submitting form. Please check network connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completed) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-md p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Icon name="check" size={18} />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-emerald-950">
                Safeguarding & Learning Requirements Checklist Complete
              </h3>
              <p className="text-xs text-emerald-800">
                Parental consent verified for <strong>{childName}</strong> ({childYearGroup}).
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-xs bg-emerald-100 text-emerald-900 border border-emerald-300 self-start sm:self-auto">
            Status: Approved & Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-emerald-900">
          <div className="p-3 bg-white/80 rounded-sm border border-emerald-200">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-0.5">
              Registered Student
            </span>
            <span className="font-bold text-sm text-navy-900">{childName}</span>
            <span className="block text-ink-soft text-[11px] mt-0.5">{childYearGroup}</span>
          </div>

          <div className="p-3 bg-white/80 rounded-sm border border-emerald-200">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-0.5">
              Emergency Escalation Phone
            </span>
            <span className="font-mono font-bold text-navy-900">
              {emergencyPhone || "Primary Parent Mobile on File"}
            </span>
          </div>

          <div className="p-3 bg-white/80 rounded-sm border border-emerald-200">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-0.5">
              Learning Needs & Notes
            </span>
            <span className="text-ink-soft italic">
              {concerns || "Standard tuition progression curriculum."}
            </span>
          </div>
        </div>

        {savedSig && (
          <div className="pt-2 flex items-center justify-between text-xs text-emerald-900/80">
            <span className="text-[11px]">Digital parent signature timestamped and linked to college audit log.</span>
            <button
              type="button"
              onClick={() => setCompleted(false)}
              className="text-xs text-emerald-900 underline font-semibold hover:text-navy-900"
            >
              Update Details
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md border-2 border-gold-500/80 p-6 sm:p-7 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold-300 text-navy-900 flex items-center justify-center shrink-0">
            <Icon name="shield-check" size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-navy-900 bg-gold-300/40 px-2 py-0.5 rounded-xs border border-gold-500/30">
              Parent Mandatory Action
            </span>
            <h2 className="font-heading text-xl font-bold text-navy-900 mt-0.5">
              Safeguarding & Learning Requirements Checklist
            </h2>
            <p className="text-xs text-ink-soft">
              Mandatory under UK statutory safeguarding guidance (KCSIE 2026) for <strong>{childName}</strong> ({childYearGroup}).
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Secondary Emergency Telephone (Alternative Contact)
            </label>
            <input
              type="tel"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              placeholder="e.g. 07123 456789 (Partner, Grandparent, or Carer)"
              className="w-full px-3.5 py-2 rounded-sm border border-line text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Special Educational Needs (SEN) / Focus Subjects
            </label>
            <input
              type="text"
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              placeholder="e.g. Dyslexia, ADHD, GCSE Maths exam prep, or None"
              className="w-full px-3.5 py-2 rounded-sm border border-line text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none min-h-[44px]"
            />
          </div>
        </div>

        {/* Digital Signature Pad */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-navy-900">
              Digital Signature of Parent / Legal Guardian *
            </label>
            <button
              type="button"
              onClick={clearCanvas}
              className="text-[11px] text-ink-soft hover:text-navy-900 underline font-semibold cursor-pointer"
            >
              Clear Signature
            </button>
          </div>
          <div className="border border-line rounded-sm bg-paper relative overflow-hidden">
            <canvas
              ref={canvasRef}
              width={560}
              height={120}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-[120px] bg-white cursor-crosshair touch-none"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-ink-soft/40 text-xs italic">
                Draw or sign your digital signature here (touch or mouse)
              </div>
            )}
          </div>
          <span className="text-[10px] text-ink-soft block">
            Your digital signature confirms legal parental consent and acceptance of Smartminds Training College safeguarding terms.
          </span>
        </div>

        {/* Consent Declaration */}
        <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
            className="mt-1 w-4 h-4 rounded-xs border-line text-navy-900 focus:ring-gold-500"
          />
          <span className="text-xs text-ink-soft leading-relaxed">
            I confirm that I hold parental responsibility for <strong>{childName}</strong>. I authorise Smartminds Training College certified tutors to deliver scheduled private tutoring / extra classes, and I agree to the student attendance policy.
          </span>
        </label>

        {errorMsg && (
          <div className="p-3 rounded-sm bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            className="font-bold text-xs px-6 py-2.5 cursor-pointer shadow-sm"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Icon name="clock" size={14} className="animate-spin" />
                <span>Recording Agreement...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Icon name="check-circle" size={15} />
                <span>Submit Safeguarding & Consent Agreement</span>
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
