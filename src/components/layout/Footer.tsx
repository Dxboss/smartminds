"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/content/siteConfig";
import { useConsent } from "@/context/ConsentContext";
import { Logo } from "./Logo";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { AccreditationBadgeRow } from "@/components/accreditation/AccreditationLogos";

import {
  FooterConfig,
  defaultFooterConfig,
  HeaderNavConfig,
  defaultHeaderNavConfig,
} from "@/lib/repositories/seedData";

export interface FooterProps {
  config?: FooterConfig;
  headerConfig?: HeaderNavConfig;
  isEditor?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  config,
  headerConfig,
  isEditor = false,
}) => {
  const effectiveFooter = config || defaultFooterConfig;
  const effectiveHeader = headerConfig || defaultHeaderNavConfig;
  const { openManage } = useConsent();
  const pathname = usePathname();

  // Hide marketing website footer completely inside application portals (unless forced in editor)
  if (
    !isEditor &&
    (pathname.startsWith("/portal") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/staff") ||
      pathname.startsWith("/student") ||
      pathname.startsWith("/super"))
  ) {
    return null;
  }

  return (
    <footer className="bg-navy-900 text-white pt-16 pb-24 lg:pb-16 border-t border-navy-700/60">
      <Container>
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-navy-700/50">
          {/* Brand Column (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            {(() => {
              const activeLogoUrl =
                effectiveFooter.logoImageUrl || effectiveHeader.logoImageUrl;
              const activeLogoType =
                effectiveFooter.logoImageUrl && effectiveFooter.logoType === "image"
                  ? "image"
                  : effectiveHeader.logoImageUrl && effectiveHeader.logoType === "image"
                  ? "image"
                  : effectiveFooter.logoType || effectiveHeader.logoType || "crest";

              return (
                <Logo
                  variant="white"
                  logoType={activeLogoType}
                  logoImageUrl={activeLogoUrl}
                  logoHeight={effectiveFooter.logoHeight || effectiveHeader.logoHeight || 44}
                  siteName={effectiveFooter.siteName || effectiveHeader.siteName || "Smartminds"}
                  tagline={effectiveFooter.tagline || effectiveHeader.tagline || "Training College"}
                />
              );
            })()}
            <p className="text-white/70 text-sm max-w-sm leading-relaxed">
              {effectiveFooter.bioText}
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Tag variant="on-navy" dot>
                {effectiveFooter.badge1}
              </Tag>
              <Tag variant="on-navy">{effectiveFooter.badge2}</Tag>
            </div>
          </div>

          {/* Courses & Pathways Column */}
          <div>
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-gold-300 mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              {effectiveFooter.exploreLinks.map((item) => (
                <li key={item.id || item.href}>
                  {isEditor ? (
                    <span className="text-white/80 cursor-default">
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-white/80 hover:text-white transition-colors hover:underline"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* College Info Column */}
          <div>
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-gold-300 mb-4">
              College
            </h3>
            <ul className="space-y-2.5 text-sm">
              {effectiveFooter.collegeLinks.map((item) => (
                <li key={item.id || item.href}>
                  {isEditor ? (
                    <span className="text-white/70 cursor-default">
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-white/70 hover:text-white transition-colors hover:underline"
                    >
                      {item.label}
                    </Link>
                  )}
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
                <Icon
                  name="phone"
                  size={18}
                  className="text-gold-500 mt-0.5 flex-shrink-0"
                />
                <a
                  href={`tel:${effectiveFooter.phone.replace(/\s+/g, "")}`}
                  className="hover:text-white transition-colors inline-block whitespace-nowrap"
                >
                  {effectiveFooter.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Icon
                  name="mail"
                  size={18}
                  className="text-gold-500 mt-0.5 flex-shrink-0"
                />
                <a
                  href={`mailto:${effectiveFooter.email}`}
                  className="hover:text-white transition-colors inline-block whitespace-nowrap"
                >
                  {effectiveFooter.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Icon
                  name="whatsapp"
                  size={18}
                  className="text-gold-500 mt-0.5 flex-shrink-0"
                />
                <a
                  href={`https://wa.me/${effectiveFooter.whatsappNumber.replace(/\D/g, "")}?text=Hello%20Smartminds%2C%20I%20would%20like%20course%20advice`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp:{" "}
                  <span className="inline-block whitespace-nowrap">
                    {effectiveFooter.whatsappNumber}
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Icon
                  name="clock"
                  size={18}
                  className="text-gold-500 mt-0.5 flex-shrink-0"
                />
                <span>{effectiveFooter.openingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Accreditation Logo Row per PRD 8 & 10.1 */}
        <div className="py-8 border-b border-navy-700/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gold-300 block mb-1">
                {effectiveFooter.accreditationHeadline}
              </span>
              <p className="text-xs text-white/60">
                {effectiveFooter.accreditationSubtext}
              </p>
            </div>

            {/* Authentic UK Accreditation Logo Badges */}
            <AccreditationBadgeRow variant="dark" />
          </div>
        </div>

        {/* Legal Line, Copyright & Cookie Settings Link */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-white/60">
          <div>
            <p className="text-white/80 font-medium mb-1">
              {effectiveFooter.legalLine}
            </p>
            <p>{effectiveFooter.copyrightText}</p>
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
