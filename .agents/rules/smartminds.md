# Smartminds Training College — Project Guidelines & Rules

You are building the **Smartminds Training College** website.
The absolute source of truth is [docs/PRD.md](file:///c:/Users/George/OneDrive/Desktop/smartminds/docs/PRD.md). Read it fully before writing any code.

---

## 1. Technology Stack & Scope
- **Tech Stack**: Next.js (App Router), TypeScript, Tailwind CSS.
- **Backend / Payments**: Supabase and Stripe are for later phases. **DO NOT** add checkout, payment processing, or Stripe dependencies in this phase.
- **Dependencies**: Ask the user before adding any new third-party dependency.

---

## 2. Data & Content Architecture
- **No Hard-coding**: **NEVER** hard-code course data, pricing, discounts, instalment plans, or business rules in components.
- **Typed Config in `/content`**: All course and plan data must be loaded from typed config files in `/content`.
- **Security**: Prices are strictly derived server-side or from typed config; never send prices from the browser.
- **Placeholders**: Do not invent accreditation claims, reference numbers, statistics, reviews, or prices. Anything unconfirmed must be explicitly marked `PLACEHOLDER` and visibly flagged on staging.

---

## 3. Design System & Tokens (PRD Section 7)
- **Design Tokens**: Use design tokens from PRD Section 7 as Tailwind theme values / CSS variables:
  - `--navy-900` (`#23216B`), `--navy-700` (`#34318F`)
  - `--gold-500` (`#D9B84A`), `--gold-300` (`#F3E58A`), `--gold-700` (`#B78A2E`)
  - `--paper` (`#FAF8F3`), `--ink` (`#1B1B2B`), `--ink-soft` (`#5A5A6E`), `--line` (`#E6E1D5`)
- **No Raw Hex Values**: **NEVER** use raw hex color values inside components. Always reference CSS variables or Tailwind tokens.
- **Restrained Gold**: Gold is an accent only (sparingly used for badges, star icons, rules). Never use gold text on light backgrounds (fails contrast).
- **Border Radii**: Maximum two border radii across the entire site (e.g., 6px and 16px).
- **Signature Elements**: The crescent arc (drawn as an SVG mask/divider) and the star icon.

---

## 4. Typography
- **Heading Font**: `Saira Condensed` (weights 600/700 via `next/font`).
- **Body Font**: `Source Sans 3` (humanist sans via `next/font`).
- **FORBIDDEN FONTS**: **NEVER** use Inter, Poppins, or Roboto. Provide real fallback font stacks.

---

## 5. Strict "Does Not Look AI-Made" Brief (PRD Section 7.4)
- **Copy**: Real, authentic copy only. No "Lorem Ipsum", generic filler, or clichés like "Unlock your potential".
- **Icons**: **NO EMOJI ICONS**. Use a clean, consistent SVG line-icon set with uniform stroke width.
- **Layouts**: No endless stacks of identical rounded gradient cards. Vary section rhythms (split layouts, timelines, comparisons, pull quotes).
- **CTAs**: At most one primary CTA visible per viewport. Action-oriented verbs (e.g., "Book a free call").

---

## 6. Mobile First & Responsiveness
- **Mobile First**: Always design and test for **360px and 390px** viewports before desktop.
- On mobile, include a persistent bottom bar with "Get free advice" and a WhatsApp shortcut.

---

## 7. Accessibility & Performance (WCAG 2.2 AA)
- Meet **WCAG 2.2 AA** contrast and accessibility requirements.
- Use semantic HTML (`<main>`, `<nav>`, `<header>`, `<section>`, `<article>`).
- Provide descriptive `alt` text on every image.
- Ensure visible focus outlines on interactive elements.
- Touch targets must be at least **44px × 44px**.
- **Third-Party Scripts & Embeds**: Analytics, chat widgets, TikTok/social embeds, and video embeds load **ONLY after explicit cookie consent**.

---

## 8. Development Workflow & Communication
- Keep components small, focused, and reusable.
- Explain briefly what you changed after each step.
- Always check against this rule file before finalizing changes.
