# Smartminds Training College: Website Refresh and Learning Platform

**PRD v1.0 (draft for build)**
**Brand:** Smartminds Training College
**Legal line (verify on Companies House before launch):** "Smartminds Training College is a trading name of Smartminds Empire Ltd, Company No. 13492661"
**Current site:** https://smartmindstraining.co.uk (Wix)
**Domain:** smartmindstraining.co.uk (GoDaddy registrar and DNS)
**Super admin / developer:** the agency (you)
**Client / owner admin:** the college owner

---

## 0. How to use this document

- This PRD covers the whole product but is built in stages. **Only Phase 1a is in scope for the Friday preview.** Phases 1b to 3 are specified at a lower level so the data model and structure do not need rewriting later.
- Anything marked **PLACEHOLDER** is dummy content or an unconfirmed fact. Never present a placeholder as real in production.
- Anything marked **CONFIG** must be stored as editable data (database row, CMS field or a typed config file), never hard-coded into components.
- Where this PRD and a generic default conflict, this PRD wins. Where this PRD is silent, ask; do not invent accreditation claims, reference numbers, statistics, prices or reviews.

---

## 1. Product summary

Smartminds Training College is a UK college delivering live online classes for regulated qualifications, CPD courses and (new) private tutoring for children. The current Wix site is crowded and does not guide visitors. The refresh delivers:

1. A **premium, conversion-focused public website** that gets visitors to book a free advice call or view courses.
2. **Course detail pages** with level selection, full-payment and instalment pricing, and funded-course enquiries.
3. A **booking calendar** the owner can control (days off, hours).
4. Later: **login and role-based portals** (student, staff, administrative staff, owner admin, super admin), **automatic enrolment after payment**, a **payment ledger** replacing the owner's spreadsheet, assignments and grading, and document generation for awarding bodies.

### Differentiator to lead with
**Live classes with real tutors** (not pre-recorded), plus flexible payment (pay in full with a discount, or spread the full price over a plan). Recordings of live classes are stream-only for learners.

### Out of scope (do not build)
- Support services (CV, university applications), recruitment, and the Africa-based consultancy. Consultancy is a separate future project and a separate site.
- Currencies other than GBP at launch (USD is a later CONFIG option via Stripe).
- A free-form Wix-style page builder built from scratch (see section 9).

---

## 2. Goals and success measures

| Goal | Measure |
|---|---|
| Visitors know what to do next | Primary CTA "Get free advice" visible on every page above the fold on mobile |
| More advice calls booked | Booking completion rate tracked as `call_booked` |
| Clear course pricing | Every course page shows pay-in-full and instalment options without a click |
| Trust | Accreditation logos, reviews and real photos visible under the hero |
| Owner independence | Owner can edit courses, prices and page content without a developer |
| Owner finance clarity | No spreadsheet needed to know who has paid what (Phase 1b) |

---

## 3. Users and roles

| Role | Who | Can do | Cannot do |
|---|---|---|---|
| Visitor | Public | Browse, enquire, book a call, view prices | n/a |
| Student | Enrolled learner | Own courses, recordings (stream only), assignments, grades and feedback, own payment balance | See other learners, staff or admin areas |
| Staff (tutor) | Teacher | Own classes and learners, add class links, post recordings, set assignments, mark, see submissions | See payments or revenue, other teachers' classes, edit prices/courses/settings, manage users |
| Administrative staff | Office team | Handle enquiries, bookings, learner records, exceptions in enrolment (funded approvals, class moves), send **approved templates only**, complete assigned tasks | See any payment amount, balance, history or revenue (only "access active/paused"); change prices/courses/site content; manage staff; delete learners (can request) |
| Owner admin | Client | Everything day to day, including payments, courses, prices, tutors, tasks, availability, templates | Anything the super admin has switched off via feature entitlements (section 6) |
| Super admin | Agency | All of the above plus roles, feature entitlements, technical settings | n/a |
| Parent/guardian | Phase 2+ | Manage a child's tutoring enrolment and consent | Not built in 1a/1b; design the schema so it can be added |

Rules:
- One login page (`/login`); the server routes by role after authentication.
- Staff and admin accounts are **invite only**. Students self-register at enrolment. The super admin is created once via seed script, never through the UI.
- Role permissions are **data** (a permissions table), enforced server-side and by database row-level security. Hiding a button is never the control.

---

## 4. Phasing

| Phase | Scope | Status for Friday |
|---|---|---|
| **1a** | Public site, course pages with price options, enquiry forms, embedded booking, trust strip, cookie banner, legal pages, SEO basics, redirect map | **Build now** |
| **1b** | Login and roles, Stripe checkout (full and instalments), payment ledger, owner/staff admin (add tutors, assign tasks), native booking with owner days off, CMS/visual editor, automatic enrolment | Next |
| **2** | Student portal, stream-only recordings, assignments, grading and feedback, notifications, student balances, approved message templates | Later |
| **3** | Evidence packs and authority documents, AI submission checks, advanced reporting, mobile app | Later |

Feature entitlements (section 6) control what the owner sees as modules are delivered.

---

## 5. Assumptions (change later without rebuilding)

| # | Assumption / default | Needs confirming from | Safe to change later? |
|---|---|---|---|
| A1 | Brand shown as "Smartminds Training College" | Owner | Yes |
| A2 | Primary CTA "Get free advice"; secondary "View courses" | Decided | Yes |
| A3 | Class intake: **rolling start**; learner enrolled on payment, admin assigns next class | Owner | Yes (add fixed intake dates later) |
| A4 | Enrolment is automatic once payment (full or deposit) succeeds | Decided | Yes |
| A5 | Admin staff messages use owner-approved templates only | Decided | Yes |
| A6 | Pay-in-full discount default 10%, optional per-course override | Owner | Yes (CONFIG) |
| A7 | Instalments: plan lengths 3/6/10/12 months, deposit fixed amount or percentage, automatic grace period, admin/owner override | Owner | Yes (CONFIG) |
| A8 | Assessment method is per course: `criteria` / `completion` / `quiz`. CPD defaults to `completion` | Owner | Yes |
| A9 | Admin staff can see "access active / paused" but no amounts | Owner | Yes |
| A10 | GBP only at launch | Decided | Yes (add USD) |
| A11 | Instalment wording ("at no extra cost"; do not say "0% finance" or "APR") | **Owner's accountant/solicitor** | Must be reviewed before launch |
| A12 | Privacy, cookie, terms and refund text | **Solicitor/ICO guidance** | Must be reviewed before launch |
| A13 | Existing site images are reusable | Owner (confirm sources/licences) | Replace any that cannot be confirmed |
| A14 | Phase 1b, 2, 3 modules unlocked as agreed milestones are paid | Agency | n/a |

---

## 6. Feature entitlements (module switches)

Table `feature_entitlements(module_key, enabled, enabled_by, enabled_at)`. Only the super admin can change it; every change goes to the audit log.

| module_key | Default | Notes |
|---|---|---|
| `payments_ledger` | on (from Phase 1b) | Owner only; hidden from admin staff |
| `booking_native` | on (from Phase 1b) | Owner manages days off and hours |
| `tutors_management` | on (from Phase 1b) | Invite and manage staff |
| `tasks` | on (from Phase 1b) | Assign tasks with deadlines |
| `student_portal` | off | Phase 2 |
| `assignments_grading` | off | Phase 2 |
| `recordings` | off | Phase 2 |
| `evidence_packs` | off | Phase 3 |
| `ai_submission_checks` | off | Phase 3 |
| `advanced_reports` | off | Phase 3 |
| `mobile_app` | off | Phase 3 |

A locked module shows the owner a clear "Not enabled yet, contact your developer" state, never an error.

**Hard rule:** entitlements gate *features*, never access to the owner's own learner and payment data. The owner can always view and export that data (she is the data controller under UK GDPR). Do not build any hidden remote switch that disables the live site.

---

## 7. Brand and design system

### 7.1 Logo and colour
Source: two logo files (full-colour and white). The logo shows two figures reaching for a star inside a crescent arc, in navy and metallic gold. Wordmark is a squared condensed all-caps face; "TRAINING COLLEGE" is wide-tracked geometric sans.

Colours below are **approximate**. Replace with exact values from the vector logo when available.

| Token | Value | Use |
|---|---|---|
| `--navy-900` | `#23216B` | Primary: nav, headings, primary buttons, footer |
| `--navy-700` | `#34318F` | Hover/secondary navy |
| `--gold-500` | `#D9B84A` | Accent: rules, star, badges, icons (not body text) |
| `--gold-300` | `#F3E58A` | Gold gradient start |
| `--gold-700` | `#B78A2E` | Gold gradient end, borders |
| `--paper` | `#FAF8F3` | Page background (warm off-white, never pure white) |
| `--ink` | `#1B1B2B` | Body text |
| `--ink-soft` | `#5A5A6E` | Secondary text |
| `--line` | `#E6E1D5` | Dividers |

Rules:
- Gold is a **sparing accent**. Never gold text on a light background (fails contrast). Gold on navy is fine.
- Primary button: navy background, white text. On navy sections: gold background with navy text.
- Full-colour logo on light backgrounds; the white logo on navy sections and footer. Need a transparent PNG/SVG (the JPEGs have a black background).

### 7.2 Typography
- Headings: a condensed, squared display face to echo the wordmark (proposal: **Saira Condensed**, 600/700). Sentence case, not all caps, except small labels.
- Body: a humanist sans (proposal: **Source Sans 3** or **DM Sans**), 17-18px base, line-height 1.6.
- Do **not** use Inter, Poppins or Roboto. Provide real fallback stacks.
- Type scale (mobile to desktop): H1 40 to 64, H2 30 to 44, H3 22 to 28, body 17 to 18, small 14.

### 7.3 Signature element and layout
- **The crescent arc** from the logo is the signature motif: used as a curved section divider and as a mask on hero and course images, and as a subtle large outline behind the hero. Draw it as SVG, not an image.
- **The star** marks completion/benefit bullets and the "recommended" plan.
- Layout rules: asymmetric hero (text left-weighted, image offset with arc mask); alternating section rhythm (paper, white, navy); generous vertical spacing (96px desktop / 64px mobile between sections); max content width 1200px; 8px spacing grid.

### 7.4 "Does not look AI-made" brief (binding)
- Real copy only; no lorem ipsum or filler like "Unlock your potential".
- No emoji as icons. Use a consistent line-icon set at one stroke width.
- No stacks of identical rounded cards with gradient borders. Vary section structure: split layouts, a timeline, a comparison, a large pull-quote.
- Maximum 2 border radii in the whole site (suggest 6px and 16px). One shadow style, subtle.
- Photos treated consistently (same crop ratios; arc mask on heroes; optional light navy overlay). Prefer real learner and tutor photos; stock photos are temporary fillers.
- No more than one primary CTA per viewport. Buttons use verbs ("Book a free call").
- Motion: restrained (fade/slide-in on scroll, 200-300ms). Respect `prefers-reduced-motion`.
- Mobile first. Test at 360px and 390px widths before desktop.

### 7.5 Accessibility
WCAG 2.2 AA: contrast, visible focus states, keyboard navigation, alt text on every image, form labels, no information by colour alone, touch targets at least 44px.

---

## 8. Information architecture (Phase 1a)

```
/                         Home
/courses                  All courses (filter by category and type)
/courses/[slug]           Course detail (level selector, price options, enquiry)
/cpd                      CPD courses landing (filtered view)
/private-tutoring         Private tutoring for children
/funding                  Funded courses explainer and eligibility enquiry
/about                    About, accreditation, team
/contact                  Contact, WhatsApp, enquiry form, map/address
/book                     Booking page (also opened as modal from CTAs)
/privacy  /cookies  /terms  /refunds     Legal pages (PLACEHOLDER text until reviewed)
/login                    Phase 1b
```

Navigation (desktop): Logo | Courses | CPD | Private tutoring | Funding | About | Contact | **[Get free advice]**
Mobile: logo, menu button, persistent bottom bar with **Get free advice** and a WhatsApp icon.
Footer: logo, short description, links, contact, accreditation logos, legal line, cookie settings link.

---

## 9. Content management and owner editing

**Principle:** the owner edits content herself without being able to break the design.

| Layer | Phase 1a (Friday) | Phase 1b |
|---|---|---|
| Course and price data | Typed config files in `/content` with the exact fields of section 11 | Move to CMS (Sanity, or equivalent) and/or admin forms writing to the database |
| Page content | Written in components reading from `/content` | Visual block editing (pre-built block library; options: Builder.io, Plasmic, Sanity visual editing, Puck: verify current features and pricing before choosing) |
| Design controls | Fixed design tokens | Owner **cannot** change fonts, colours or spacing; only reorder and edit pre-built blocks |
| Safety | n/a | Draft and preview before publish; version history and rollback |

Block library (build as reusable components): Hero, Trust strip, Course grid, Course highlights, Why us (split), Process timeline, Testimonials/reviews, Video, FAQ, CTA band, Accreditation row, Team, Contact block.

Do not build a free-form Wix-style builder. Do not use WordPress for the marketing site (single codebase and single source of price data is the decision).

---

## 10. Phase 1a page specifications

### 10.1 Home (`/`)
Sections, in order:
1. **Hero.** H1 states the differentiator in plain words (PLACEHOLDER copy: "Live classes with real tutors. Qualifications that move your career forward."). Subhead one sentence. Primary CTA **Get free advice** (opens booking modal); secondary **View courses**. Right: real learner photo in arc mask. Small line beneath: "Pay in full and save, or spread the cost."
2. **Trust strip.** Accreditation logos (TQUK, CPD Group, UKRLP as currently shown on the live site; use logos as supplied by the owner; never invent reference numbers), Google review rating and count (PLACEHOLDER until real), and 3 small real photos (learners/tutors/certificate moment).
3. **Choose your path.** Pathway tiles by outcome (e.g. "Work in care", "Work in education", "Business and admin", "IT", "CPD for your job", "Tutoring for your child"). Category names are PLACEHOLDER: derive from the live site's actual course categories.
4. **How it works.** Timeline of 4 steps: Talk to us, Choose your course and payment plan, Join live classes, Get certified. Include "recordings available to rewatch".
5. **Pricing flexibility.** Split layout explaining pay in full (discount) vs instalments (same total, spread over months) vs funded (eligibility check). Link to `/funding`.
6. **Featured courses.** 3 to 6 courses (from config).
7. **Reviews and photos.** Real testimonials with name and course, with photos where consented. TikTok embed is **click-to-load** (no third-party cookies before consent).
8. **FAQ.** 6 to 8 real questions (PLACEHOLDER).
9. **Final CTA band** on navy: "Not sure which course? Book a free call."

### 10.2 Course listing (`/courses`)
- Filters: category, type (Regulated / CPD / Tutoring), level.
- Card: image (arc-masked), title, level range, delivery tag ("Live online"), "From £X" and a funded tag if applicable.
- Empty state and loading state designed.

### 10.3 Course detail (`/courses/[slug]`)
Layout: left content column, right sticky purchase/enquiry panel on desktop; on mobile the panel becomes a sticky bottom bar opening a sheet.

Content blocks:
1. Title, short description, tags (type, delivery, awarding body if confirmed), **intro video slot** (1-minute; placeholder until supplied).
2. **Level selector** (tabs/segmented control). Changing level updates price, units, duration, guided learning hours, entry requirements.
3. Overview, who it is for, entry requirements, **units list**, assessment method (from `assessment_method`), duration and delivery, start dates (or "Rolling start"), job prospects, progression routes, what is included (live classes, recordings, free textbook where applicable), FAQs.
4. **Pricing panel** (see 10.4).
5. Related courses.
6. Trust row and a "Talk to someone first" CTA (booking).

### 10.4 Pricing panel logic (CONFIG-driven)
Inputs per course level: `price_gbp`, `full_pay_discount_percent` (course override, else global default), `plans[]` (months, deposit_type, deposit_value), `funding` (`self_pay` | `funded` | `both`).

Display:
- **Pay in full:** discounted price, with the saving shown ("Save £X").
- **Pay in instalments:** *full price* (no uplift), deposit amount, number of payments, monthly amount. Calculation: `monthly = (price - deposit) / months`, rounded to pence; the **final payment absorbs the rounding remainder**. Show total clearly.
- **Funded:** "Check funding eligibility" opens an enquiry form (no payment).
- In Phase 1a the pay buttons are **disabled with "Enrolment opens soon"** or route to the enquiry form; checkout arrives in 1b. Do not wire up fake payments.
- Never say "0% finance", "APR" or "credit". Use "spread the cost at no extra charge" (wording pending review, A11).
- Prices come from config on the server; the browser never sends a price.

### 10.5 Funding (`/funding`)
Plain-language explanation of funded routes (current site mentions AEB and NSF; copy to be confirmed by owner, factual and not promissory) plus the eligibility enquiry form. No claims such as "free" unless the owner confirms the exact conditions.

### 10.6 Private tutoring (`/private-tutoring`)
Short page: what is offered, subjects/levels (PLACEHOLDER), how sessions run, safeguarding statement placeholder, enquiry form with parent/guardian details and child's year group. Because it involves children's data, include a consent checkbox, minimal fields, and a note that safeguarding policy is to be supplied.

### 10.7 About and Contact
- About: story, accreditation (logos), team (photo slots), values, legal line.
- Contact: phone, email, WhatsApp button, general enquiry form, address (PLACEHOLDER), opening hours.

### 10.8 Booking (`/book` and modal)
- Phase 1a: embed an external scheduler (Cal.com, or Google appointment scheduling if her Google account supports it: verify) in a modal on the same page; full-screen sheet on mobile.
- Minimal fields: name, email, phone, interested course. Show times in the visitor's time zone. Confirmation email and reminder. Meet link generated.
- Under the button: "Prefer WhatsApp? Message us" link.
- Phase 1b: replace with native booking (section 12.3).

### 10.9 Live chat
Crisp or Tidio-style widget (verify) loaded **after cookie consent**, with out-of-hours message and a WhatsApp button. Optional in Friday build (skip if time-boxed).

---

## 11. Data model: course content (used from day one)

Phase 1a stores these as typed config; Phase 1b maps them to database/CMS without changing the page code.

`course`
- `id`, `slug`, `title`, `summary`, `description`, `category`, `type` (`regulated` | `cpd` | `tutoring`)
- `delivery` (`live_online` | `blended`), `start_mode` (`rolling` | `fixed`), `start_dates[]`
- `awarding_body` (nullable, only if confirmed), `awarding_reference` (nullable)
- `assessment_method` (`criteria` | `completion` | `quiz`)
- `funding` (`self_pay` | `funded` | `both`), `funding_notes`
- `intro_video_url` (nullable), `free_textbook` (bool)
- `faqs[]`, `job_prospects[]`, `progression[]`, `image`, `seo_title`, `seo_description`, `published`

`course_level`
- `course_id`, `level_label` (e.g. "Level 2"), `price_gbp`, `full_pay_discount_percent` (nullable), `duration_text`, `guided_learning_hours`, `entry_requirements`, `units[]` (`code`, `title`, `credits`), `plans[]`

`payment_plan_template` (CONFIG, reusable)
- `months`, `deposit_type` (`fixed` | `percent`), `deposit_value`, `grace_days`, `after_grace` (`pause_access` | `manual_review`)

Seed with 6 to 10 **PLACEHOLDER** courses derived from the live site's real course names, with dummy prices clearly flagged. Show a visible "Preview: prices are placeholders" banner on staging.

---

## 12. Later phases (specified for schema planning)

### 12.1 Authentication (Phase 1b)
Supabase Auth (or equivalent). Email and password plus optional Google sign-in for students. **Mandatory 2FA** for super admin, owner admin, administrative staff and staff. Lockout and rate limiting, breached-password check, shorter admin sessions, password re-confirmation before sensitive actions (refunds, role changes, unlocking modules). `/login` redirects by role to `/student`, `/staff`, `/admin`.

### 12.2 Checkout and payments (Phase 1b)
- Stripe Checkout/Elements; card data never touches our server. Prices read server-side; webhook signatures verified; webhook handling idempotent.
- Pay in full, or instalments via scheduled payments (consider Bacs Direct Debit for long plans: verify current Stripe support and terms).
- **Automatic enrolment:** on successful full payment or deposit, create account if needed, create enrolment, set access `active`, send welcome email. Rolling-start: admin assigns the next class.
- Failed or missed instalment: automatic reminder, grace period (CONFIG), then access `paused`; owner can override; all logged.
- **Payment ledger** (`payments`): amount, method (`stripe` | `bank_transfer` | `manual`), reference, status, enrolment, learner. Bank transfers entered by the owner trigger enrolment. Owner dashboard: received, outstanding, overdue, upcoming; CSV export. No manual Excel step.
- **Admin staff never read payment tables** (enforced in the database), see no totals, amounts or exports, and receive no payment alerts. System sends payment reminders automatically.
- Refunds, chargebacks, VAT/tax treatment: confirm with the owner's accountant before launch.

### 12.3 Native booking (Phase 1b)
Owner admin calendar: click days to block, set weekly hours, buffers. Public site shows only open slots. Confirmed bookings write to her Google Calendar (and create Meet links); her busy times block slots. Email notifications to her and the visitor.

### 12.4 Admin, tutors and tasks (Phase 1b)
- Owner invites tutors and staff (invite-only), assigns roles.
- **Task board:** owner assigns tasks with deadlines to staff/admin; overdue flag; completion tracking. Strike or discipline policy stays outside the system.
- Enquiries pipeline for admin staff: `new` / `contacted` / `enrolled` / `lost`.

### 12.5 Student portal and teaching (Phase 2)
- Student: courses, class schedule, recordings (stream only), assignments, submissions, results and feedback, balance owed (own only).
- Teacher: own classes, Zoom link and time per session, upload/link recording, create assignments (everyone notified by email), see submissions and who has not submitted, mark per unit (**Achieved / Not Yet Achieved**) with feedback, optional attendance.
- Assessment method per course (`criteria`, `completion`, `quiz`) changes what the teacher sees. CPD default `completion`.
- Recordings: private storage/streaming provider, short-lived signed links, viewer email watermark, no download link. Be honest that screen recording cannot be fully prevented. Notify learners that sessions are recorded.
- Approved **message template library** (owner-managed; placeholders for name, course, date). Admin staff pick a template; no free text. All sends logged.

### 12.6 Evidence packs and authority documents (Phase 3)
Pick learners and units; compile submitted work, grades, feedback and sign-off into a PDF/ZIP or an **expiring, view-only, watermarked, access-logged link**. Configurable recipients and templates; real forms from the awarding body/funder to be supplied. Keep SharePoint as a fallback until then.

### 12.7 Mobile app (Phase 3)
Android and iOS wrapper or native app for the student portal; defer decisions until Phase 2 is stable.

---

## 13. Data model: platform tables (Phase 1b+)

`profiles`, `roles`, `permissions`, `role_permissions`, `user_roles`, `courses`, `course_levels`, `payment_plan_templates`, `leads` (see 14), `bookings`, `availability_rules`, `blocked_days`, `enrolments` (learner, course_level, plan, status `active|paused|completed|cancelled`, class_id nullable), `classes`, `sessions`, `recordings`, `assignments`, `submissions`, `results` (unit, outcome, feedback, marked_by), `payments`, `payment_schedules`, `tasks`, `message_templates`, `message_log`, `feature_entitlements`, `audit_log`, `consents`, `documents`/`evidence_packs`.

Row-level security: deny by default; `payments`, `payment_schedules` readable only by owner_admin and super_admin (and a learner's own rows); admin staff have **no** policy on these tables.

---

## 14. Forms and leads (Phase 1a)

Native forms (no Jotform). A third-party form tool was mentioned ("SiteForm"); if a specific product is required, swap the form backend only and keep the same fields and consent capture.

Forms: Free advice enquiry, Funded eligibility enquiry, Private tutoring enquiry, General contact.

Requirements:
- Fields minimal; labels visible; inline validation; server-side validation (Zod or equivalent).
- Consent checkbox with timestamp stored (`consents`); link to privacy policy.
- Spam protection (Cloudflare Turnstile or equivalent).
- On submit: store in `leads` (`type`, `name`, `email`, `phone`, `course_interest`, `message`, `utm_*`, `source_page`, `consent_at`), email notification to the owner, auto-reply to the visitor, and a clear success state.
- Capture UTM parameters for attribution (TikTok vs Instagram vs organic).
- Free textbook offer: a perk shown near the CTA, delivered via the same form (a field, not a separate tool).

---

## 15. SEO, analytics and tracking

- Server-rendered pages; unique `<title>` and meta description per page; XML sitemap; robots.txt; canonical URLs; Open Graph images; fast image handling (`next/image`, modern formats, correct sizes).
- Structured data: Organization/EducationalOrganization, Course, FAQPage, BreadcrumbList. **Review markup only for genuine, verifiable reviews.**
- **301 redirect map** from the live Wix URLs to the new pages. Capture the real list from the live sitemap (`/sitemap.xml`) and page links; **do not guess URLs**. Unmapped old URLs go to the nearest relevant page, never all to the homepage.
- GA4 and Search Console created under the **owner's** Google account with the agency added as a delegate; Tag Manager recommended. Domain verification via DNS TXT in GoDaddy.
- Events: `lead_submitted`, `call_booked`, `checkout_started` (1b), `payment_completed` (1b), `enrolled` (1b).
- Core Web Vitals targets: LCP under 2.5s on mobile, CLS under 0.1.
- Local/Business: Google Business Profile recommended (owner action).

---

## 16. Privacy, cookies and compliance

- Cookie banner with equal-weight Accept / Reject / Manage; analytics, marketing and chat/embeds load **only after consent**; "Cookie settings" link in the footer.
- Pages: privacy policy, cookie policy, terms, refund policy. Text is **PLACEHOLDER** until reviewed (A12).
- Owner should confirm ICO registration/fee status for Smartminds Empire Ltd.
- UK/EU data region for database and storage. Data export and deletion workflow (DSAR) in Phase 1b/2.
- Children's tutoring: parent/guardian consent, minimal data, safeguarding policy supplied by owner.
- Recording notice for learners; lawful basis documented.
- Do not state accreditation, funding or statistic claims that the owner has not confirmed.

---

## 17. Security requirements

- HTTPS and HSTS, Content Security Policy, secure cookies (HttpOnly, SameSite), CSRF protection, input validation everywhere, rate limiting on forms and auth, bot protection, WAF/CDN (Cloudflare).
- Secrets in environment variables only; service keys server-side only; separate dev, staging and production; no real keys in prompts or repo.
- Audit log: logins, role changes, refunds, entitlement changes, exports, template sends.
- Backups (point-in-time) and a tested restore before launch; error monitoring (Sentry); dependency alerts.
- **Authorisation test suite (required before any release that includes roles):** a student cannot reach staff or admin routes; staff cannot read finance; admin staff cannot read payments through the UI or API; a user cannot read another learner's data.
- Breach plan: report to the ICO within 72 hours when reportable.

---

## 18. Technical stack and hosting

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript + Tailwind CSS |
| Data and auth | Supabase, London region (Postgres, Auth, Storage, RLS) |
| Payments | Stripe |
| Email | Resend (send from a subdomain such as `mail.smartmindstraining.co.uk`; add SPF/DKIM without replacing existing email records) |
| Booking | Cal.com embed in 1a; native in 1b |
| Chat | Crisp or equivalent, loaded after consent |
| Content | Typed config in 1a; Sanity or equivalent + visual blocks in 1b |
| Video (recordings) | Mux, Vimeo or Cloudflare Stream (signed URLs) |
| Hosting | Vercel (set server region to London) |
| DNS/CDN | Keep GoDaddy DNS at launch; consider Cloudflare later |

Account ownership: **create all accounts in the client's or her company's name** and add the agency as team member (hosting, Supabase, Stripe, Google, domain, email service, CMS).

---

## 19. Launch and migration plan

1. Build Phase 1a on a Vercel preview link or `preview.smartmindstraining.co.uk` (new DNS record; does not affect the live site).
2. Owner reviews and approves in writing.
3. Pre-launch: export/screenshot full GoDaddy DNS; check MX records for email; lower TTL on website records a day ahead; confirm redirect map; confirm legal text reviewed.
4. Launch: change only website records (`@` and `www`) to Vercel. **Do not touch MX/TXT email records.**
5. Keep Wix active until the new site is verified; rollback = restore old records.
6. Post-launch: submit sitemap in Search Console, verify forms, booking and tracking end to end, enable auto-renew and 2FA on GoDaddy (domain expires 2027-10-30).

---

## 20. Acceptance criteria (Phase 1a)

**Global**
- [ ] No horizontal scroll at 360px; all pages usable on mobile.
- [ ] Lighthouse mobile: Performance 85+, Accessibility 95+, SEO 95+ (target; report actuals).
- [ ] No Inter/Poppins/Roboto; heading and body fonts as specified; design tokens used everywhere (no hard-coded hex values in components).
- [ ] All course and price data comes from `/content` config; changing a value changes every page that shows it.
- [ ] No placeholder presented as real: placeholders visibly flagged on staging.

**Home and CTAs**
- [ ] "Get free advice" is visible above the fold on every page on mobile and opens the booking modal.
- [ ] Trust strip shows accreditation logos and review slot, photo-led.

**Course pages**
- [ ] Level selector updates price, units, duration and entry requirements without a page reload.
- [ ] Pay-in-full shows the discounted price and the saving; instalments show the **full price**, deposit, number of payments and monthly amount; final payment absorbs rounding. Unit-test this calculation.
- [ ] Funded courses show "Check funding eligibility" and no payment button.
- [ ] Pay buttons are disabled or route to enquiry in 1a (no fake checkout).

**Forms**
- [ ] Each form validates on client and server, stores a `lead` with UTM and consent timestamp, emails the owner, and shows a success state.
- [ ] Spam protection active; submitting without consent is blocked.

**Booking**
- [ ] A visitor can pick a slot in their own time zone and receives a confirmation; the owner is notified.

**Compliance and SEO**
- [ ] Analytics, chat and video/social embeds do not load before consent.
- [ ] Every page has unique title and description; sitemap and robots present; structured data valid.
- [ ] Redirect map implemented from real URLs; 301 status verified.

**Acceptance criteria (Phase 1b, summary)**
- [ ] A successful payment creates the enrolment and welcome email without human action.
- [ ] A missed instalment pauses access only after the configured grace period; owner override works and is logged.
- [ ] Admin staff cannot see any payment data via UI or direct API/database access (tested).
- [ ] Owner can add a course, change a price and block a day off without a developer.
- [ ] Locked modules show the "not enabled yet" state; only the super admin can change entitlements; changes are audit-logged.

---

## 21. Open items

| # | Item | Owner | Blocks |
|---|---|---|---|
| O1 | Real course list, levels, prices, discounts, plan lengths, deposit rules | Client | Launch |
| O2 | Real photos (learners, tutors, certificate moments) with consent | Client | Launch quality |
| O3 | Image sources/licences for existing Wix images | Client | Reuse |
| O4 | Accreditation logos and exact wording; funding wording | Client | Launch |
| O5 | Instalment wording and VAT/tax treatment | Client's accountant/solicitor | Launch of payments |
| O6 | Privacy, cookie, terms, refund policies | Solicitor | Launch |
| O7 | GoDaddy delegate access; email (MX) setup | Client | Launch day |
| O8 | Stripe account in client's name | Client | Phase 1b |
| O9 | Which awarding bodies/funders receive documents; sample forms | Client | Phase 3 |
| O10 | Class intake model (rolling vs fixed), CPD completion rule, who issues CPD certificates | Client | Phase 1b/2 |
| O11 | Which Google account type for calendar | Client | Booking setup |
| O12 | "SiteForm": confirm if a specific product | Agency | Forms backend |
| O13 | Competitor/reference sites the client likes (URLs) | Client | Design polish |
| O14 | Safeguarding policy for children's tutoring | Client | Tutoring page |
