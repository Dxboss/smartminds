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
import { subscribeNewsletterAction } from "@/app/actions/newsletterActions";

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
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [subscribed, setSubscribed] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [alreadySubscribed, setAlreadySubscribed] = React.useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    setErrorMessage("");
    try {
      const res = await subscribeNewsletterAction(email, "website_footer");
      if (res.success) {
        setSubscribed(true);
        setAlreadySubscribed(!!res.alreadySubscribed);
        setStatusMessage(
          res.message ||
            "Thank you for subscribing! Check your inbox for your exclusive welcome discount code."
        );
        setEmail("");
      } else {
        setErrorMessage(
          res.message || "Subscription failed. Please check your email and try again."
        );
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

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

  // Match homepage light mint footer across all pages (unless dark theme is explicitly configured)
  const isLightFooter = effectiveFooter.footerTheme !== "dark";

  return (
    <footer
      style={
        effectiveFooter.footerBgColor
          ? { backgroundColor: effectiveFooter.footerBgColor }
          : undefined
      }
      className={`${
        isLightFooter
          ? "bg-[#E8F4F1] text-ink border-t border-teal-200/80"
          : "bg-navy-900 text-white border-t border-navy-700/60"
      } pt-16 pb-24 lg:pb-16`}
    >
      <Container>
        {/* Newsletter Subscription Banner */}
        {effectiveFooter.showNewsletter !== false && (
          <div
            style={
              effectiveFooter.newsletterBgColor
                ? { backgroundColor: effectiveFooter.newsletterBgColor }
                : undefined
            }
            className={`mb-14 p-6 sm:p-10 rounded-3xl ${
              effectiveFooter.newsletterBgColor
                ? "shadow-xl border border-line/40"
                : isLightFooter
                ? "bg-white border border-teal-200/80 shadow-xl"
                : "bg-gradient-to-r from-[#0B4D4E] to-navy-900 border border-teal-500/30 shadow-2xl"
            } relative overflow-hidden`}
          >
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-xl">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF5722] block mb-1">
                  {effectiveFooter.newsletterEyebrow || "Stay Ahead in Your Career"}
                </span>
                <h3
                  style={
                    effectiveFooter.newsletterTextColor
                      ? { color: effectiveFooter.newsletterTextColor }
                      : undefined
                  }
                  className={`font-heading text-2xl sm:text-3xl font-bold ${
                    effectiveFooter.newsletterTextColor
                      ? ""
                      : isLightFooter
                      ? "text-[#0B4D4E]"
                      : "text-white"
                  } tracking-tight`}
                >
                  {effectiveFooter.newsletterHeadline || "Subscribe to our Newsletter"}
                </h3>
                <p
                  style={
                    effectiveFooter.newsletterTextColor
                      ? { color: effectiveFooter.newsletterTextColor, opacity: 0.85 }
                      : undefined
                  }
                  className={`text-sm ${
                    effectiveFooter.newsletterTextColor
                      ? ""
                      : isLightFooter
                      ? "text-ink-soft"
                      : "text-white/80"
                  } mt-1 leading-relaxed`}
                >
                  {effectiveFooter.newsletterSubtext ||
                    "Get the latest qualification updates, exclusive fee discounts, and accredited career resources directly in your inbox."}
                </p>
              </div>

              <div className="flex flex-col items-start w-full lg:w-auto">
                <form
                  onSubmit={handleSubscribe}
                  className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto"
                >
                  {subscribed ? (
                    <div
                      className={`inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full border text-sm font-bold shadow-xs ${
                        alreadySubscribed
                          ? isLightFooter
                            ? "bg-navy-900/10 border-navy-900/30 text-navy-900"
                            : "bg-white/20 border-white/40 text-white"
                          : "bg-emerald-500/20 border-emerald-400 text-emerald-800"
                      }`}
                    >
                      <Icon name="check" size={16} className="text-emerald-600 shrink-0" />
                      <span>{statusMessage}</span>
                    </div>
                  ) : (
                    <>
                      <input
                        type="email"
                        required
                        value={email}
                        disabled={submitting}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className={`w-full sm:w-72 px-5 py-3.5 rounded-full ${
                          isLightFooter
                            ? "bg-[#E8F4F1]/60 border border-teal-200 text-ink placeholder-ink-soft/70 focus:ring-[#0B4D4E]"
                            : "bg-white/10 border border-white/20 text-white placeholder-white/60 focus:ring-[#FF5722]"
                        } text-sm focus:outline-none focus:ring-2 backdrop-blur-sm disabled:opacity-50`}
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        style={
                          effectiveFooter.newsletterButtonBgColor
                            ? {
                                backgroundColor: effectiveFooter.newsletterButtonBgColor,
                                color: effectiveFooter.newsletterButtonTextColor || "#FFFFFF",
                              }
                            : undefined
                        }
                        className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#0B4D4E] hover:bg-[#073637] disabled:opacity-60 text-white font-heading font-bold text-sm tracking-wide shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
                      >
                        {submitting ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Subscribing...</span>
                          </>
                        ) : (
                          <>
                            <span>
                              {effectiveFooter.newsletterButtonText || "Subscribe Now"}
                            </span>
                            <Icon name="arrow-right" size={15} />
                          </>
                        )}
                      </button>
                    </>
                  )}
                </form>
                {errorMessage && (
                  <p className="text-xs text-red-500 font-semibold mt-2 pl-3">
                    {errorMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Footer Grid */}
        {(() => {
          // Typography classes for column headers
          const colFontFamily =
            effectiveFooter.columnTitleFontFamily === "body"
              ? "font-sans"
              : "font-heading";

          const colFontSize =
            effectiveFooter.columnTitleFontSize === "sm"
              ? "text-sm"
              : effectiveFooter.columnTitleFontSize === "md"
              ? "text-base"
              : effectiveFooter.columnTitleFontSize === "xl"
              ? "text-xl"
              : "text-lg";

          const colFontWeight =
            effectiveFooter.columnTitleFontWeight === "normal"
              ? "font-normal"
              : effectiveFooter.columnTitleFontWeight === "semibold"
              ? "font-semibold"
              : effectiveFooter.columnTitleFontWeight === "extrabold"
              ? "font-extrabold"
              : "font-bold";

          const colTransform =
            effectiveFooter.columnTitleTextTransform === "none"
              ? "normal-case tracking-normal"
              : effectiveFooter.columnTitleTextTransform === "capitalize"
              ? "capitalize tracking-normal"
              : "uppercase tracking-wider";

          const colHeadingStyle = effectiveFooter.columnTitleColor
            ? { color: effectiveFooter.columnTitleColor }
            : undefined;

          const defaultColHeadingColor = effectiveFooter.columnTitleColor
            ? ""
            : isLightFooter
            ? "text-[#0B4D4E]"
            : "text-gold-300";

          const linkFontSizeClass =
            effectiveFooter.linkFontSize === "xs"
              ? "text-xs"
              : effectiveFooter.linkFontSize === "md"
              ? "text-base"
              : "text-sm";

          return (
            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b ${
                isLightFooter ? "border-teal-200/80" : "border-navy-700/50"
              }`}
            >
              {/* Brand Column (Span 2) */}
              <div className="lg:col-span-2 space-y-4">
                {(() => {
                  const rawLogoUrl =
                    effectiveFooter.logoImageUrl || effectiveHeader.logoImageUrl;
                  const activeLogoUrl = isLightFooter
                    ? (rawLogoUrl?.includes("logo-white")
                        ? "/images/logo-color.png"
                        : rawLogoUrl) || "/images/logo-color.png"
                    : rawLogoUrl || "/images/logo-white.png";
                  const activeLogoType =
                    effectiveFooter.logoImageUrl && effectiveFooter.logoType === "image"
                      ? "image"
                      : effectiveHeader.logoImageUrl && effectiveHeader.logoType === "image"
                      ? "image"
                      : effectiveFooter.logoType || effectiveHeader.logoType || "crest";

                  return (
                    <Logo
                      variant={isLightFooter ? "full-color" : "white"}
                      logoType={activeLogoType}
                      logoImageUrl={activeLogoUrl}
                      logoHeight={effectiveFooter.logoHeight || effectiveHeader.logoHeight || 44}
                      siteName={effectiveFooter.siteName || effectiveHeader.siteName || "Smartminds"}
                      tagline={effectiveFooter.tagline || effectiveHeader.tagline || "Training College"}
                    />
                  );
                })()}
                <p
                  className={`${
                    isLightFooter ? "text-ink-soft" : "text-white/70"
                  } text-sm max-w-sm leading-relaxed`}
                >
                  {effectiveFooter.bioText}
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <Tag variant={isLightFooter ? "default" : "on-navy"} dot>
                    {effectiveFooter.badge1}
                  </Tag>
                  <Tag variant={isLightFooter ? "default" : "on-navy"}>
                    {effectiveFooter.badge2}
                  </Tag>
                </div>
              </div>

              {/* Courses & Pathways Column */}
              {effectiveFooter.showExploreColumn !== false && (
                <div>
                  <h3
                    style={colHeadingStyle}
                    className={`${colFontFamily} ${colFontSize} ${colFontWeight} ${colTransform} ${defaultColHeadingColor} mb-4`}
                  >
                    {effectiveFooter.exploreColumnTitle || "Explore"}
                  </h3>
                  <ul className={`space-y-2.5 ${linkFontSizeClass}`}>
                    {effectiveFooter.exploreLinks.map((item) => (
                      <li key={item.id || item.href}>
                        {isEditor ? (
                          <span
                            style={
                              effectiveFooter.linkColor
                                ? { color: effectiveFooter.linkColor }
                                : undefined
                            }
                            className={`${
                              effectiveFooter.linkColor
                                ? ""
                                : isLightFooter
                                ? "text-ink-soft"
                                : "text-white/80"
                            } cursor-default`}
                          >
                            {item.label}
                          </span>
                        ) : (
                          <Link
                            href={item.href}
                            style={
                              effectiveFooter.linkColor
                                ? { color: effectiveFooter.linkColor }
                                : undefined
                            }
                            className={`${
                              effectiveFooter.linkColor
                                ? ""
                                : isLightFooter
                                ? "text-ink-soft hover:text-[#0B4D4E]"
                                : "text-white/80 hover:text-white"
                            } transition-colors hover:underline`}
                          >
                            {item.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* College Info Column */}
              {effectiveFooter.showCollegeColumn !== false && (
                <div>
                  <h3
                    style={colHeadingStyle}
                    className={`${colFontFamily} ${colFontSize} ${colFontWeight} ${colTransform} ${defaultColHeadingColor} mb-4`}
                  >
                    {effectiveFooter.collegeColumnTitle || "College"}
                  </h3>
                  <ul className={`space-y-2.5 ${linkFontSizeClass}`}>
                    {effectiveFooter.collegeLinks.map((item) => (
                      <li key={item.id || item.href}>
                        {isEditor ? (
                          <span
                            style={
                              effectiveFooter.linkColor
                                ? { color: effectiveFooter.linkColor }
                                : undefined
                            }
                            className={`${
                              effectiveFooter.linkColor
                                ? ""
                                : isLightFooter
                                ? "text-ink-soft"
                                : "text-white/70"
                            } cursor-default`}
                          >
                            {item.label}
                          </span>
                        ) : (
                          <Link
                            href={item.href}
                            style={
                              effectiveFooter.linkColor
                                ? { color: effectiveFooter.linkColor }
                                : undefined
                            }
                            className={`${
                              effectiveFooter.linkColor
                                ? ""
                                : isLightFooter
                                ? "text-ink-soft hover:text-[#0B4D4E]"
                                : "text-white/70 hover:text-white"
                            } transition-colors hover:underline`}
                          >
                            {item.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contact & Support Column */}
              {effectiveFooter.showContactColumn !== false && (
                <div>
                  <h3
                    style={colHeadingStyle}
                    className={`${colFontFamily} ${colFontSize} ${colFontWeight} ${colTransform} ${defaultColHeadingColor} mb-4`}
                  >
                    {effectiveFooter.contactColumnTitle || "Contact"}
                  </h3>
                  <ul
                    className={`space-y-3 ${linkFontSizeClass} ${
                      isLightFooter ? "text-ink-soft" : "text-white/80"
                    }`}
                  >
                    {effectiveFooter.showPhone !== false && effectiveFooter.phone && (
                      <li className="flex items-start gap-2.5">
                        <Icon
                          name="phone"
                          size={18}
                          className={`${
                            isLightFooter ? "text-[#0B4D4E]" : "text-gold-500"
                          } mt-0.5 flex-shrink-0`}
                        />
                        <a
                          href={`tel:${effectiveFooter.phone.replace(/\s+/g, "")}`}
                          className={`${
                            isLightFooter ? "hover:text-[#0B4D4E]" : "hover:text-white"
                          } transition-colors inline-block whitespace-nowrap`}
                        >
                          {effectiveFooter.phone}
                        </a>
                      </li>
                    )}
                    {effectiveFooter.showEmail !== false && effectiveFooter.email && (
                      <li className="flex items-start gap-2.5">
                        <Icon
                          name="mail"
                          size={18}
                          className={`${
                            isLightFooter ? "text-[#0B4D4E]" : "text-gold-500"
                          } mt-0.5 flex-shrink-0`}
                        />
                        <a
                          href={`mailto:${effectiveFooter.email}`}
                          className={`${
                            isLightFooter ? "hover:text-[#0B4D4E]" : "hover:text-white"
                          } transition-colors inline-block whitespace-nowrap`}
                        >
                          {effectiveFooter.email}
                        </a>
                      </li>
                    )}
                    {effectiveFooter.showWhatsapp !== false &&
                      effectiveFooter.whatsappNumber && (
                        <li className="flex items-start gap-2.5">
                          <Icon
                            name="whatsapp"
                            size={18}
                            className={`${
                              isLightFooter ? "text-[#0B4D4E]" : "text-gold-500"
                            } mt-0.5 flex-shrink-0`}
                          />
                          <a
                            href={`https://wa.me/${effectiveFooter.whatsappNumber.replace(
                              /\D/g,
                              ""
                            )}?text=Hello%20Smartminds%2C%20I%20would%20like%20course%20advice`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${
                              isLightFooter ? "hover:text-[#0B4D4E]" : "hover:text-white"
                            } transition-colors`}
                          >
                            WhatsApp:{" "}
                            <span className="inline-block whitespace-nowrap">
                              {effectiveFooter.whatsappNumber}
                            </span>
                          </a>
                        </li>
                      )}
                    {effectiveFooter.showOpeningHours !== false &&
                      effectiveFooter.openingHours && (
                        <li className="flex items-start gap-2.5">
                          <Icon
                            name="clock"
                            size={18}
                            className={`${
                              isLightFooter ? "text-[#0B4D4E]" : "text-gold-500"
                            } mt-0.5 flex-shrink-0`}
                          />
                          <span>{effectiveFooter.openingHours}</span>
                        </li>
                      )}
                  </ul>
                </div>
              )}
            </div>
          );
        })()}

        {/* Accreditation Logo Row - Editable, Stylable & Deletable */}
        {effectiveFooter.showAccreditations !== false &&
          (() => {
            const bgStyle = effectiveFooter.accreditationBgStyle || "transparent";
            const layout = effectiveFooter.accreditationLayout || "row";
            const isWhiteCard = bgStyle === "white";
            const isSubtleCard = bgStyle === "subtle";
            const isDarkCard = bgStyle === "dark";
            const isAreaDark =
              isDarkCard || (!isLightFooter && bgStyle === "transparent");

            const containerStyleClasses = isWhiteCard
              ? "my-8 p-5 sm:p-6 rounded-2xl bg-white shadow-sm border border-teal-200/80"
              : isSubtleCard
              ? "my-8 p-5 sm:p-6 rounded-2xl bg-[#D8EDE8]/75 border border-teal-300/70"
              : isDarkCard
              ? "my-8 p-5 sm:p-6 rounded-2xl bg-navy-900 text-white shadow-md border border-navy-700"
              : `py-8 border-b ${
                  isLightFooter ? "border-teal-200/80" : "border-navy-700/50"
                }`;

            const headlineColor =
              effectiveFooter.accreditationTextColor ||
              (isAreaDark ? "text-gold-300" : "text-[#0B4D4E]");
            const subtextColor = isAreaDark ? "text-white/70" : "text-ink-soft";

            return (
              <div
                className={containerStyleClasses}
                style={
                  effectiveFooter.accreditationBgColor
                    ? { backgroundColor: effectiveFooter.accreditationBgColor }
                    : undefined
                }
              >
                {layout === "stacked" ? (
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="max-w-xl">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider block mb-1`}
                        style={
                          effectiveFooter.accreditationTextColor
                            ? { color: effectiveFooter.accreditationTextColor }
                            : undefined
                        }
                      >
                        <span
                          className={
                            effectiveFooter.accreditationTextColor
                              ? ""
                              : headlineColor
                          }
                        >
                          {effectiveFooter.accreditationHeadline}
                        </span>
                      </span>
                      {effectiveFooter.accreditationSubtext && (
                        <p className={`text-xs ${subtextColor}`}>
                          {effectiveFooter.accreditationSubtext}
                        </p>
                      )}
                    </div>

                    {/* Badges in Horizontal Line */}
                    <div className="w-full flex items-center justify-center overflow-x-auto scrollbar-none py-1">
                      <AccreditationBadgeRow
                        items={effectiveFooter.accreditations}
                        variant={isAreaDark ? "dark" : "light"}
                        badgeStyle={effectiveFooter.accreditationBadgeStyle}
                        wrap={false}
                        className="flex-nowrap justify-center"
                        isEditor={isEditor}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-8">
                    <div className="flex-shrink-0 max-w-sm">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider block mb-1`}
                        style={
                          effectiveFooter.accreditationTextColor
                            ? { color: effectiveFooter.accreditationTextColor }
                            : undefined
                        }
                      >
                        <span
                          className={
                            effectiveFooter.accreditationTextColor
                              ? ""
                              : headlineColor
                          }
                        >
                          {effectiveFooter.accreditationHeadline}
                        </span>
                      </span>
                      {effectiveFooter.accreditationSubtext && (
                        <p className={`text-xs ${subtextColor} leading-relaxed`}>
                          {effectiveFooter.accreditationSubtext}
                        </p>
                      )}
                    </div>

                    {/* Badges in Horizontal Line */}
                    <div className="w-full lg:w-auto overflow-x-auto scrollbar-none py-1 flex items-center justify-start lg:justify-end flex-shrink-0">
                      <AccreditationBadgeRow
                        items={effectiveFooter.accreditations}
                        variant={isAreaDark ? "dark" : "light"}
                        badgeStyle={effectiveFooter.accreditationBadgeStyle}
                        wrap={false}
                        className="flex-nowrap"
                        isEditor={isEditor}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

        {/* Legal Line, Copyright & Cookie Settings Link */}
        <div
          className={`pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs ${
            isLightFooter ? "text-ink-soft" : "text-white/60"
          }`}
        >
          <div>
            <p
              style={
                effectiveFooter.legalLineTextColor
                  ? { color: effectiveFooter.legalLineTextColor }
                  : undefined
              }
              className={`${
                effectiveFooter.legalLineTextColor
                  ? ""
                  : isLightFooter
                  ? "text-ink font-semibold"
                  : "text-white/80 font-medium"
              } mb-1`}
            >
              {effectiveFooter.legalLine}
            </p>
            <p
              style={
                effectiveFooter.copyrightTextColor
                  ? { color: effectiveFooter.copyrightTextColor }
                  : undefined
              }
            >
              {effectiveFooter.copyrightText}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {siteConfig.legalLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${
                  isLightFooter ? "hover:text-[#0B4D4E]" : "hover:text-white"
                } transition-colors`}
              >
                {item.label}
              </Link>
            ))}
            {/* Interactive Cookie Settings link */}
            <button
              type="button"
              onClick={openManage}
              className={`${
                isLightFooter ? "text-[#0B4D4E]" : "text-gold-300"
              } underline underline-offset-2 transition-colors cursor-pointer font-medium`}
            >
              Cookie settings
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
};
