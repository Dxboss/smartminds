import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { fulfillGoCardlessCheckoutSession } from "@/app/actions/enrolmentActions";
import { Icon } from "@/components/ui/Icon";
import { formatCurrency } from "@/content/pricing";

export const metadata: Metadata = {
  title: "Direct Debit Confirmed | Smartminds Training College",
  description: "Your official enrolment and Direct Debit mandate have been confirmed.",
};

interface PageProps {
  searchParams: Promise<{
    flow_id?: string;
    redirect_flow_id?: string;
    session_token?: string;
  }>;
}

export default async function GoCardlessSuccessPage({ searchParams }: PageProps) {
  await connection();
  const params = await searchParams;
  const flowId = params.flow_id || params.redirect_flow_id;
  const sessionToken = params.session_token || "";

  if (!flowId || !sessionToken) {
    redirect("/enrol?error=gocardless_missing_parameters");
  }

  let enrolmentResult: any = null;
  try {
    enrolmentResult = await fulfillGoCardlessCheckoutSession(flowId, sessionToken);
  } catch (err) {
    console.error("[GoCardless Session Verification Error]:", err);
    redirect("/enrol?error=gocardless_verification_failed");
  }

  const studentName = enrolmentResult?.studentName || "Learner";
  const courseTitle = enrolmentResult?.courseTitle || "Accredited Qualification";
  const studentId = enrolmentResult?.studentId || "SM-DIRECT-DEBIT";
  const amountCharged = enrolmentResult?.amountCharged || 0;
  const portalUrl = enrolmentResult?.portalUrl || "/student";

  return (
    <div className="py-16 md:py-24 bg-paper min-h-[calc(100vh-80px)] flex flex-col justify-center">
      <div className="max-w-2xl mx-auto px-4 w-full">
        <div className="bg-white rounded-md border border-line shadow-card p-6 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <Icon name="check-circle" size={32} />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-xs bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
              Direct Debit Mandate Confirmed
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
              Welcome to Smartminds Training College!
            </h1>
            <p className="text-sm text-ink-soft max-w-lg mx-auto">
              Your UK Direct Debit mandate and initial tuition payment have been confirmed. Your student induction pack is now active.
            </p>
          </div>

          <div className="bg-paper p-5 rounded-sm border border-line text-left space-y-3 text-xs">
            <div className="flex justify-between border-b border-line pb-2">
              <span className="text-ink-soft">Enrolled Student:</span>
              <strong className="text-navy-900">{studentName}</strong>
            </div>
            <div className="flex justify-between border-b border-line pb-2">
              <span className="text-ink-soft">Course:</span>
              <strong className="text-navy-900">{courseTitle}</strong>
            </div>
            <div className="flex justify-between border-b border-line pb-2">
              <span className="text-ink-soft">Student ID:</span>
              <strong className="font-mono text-navy-900 font-bold">{studentId}</strong>
            </div>
            <div className="flex justify-between border-b border-line pb-2">
              <span className="text-ink-soft">Payment Method:</span>
              <strong className="text-navy-900">Bacs Direct Debit (GoCardless)</strong>
            </div>
            <div className="flex justify-between pt-1 font-semibold text-sm">
              <span className="text-navy-900">Initial Amount Debited:</span>
              <strong className="text-navy-900">{formatCurrency(amountCharged)}</strong>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-sm text-xs text-blue-900 text-left flex items-start gap-2.5">
            <Icon name="shield-check" size={16} className="text-blue-800 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Direct Debit Guarantee:</strong> Your payments are protected by the UK Direct Debit Guarantee. Future instalments will be collected automatically according to your schedule.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href={portalUrl}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-sm bg-navy-900 text-white font-bold text-sm hover:bg-navy-700 transition-colors shadow-sm"
            >
              <span>Access Student Portal</span>
              <Icon name="arrow-right" size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

