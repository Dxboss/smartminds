import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLiveBlogPosts, getLiveCourses, pullLatestFromNeon } from "@/lib/persistedData";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { formatCurrency, calculatePricing } from "@/content/pricing";
import { globalSettings } from "@/content/globals";
import { defaultPlan6Months } from "@/content/plans";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getLiveBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const posts = getLiveBlogPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Article Not Found | Smartminds Training College",
    };
  }

  const baseUrl = "https://smartmindstraining.co.uk";
  const postUrl = `${baseUrl}/blog/${post.slug}`;
  const imageUrl = post.image.startsWith("http") ? post.image : `${baseUrl}${post.image}`;

  return {
    title: `${post.metaTitle} | Smartminds Training College`,
    description: post.metaDescription,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: postUrl,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      images: [
        {
          url: imageUrl,
          alt: post.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
      images: [imageUrl],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  try {
    await pullLatestFromNeon();
  } catch {}
  const posts = getLiveBlogPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const baseUrl = "https://smartmindstraining.co.uk";
  const liveCourses = getLiveCourses();
  const relatedCourse = post.relatedCourseId
    ? liveCourses.find((c) => c.id === post.relatedCourseId)
    : null;

  // Pricing calculation for related course lead magnet
  const lowestLevel = relatedCourse?.levels[0];
  const primaryPlan = lowestLevel?.plans[0] || defaultPlan6Months;
  const coursePricing = lowestLevel
    ? calculatePricing(lowestLevel, primaryPlan, globalSettings)
    : null;

  // 1. Article Schema JSON-LD
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.metaDescription,
    "image": `${baseUrl}${post.image}`,
    "datePublished": post.publishedAt,
    "dateModified": post.updatedAt,
    "author": {
      "@type": "Person",
      "name": post.author.name,
      "jobTitle": post.author.role,
    },
    "publisher": {
      "@type": "EducationalOrganization",
      "name": "Smartminds Training College",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/logo-color.png`,
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${post.slug}`,
    },
  };

  // 2. FAQ Schema JSON-LD (triggers rich FAQ dropdowns on Google SERP)
  const faqSchema =
    post.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": post.faqs.map((faq) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer,
            },
          })),
        }
      : null;

  // 3. Breadcrumb Schema JSON-LD
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Career Guides",
        "item": `${baseUrl}/blog`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `${baseUrl}/blog/${post.slug}`,
      },
    ],
  };

  const otherPosts = posts.filter((p) => p.id !== post.id).slice(0, 2);

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="bg-paper min-h-screen pb-20">
        {/* Article Header & Hero */}
        <article>
          <header className="bg-white border-b border-line pt-10 pb-12">
            <Container>
              {/* Breadcrumbs */}
              <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-ink-soft">
                <Link href="/" className="hover:text-navy-900 transition-colors">
                  Home
                </Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-navy-900 transition-colors">
                  Career Guides
                </Link>
                <span>/</span>
                <span className="text-navy-900 font-semibold truncate max-w-xs sm:max-w-md">
                  {post.title}
                </span>
              </nav>

              <div className="max-w-4xl space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 rounded-sm text-xs font-bold bg-navy-900 text-gold-300 shadow-xs border border-gold-500/30">
                    {post.category}
                  </span>
                  <span className="text-xs text-ink-soft flex items-center gap-1 font-medium">
                    <Icon name="clock" size={13} />
                    {post.readTimeMinutes} min read
                  </span>
                  <span className="text-xs text-ink-soft">•</span>
                  <span className="text-xs text-ink-soft">
                    Published {new Date(post.publishedAt).toLocaleDateString("en-GB", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                <Heading level="h1" className="text-navy-900 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  {post.title}
                </Heading>

                {/* Author Card */}
                <div className="pt-4 border-t border-line/80 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-navy-900 text-gold-300 flex items-center justify-center font-heading font-bold text-lg flex-shrink-0 shadow-sm border border-gold-500/30">
                    {post.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <span className="font-bold text-navy-900 text-sm block">
                      {post.author.name}
                    </span>
                    <span className="text-xs text-ink-soft block mt-0.5">
                      {post.author.role}
                    </span>
                    {post.author.credentials && (
                      <span className="text-[11px] font-mono text-ink-soft/80 block mt-0.5">
                        {post.author.credentials}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Container>
          </header>

          {/* Article Lead Photo */}
          <div className="bg-paper py-8 border-b border-line">
            <Container>
              <div className="max-w-4xl mx-auto relative aspect-[16/9] w-full rounded-md overflow-hidden bg-navy-900 border border-line shadow-sm">
                <Image
                  src={post.image}
                  alt={post.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 896px"
                  className="object-cover"
                  priority
                />
              </div>
            </Container>
          </div>

          {/* Main Article Content */}
          <Section variant="paper" className="py-12">
            <Container>
              <div className="max-w-3xl mx-auto space-y-10">
                {/* 1. Key Takeaways Box (SEO Golden Standard) */}
                <div className="bg-white rounded-md border-2 border-navy-900/10 p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-sm bg-navy-900 text-gold-300 flex items-center justify-center flex-shrink-0">
                      <Icon name="check" size={15} />
                    </div>
                    <h2 className="font-heading font-bold text-lg sm:text-xl text-navy-900 uppercase tracking-wide">
                      Summary &amp; Key Takeaways
                    </h2>
                  </div>
                  <ul className="space-y-2.5 text-sm sm:text-base text-ink-soft">
                    {post.keyTakeaways.map((takeaway, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-gold-700 font-bold mt-0.5">✦</span>
                        <span className="leading-relaxed">{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Excerpt Lead */}
                <p className="text-lg sm:text-xl font-medium text-navy-900 leading-relaxed italic border-l-4 border-navy-900 pl-4 py-1">
                  &ldquo;{post.excerpt}&rdquo;
                </p>

                {/* Article Body Sections */}
                {post.sections.map((section, idx) => (
                  <div key={idx} className="space-y-4 pt-4">
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-navy-900 leading-snug">
                      {section.subheading}
                    </h2>

                    {section.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-base sm:text-lg text-ink-soft leading-relaxed">
                        {p}
                      </p>
                    ))}

                    {/* Styled Callout */}
                    {section.callout && (
                      <div className="my-6 p-6 rounded-md bg-white border border-gold-500/40 shadow-xs space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-navy-900 font-mono flex items-center gap-2">
                          <Icon name="shield-check" size={16} className="text-navy-900" />
                          {section.callout.title}
                        </span>
                        <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
                          {section.callout.text}
                        </p>
                      </div>
                    )}

                    {/* Bullet Points */}
                    {section.bulletPoints && section.bulletPoints.length > 0 && (
                      <ul className="space-y-2 py-2 pl-2">
                        {section.bulletPoints.map((point, ptIdx) => (
                          <li key={ptIdx} className="flex items-start gap-3 text-sm sm:text-base text-ink-soft">
                            <span className="w-2 h-2 rounded-full bg-navy-900 flex-shrink-0 mt-2" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                {/* 2. In-Article Course Lead Magnet (High Conversion) */}
                {relatedCourse && (
                  <div className="my-12 bg-white rounded-md border-2 border-navy-900 p-6 sm:p-8 shadow-md space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-sm border border-emerald-200 inline-block mb-1">
                          Recommended Qualification
                        </span>
                        <h3 className="font-heading text-2xl font-bold text-navy-900">
                          {relatedCourse.title}
                        </h3>
                        <span className="text-xs text-ink-soft">
                          Awarded by {relatedCourse.awarding_body || "Ofqual Regulated Awarding Body"} • QN: {relatedCourse.awarding_reference || "RQF"}
                        </span>
                      </div>

                      {coursePricing && (
                        <div className="text-left sm:text-right flex-shrink-0">
                          <span className="text-[11px] uppercase tracking-wider text-ink-soft block font-mono">
                            Tuition
                          </span>
                          <span className="font-heading font-bold text-2xl text-navy-900 block leading-tight">
                            {formatCurrency(coursePricing.sellingPrice)}
                          </span>
                          {coursePricing.months > 1 && (
                            <span className="text-xs text-navy-700 font-semibold block">
                              Or {formatCurrency(coursePricing.monthly)}/mo plan
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-ink-soft">
                      <div className="p-3 bg-paper rounded-sm border border-line">
                        <strong className="block text-navy-900 font-semibold">Delivery Format:</strong>
                        <span>Weekly Live Zoom (18:30)</span>
                      </div>
                      <div className="p-3 bg-paper rounded-sm border border-line">
                        <strong className="block text-navy-900 font-semibold">Assessment:</strong>
                        <span>100% Coursework &amp; Portfolio</span>
                      </div>
                      <div className="p-3 bg-paper rounded-sm border border-line">
                        <strong className="block text-navy-900 font-semibold">Mentorship:</strong>
                        <span>1-to-1 Personal Assessor</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <Link
                        href={`/courses/${relatedCourse.slug}`}
                        className="w-full sm:w-auto px-6 py-3 rounded-sm bg-navy-900 text-white hover:bg-navy-700 text-xs font-bold uppercase tracking-wider transition-colors text-center shadow-sm min-h-[44px] flex items-center justify-center gap-2"
                      >
                        <span>View Full Syllabus &amp; Fees</span>
                        <Icon name="arrow-right" size={14} />
                      </Link>
                      <Link
                        href="/book"
                        className="w-full sm:w-auto px-6 py-3 rounded-sm border border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors text-center min-h-[44px] flex items-center justify-center"
                      >
                        <span>Speak to Admissions Advisor</span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* 3. Structured FAQs Section (Pulls into Google SERP dropdowns) */}
                {post.faqs.length > 0 && (
                  <div className="pt-8 border-t border-line space-y-6">
                    <div className="space-y-1">
                      <Eyebrow tone="navy">Frequently Asked Questions</Eyebrow>
                      <h2 className="font-heading text-2xl sm:text-3xl font-bold text-navy-900">
                        Common Questions About This Pathway
                      </h2>
                    </div>

                    <div className="space-y-4">
                      {post.faqs.map((faq, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-md border border-line p-6 space-y-2 shadow-xs"
                        >
                          <h3 className="font-bold text-navy-900 text-base sm:text-lg flex items-start gap-2">
                            <span className="text-gold-700 font-bold font-mono">Q.</span>
                            <span>{faq.question}</span>
                          </h3>
                          <p className="text-sm sm:text-base text-ink-soft leading-relaxed pl-6">
                            {faq.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Author Sign-Off Bio Box */}
                <div className="mt-12 bg-white rounded-md border border-line p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-navy-900 text-gold-300 flex items-center justify-center font-heading font-bold text-2xl flex-shrink-0 shadow-md border border-gold-500/30">
                    {post.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-xs uppercase tracking-wider text-ink-soft font-mono">
                      Article Reviewed By
                    </span>
                    <h3 className="font-heading font-bold text-xl text-navy-900">
                      {post.author.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                      {post.author.role}. {post.author.credentials && `Credentials: ${post.author.credentials}.`} All guidance is verified against current UK regulatory frameworks and Ofqual award specifications.
                    </p>
                  </div>
                </div>

                {/* 5. Next Career Guides */}
                {otherPosts.length > 0 && (
                  <div className="pt-10 border-t border-line space-y-4">
                    <h3 className="font-heading font-bold text-xl text-navy-900">
                      Continue Reading Related Career Guides:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {otherPosts.map((other) => (
                        <Link
                          key={other.id}
                          href={`/blog/${other.slug}`}
                          className="group p-5 bg-white rounded-md border border-line hover:border-navy-900/50 hover:shadow-sm transition-all block space-y-2"
                        >
                          <span className="text-[11px] font-bold text-navy-900 bg-paper px-2 py-0.5 rounded-sm border border-line">
                            {other.category}
                          </span>
                          <h4 className="font-heading font-bold text-base text-navy-900 group-hover:text-navy-700 transition-colors leading-snug">
                            {other.title}
                          </h4>
                          <span className="text-xs text-ink-soft flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
                            <span>Read guide &rarr;</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Container>
          </Section>
        </article>
      </main>
    </>
  );
}
