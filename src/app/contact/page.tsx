import { Metadata } from "next";
import { siteConfig } from "@/content/siteConfig";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { GeneralContactForm } from "@/components/forms/GeneralContactForm";
import { getPublishedCmsPageSections } from "@/lib/persistedData";
import { SectionRenderer } from "@/components/cms/SectionRenderer";

export const metadata: Metadata = {
  title: "Contact Us & Admissions Office | Smartminds Training College",
  description:
    "Get in touch with Smartminds Training College. Speak with our admissions advisers by phone, email, or direct WhatsApp message. Weekday office hours 9am–6pm.",
  openGraph: {
    title: "Contact Us | Smartminds Training College",
    description:
      "Get in touch with Smartminds Training College. Speak with our admissions advisers by phone, email, or WhatsApp.",
    type: "website",
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  const customSections = getPublishedCmsPageSections("/contact");
  if (customSections && customSections.length > 0) {
    return (
      <main className="bg-paper text-ink min-h-screen">
        {customSections
          .filter((sec) => sec.enabled)
          .map((sec) => (
            <SectionRenderer key={sec.id} section={sec} />
          ))}
      </main>
    );
  }

  return (
    <main className="bg-paper min-h-screen py-10 md:py-16">
      <Container>
        {/* Header Block */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 mb-3">
            <Tag variant="navy">Admissions & Student Office</Tag>
            <Tag variant="live">Response Within 24h</Tag>
          </div>
          <Eyebrow tone="navy" className="mb-2">
            Get In Touch
          </Eyebrow>
          <Heading
            level="h1"
            className="text-navy-900 text-3xl sm:text-4xl md:text-5xl mb-4"
          >
            Contact Smartminds College
          </Heading>
          <p className="text-base sm:text-lg text-ink-soft leading-relaxed">
            Have questions about qualification entry requirements, funding
            opportunities, or course schedules? Our team is available by phone,
            email, WhatsApp, or through the contact form below.
          </p>
        </div>

        {/* 2-Column Split: Direct Contact Details on Left, General Contact Form on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Direct channels and hours */}
          <div className="lg:col-span-5 space-y-6">
            {/* WhatsApp Highlight Box */}
            <div className="p-6 rounded-lg bg-navy-900 text-white space-y-4 shadow-subtle">
              <div className="flex items-center gap-2">
                <Icon name="whatsapp" size={24} className="text-emerald-400" />
                <h2 className="font-heading font-bold text-xl text-white">
                  Chat on WhatsApp
                </h2>
              </div>
              <p className="text-xs text-paper/85 leading-relaxed">
                Need a fast answer regarding course prices or start dates?
                Message our admissions team directly on WhatsApp during business
                hours.
              </p>
              <a
                href={siteConfig.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center min-h-[44px] w-full px-4 rounded-sm bg-emerald-500 hover:bg-emerald-600 text-white font-heading font-bold text-sm transition-colors shadow-sm gap-2"
              >
                <Icon name="whatsapp" size={18} />
                <span>Message Admissions Team</span>
              </a>
            </div>

            {/* Contact Details Card */}
            <div className="bg-white rounded-lg border border-line p-6 shadow-subtle space-y-5">
              <h3 className="font-heading font-bold text-lg text-navy-900 border-b border-line pb-3">
                Office Information
              </h3>

              <div className="space-y-4 text-sm text-ink">
                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-sm bg-paper flex items-center justify-center flex-shrink-0 text-navy-900">
                    <Icon name="phone" size={16} />
                  </div>
                  <div>
                    <span className="text-xs text-ink-soft block font-mono">
                      Telephone
                    </span>
                    <a
                      href={`tel:${siteConfig.contact.phone}`}
                      className="font-bold text-navy-900 hover:text-navy-700"
                    >
                      {siteConfig.contact.phoneDisplay}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-sm bg-paper flex items-center justify-center flex-shrink-0 text-navy-900">
                    <Icon name="mail" size={16} />
                  </div>
                  <div>
                    <span className="text-xs text-ink-soft block font-mono">
                      Email Enquiries
                    </span>
                    <a
                      href={`mailto:${siteConfig.contact.email}`}
                      className="font-bold text-navy-900 hover:text-navy-700"
                    >
                      {siteConfig.contact.email}
                    </a>
                  </div>
                </div>

                {/* Office Hours */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-sm bg-paper flex items-center justify-center flex-shrink-0 text-navy-900">
                    <Icon name="clock" size={16} />
                  </div>
                  <div>
                    <span className="text-xs text-ink-soft block font-mono">
                      Opening Hours
                    </span>
                    <span className="text-ink font-semibold">
                      {siteConfig.contact.openingHours}
                    </span>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-sm bg-paper flex items-center justify-center flex-shrink-0 text-navy-900">
                    <Icon name="shield-check" size={16} />
                  </div>
                  <div>
                    <span className="text-xs text-ink-soft block font-mono">
                      Head Office
                    </span>
                    <span className="text-ink font-semibold block">
                      {siteConfig.contact.address}
                    </span>
                    <span className="text-[11px] text-ink-soft block mt-0.5">
                      All courses and student tuition delivered 100% online nationwide.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Line Notice */}
            <div className="p-4 rounded-sm bg-paper border border-line text-xs text-ink-soft leading-relaxed">
              <strong className="block text-navy-900 mb-0.5">
                Corporate Registration
              </strong>
              {siteConfig.legalLine}
            </div>
          </div>

          {/* Right Column: General Contact Form */}
          <div className="lg:col-span-7">
            <GeneralContactForm sourcePage="/contact" />
          </div>
        </div>
      </Container>
    </main>
  );
}
