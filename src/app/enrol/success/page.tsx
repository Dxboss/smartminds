import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { courses } from "@/content/courses";
import { processSelfEnrolmentAction } from "@/app/actions/enrolmentActions";
import { Icon } from "@/components/ui/Icon";
import { formatCurrency } from "@/content/pricing";

export const metadata: Metadata = {
  title: "Payment Confirmed & Registration Complete | Smartminds Training College",
  description: "Your official enrolment and payment have been confirmed.",
};

export const instant = false;

interface PageProps {
  searchParams: Promise<{
    session_id?: string;
    courseId?: string;
    levelLabel?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    dob?: string;
    address?: string;
    postcode?: string;
    preferredSession?: "afternoon" | "evening";
    couponCode?: string;
    paymentOption?: "full" | "instalments";
    planId?: string;
  }>;
}

export default async function EnrolSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;

  if (!params.courseId || !params.fullName || !params.email) {
    redirect("/enrol");
  }

  // Finalize enrolment record, set session cookie, and dispatch emails
  const enrolmentResult = await processSelfEnrolmentAction({
    courseId: params.courseId,
    levelLabel: params.levelLabel,
    planId: params.planId || "full",
    fullName: params.fullName,
    email: params.email,
    phone: params.phone || "07700900000",
    dob: params.dob,
    address: params.address,
    postcode: params.postcode,
    preferredSession: params.preferredSession,
    couponCode: params.couponCode,
    paymentOption: params.paymentOption || "full",
    termsAccepted: true,
    cardNumberLast4: "Stripe",
  });

  return (
    <main className="bg-paper min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-md border border-line p-8 sm:p-10 shadow-sm text-center space-y-8 animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
          <Icon name="check" size={32} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-sm border border-emerald-200">
            {enrolmentResult.isReturningStudent ? "Additional Course Activated" : "Payment & Registration Confirmed"}
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-900">
            {enrolmentResult.isReturningStudent ? "Welcome Back to Smartminds College!" : "Welcome to Smartminds Training College!"}
          </h1>
          <p className="text-ink-soft text-sm sm:text-base max-w-md mx-auto">
            {enrolmentResult.isReturningStudent
              ? "Your new qualification has been linked to your student account. Please sign in with your college password to access your curriculum."
              : "Your official student profile has been created and your enrolment is now active."}
          </p>
        </div>

        {/* Registration Summary */}
        <div className="bg-paper rounded-sm border border-line p-6 text-left space-y-3.5 max-w-lg mx-auto">
          <div className="flex justify-between items-center border-b border-line pb-3">
            <span className="text-xs font-semibold text-ink-soft">Official Student ID</span>
            <span className="font-mono font-bold text-navy-900 text-sm bg-white px-2.5 py-1 rounded-sm border border-line">
              {enrolmentResult.studentId}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-line pb-3">
            <span className="text-xs font-semibold text-ink-soft">Student Name</span>
            <span className="font-semibold text-navy-900 text-sm">
              {enrolmentResult.studentName}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-line pb-3">
            <span className="text-xs font-semibold text-ink-soft">Qualification</span>
            <span className="font-semibold text-navy-900 text-sm text-right">
              {enrolmentResult.courseTitle}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-line pb-3">
            <span className="text-xs font-semibold text-ink-soft">Amount Paid</span>
            <span className="font-bold text-navy-900 text-sm">
              {formatCurrency(enrolmentResult.amountCharged)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-ink-soft">Receipt Reference</span>
            <span className="font-mono text-xs text-ink-soft">
              {enrolmentResult.receiptRef}
            </span>
          </div>
        </div>

        {/* Email Dispatched Notice */}
        <div className="p-4 rounded-sm bg-navy-900/5 border border-navy-900/10 text-xs text-ink-soft flex items-start gap-3 max-w-lg mx-auto text-left">
          <Icon name="mail" size={18} className="text-navy-900 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-navy-900">
              Confirmation dispatched to {enrolmentResult.studentEmail}
            </p>
            <p className="text-white/70">
              {enrolmentResult.isReturningStudent
                ? "Your additional qualification confirmation, updated timetable, and payment receipt have been emailed."
                : "Your official syllabus, tutor induction webinar timetable, and receipt details have been emailed."}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={enrolmentResult.isReturningStudent ? "/login" : "/student"}
            className="w-full sm:w-auto px-8 py-3.5 rounded-sm bg-navy-900 hover:bg-navy-700 text-white font-semibold text-sm transition-colors shadow-sm inline-flex items-center justify-center gap-2 min-h-[44px]"
          >
            <span>{enrolmentResult.isReturningStudent ? "Sign in to Student Portal" : "Access Your Student Portal"}</span>
            <Icon name="arrow-right" size={16} />
          </Link>
          <Link
            href="/courses"
            className="w-full sm:w-auto px-6 py-3.5 rounded-sm border border-line bg-white hover:bg-paper text-navy-900 font-semibold text-sm transition-colors inline-flex items-center justify-center min-h-[44px]"
          >
            <span>Browse Prospectus</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
