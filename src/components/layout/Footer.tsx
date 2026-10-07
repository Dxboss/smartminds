"use client";

import React from "react";
import Link from "next/link";
import { siteConfig } from "@/content/siteConfig";
import { useConsent } from "@/context/ConsentContext";
import { Logo } from "./Logo";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";

export const Footer: React.FC = () => {
  const { openManage } = useConsent();

  return (
    <footer className="bg-navy-900 text-white pt-16 pb-24 lg:pb-16 border-t border-navy-700/60">
      <Container>
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-navy-700/50">
          {/* Brand Column (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="white" />
            <p className="text-white/70 text-sm max-w-sm leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Tag variant="on-navy" dot>
                Live Online Classes
              </Tag>
              <Tag variant="on-navy">UK Registered</Tag>
            </div>
          </div>

          {/* Courses & Pathways Column */}
          <div>
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-gold-300 mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/courses"
                  className="text-white/80 hover:text-white transition-colors hover:underline"
                >
                  All Qualifications
                </Link>
              </li>
              <li>
                <Link
                  href="/cpd"
                  className="text-white/80 hover:text-white transition-colors hover:underline"
                >
                  CPD Short Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/private-tutoring"
                  className="text-white/80 hover:text-white transition-colors hover:underline"
                >
                  Private Tutoring
                </Link>
              </li>
              <li>
                <Link
                  href="/funding"
                  className="text-white/80 hover:text-white transition-colors hover:underline"
                >
                  Funded Options
                </Link>
              </li>
              <li>
                <Link
                  href="/design-system"
                  className="text-gold-300/80 hover:text-gold-300 transition-colors hover:underline inline-flex items-center gap-1"
                >
                  <Icon name="star" size={12} className="text-gold-500" />
                  Design System (Preview)
                </Link>
              </li>
            </ul>
          </div>

          {/* College Info Column */}
          <div>
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-gold-300 mb-4">
              College
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-white/80 hover:text-white transition-colors hover:underline"
                >
                  About Smartminds
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white/80 hover:text-white transition-colors hover:underline"
                >
                  Contact & Location
                </Link>
              </li>
              {siteConfig.legalLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/70 hover:text-white transition-colors hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support Column */}
          <div>
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-gold-300 mb-4">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-2.5">
                <Icon name="phone" size={18} className="text-gold-500 mt-0.5" />
                <a
                  href={`tel:${siteConfig.contact.phone}`}
                  className="hover:text-white transition-colors"
                >
                  {siteConfig.contact.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Icon name="mail" size={18} className="text-gold-500 mt-0.5" />
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="hover:text-white transition-colors break-all"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Icon
                  name="whatsapp"
                  size={18}
                  className="text-gold-500 mt-0.5"
                />
                <a
                  href={siteConfig.contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp: {siteConfig.contact.whatsappDisplay}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Icon name="clock" size={18} className="text-gold-500 mt-0.5" />
                <span>{siteConfig.contact.openingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Accreditation Logo Row per PRD 8 & 10.1 */}
        <div className="py-8 border-b border-navy-700/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gold-300 block mb-1">
                Accreditations & Awarding Organisations
              </span>
              <p className="text-xs text-white/60">
                Recognised British qualifications delivered through regulated
                frameworks.
              </p>
            </div>

            {/* Accreditation Badges / Placeholder Logo Row */}
            <div className="flex flex-wrap items-center gap-3">
              {siteConfig.accreditations.map((item) => (
                <div
                  key={item.acronym}
                  className="px-3.5 py-2 rounded-sm bg-white/5 border border-white/10 hover:border-gold-500/40 transition-colors flex items-center gap-2"
                >
                  <Icon
                    name="shield-check"
                    size={16}
                    className="text-gold-500"
                  />
                  <div className="text-left">
                    <span className="font-heading font-bold text-sm tracking-wide text-white block leading-none">
                      {item.acronym}
                    </span>
                    <span className="text-[10px] text-white/60 block leading-tight">
                      {item.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legal Line, Copyright & Cookie Settings Link */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-white/60">
          <div>
            <p className="text-white/80 font-medium mb-1">
              {siteConfig.legalLine}
            </p>
            <p>&copy; 2026 Smartminds Training College. All rights reserved.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {siteConfig.legalLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
            {/* Interactive Cookie Settings link required by PRD Section 16 */}
            <button
              type="button"
              onClick={openManage}
              className="text-gold-300 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
            >
              Cookie settings
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
};
