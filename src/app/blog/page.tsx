import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getLiveBlogPosts } from "@/lib/persistedData";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Career Guides & Qualification Insights | Smartminds Training College",
  description:
    "Expert British vocational guidance, CQC regulatory pathways, healthcare qualification comparisons, and teacher training advice from practicing specialists.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Career Guides & Qualification Insights | Smartminds Training College",
    description:
      "Expert British vocational guidance, CQC regulatory pathways, healthcare qualification comparisons, and teacher training advice.",
    type: "website",
    url: "https://smartmindstraining.co.uk/blog",
  },
};

export default function BlogIndexPage() {
  const blogPosts = getLiveBlogPosts();
  const featuredPost = blogPosts.find((p) => p.featured) || blogPosts[0];
  const regularPosts = blogPosts.filter((p) => p.id !== featuredPost?.id);

  return (
    <div className="bg-paper min-h-screen">
      {/* 1. Header Banner */}
      <Section variant="white" className="border-b border-line pt-12 pb-14">
        <Container>
          <div className="max-w-3xl space-y-3">
            <Eyebrow tone="navy" className="mb-2">
              Official College Guidance &amp; Career Insights
            </Eyebrow>
            <Heading level="h1" className="text-navy-900 leading-tight">
              Educational Insights &amp; Career Guides
            </Heading>
            <p className="text-base sm:text-lg text-ink-soft leading-relaxed">
              Written by senior NHS practitioners, Registered Care Managers, and qualified assessor tutors. Clear, regulatory-backed advice to help you navigate UK RQF diplomas and career progression.
            </p>
          </div>

          {/* Quick Categories */}
          <div className="flex flex-wrap items-center gap-2 pt-6">
            <span className="text-xs font-semibold text-ink-soft mr-2">Browse by topic:</span>
            {["Health & Social Care", "Teacher Training", "Career Pathways", "Funding & Advice"].map(
              (cat) => (
                <span
                  key={cat}
                  className="px-3 py-1 rounded-sm text-xs font-semibold bg-paper border border-line text-navy-900"
                >
                  {cat}
                </span>
              )
            )}
          </div>
        </Container>
      </Section>

      {/* 2. Featured Lead Article */}
      {featuredPost && (
        <Section variant="paper" className="py-12 border-b border-line">
          <Container>
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
                Featured Career Guide
              </span>
              <span className="text-xs text-ink-soft font-mono">
                Updated {new Date(featuredPost.updatedAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
              </span>
            </div>

            <article className="group bg-white rounded-md border border-line overflow-hidden shadow-sm hover:border-navy-900/40 hover:shadow-md transition-all duration-300 grid grid-cols-1 lg:grid-cols-12">
              {/* Image Side */}
              <div className="relative aspect-[16/10] lg:aspect-auto lg:col-span-5 bg-navy-900 overflow-hidden">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-sm text-[11px] font-bold bg-navy-900 text-gold-300 shadow-sm border border-gold-500/30">
                    {featuredPost.category}
                  </span>
                </div>
              </div>

              {/* Text Side */}
              <div className="p-6 sm:p-8 lg:p-10 lg:col-span-7 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs text-ink-soft">
                    <span className="flex items-center gap-1 font-medium">
                      <Icon name="clock" size={13} />
                      {featuredPost.readTimeMinutes} min read
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-navy-900">
                      By {featuredPost.author.name}
                    </span>
                  </div>

                  <Link href={`/blog/${featuredPost.slug}`}>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-navy-900 group-hover:text-navy-700 transition-colors leading-tight">
                      {featuredPost.title}
                    </h2>
                  </Link>

                  <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
                    {featuredPost.excerpt}
                  </p>

                  {/* Key Takeaways Preview */}
                  <div className="bg-paper rounded-sm p-4 border border-line/80 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-navy-900 block font-mono">
                      Inside this guide:
                    </span>
                    <ul className="space-y-1.5 text-xs text-ink-soft">
                      {featuredPost.keyTakeaways.slice(0, 2).map((takeaway, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Icon name="check" size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="text-xs text-ink-soft">
                    <span className="block font-semibold text-navy-900">{featuredPost.author.credentials}</span>
                  </div>

                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-navy-900 text-white hover:bg-navy-700 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm min-h-[42px]"
                  >
                    <span>Read Complete Guide</span>
                    <Icon name="arrow-right" size={14} />
                  </Link>
                </div>
              </div>
            </article>
          </Container>
        </Section>
      )}

      {/* 3. All Articles Grid */}
      <Section variant="white" className="py-14">
        <Container>
          <div className="mb-8">
            <Heading level="h2" className="text-navy-900 text-2xl sm:text-3xl font-bold">
              Latest Career &amp; Accreditation Guides
            </Heading>
            <p className="text-ink-soft text-sm sm:text-base mt-1">
              Step-by-step regulatory walkthroughs, qualification comparisons, and funding explainers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <article
                key={post.id}
                className="group bg-white rounded-md border border-line shadow-subtle hover:border-navy-900/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-navy-900 border-b border-line">
                    <Image
                      src={post.image}
                      alt={post.imageAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-bold bg-navy-900 text-gold-300 shadow-sm border border-gold-500/30">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-ink-soft">
                      <span className="flex items-center gap-1">
                        <Icon name="clock" size={12} />
                        {post.readTimeMinutes} min read
                      </span>
                      <span>•</span>
                      <span>{new Date(post.publishedAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>

                    <h3 className="font-heading text-xl font-bold text-navy-900 group-hover:text-navy-700 transition-colors leading-snug">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="text-xs sm:text-sm text-ink-soft leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 border-t border-line/60 flex items-center justify-between text-xs">
                  <span className="text-ink-soft font-semibold truncate max-w-[180px]">
                    {post.author.name}
                  </span>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="font-heading font-bold text-navy-900 hover:text-navy-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Read Guide</span>
                    <Icon name="arrow-right" size={13} />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* 4. Consultation Lead Magnet Callout */}
          <div className="mt-16 bg-navy-900 text-white rounded-md p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-white/10">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-300 bg-white/10 px-3 py-1 rounded-sm border border-gold-500/30 inline-block">
                Free Academic Advice
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold">
                Not sure which qualification fits your current experience?
              </h3>
              <p className="text-paper/80 text-sm sm:text-base leading-relaxed">
                Book a 15-minute consultation with a senior assessor. We evaluate your existing healthcare or teaching CV, prior learning exemptions, and timetable compatibility.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <Link
                href="/book"
                className="w-full sm:w-auto px-6 py-3.5 rounded-sm bg-gold-500 text-navy-900 hover:bg-gold-300 font-heading font-bold text-sm tracking-wide transition-colors text-center shadow-sm min-h-[44px] flex items-center justify-center gap-2"
              >
                <span>Book 15-Min Advice Call</span>
                <Icon name="arrow-right" size={15} />
              </Link>
              <Link
                href="/courses"
                className="w-full sm:w-auto px-6 py-3.5 rounded-sm border border-white/20 text-white hover:bg-white/10 font-heading font-bold text-sm tracking-wide transition-colors text-center min-h-[44px] flex items-center justify-center"
              >
                <span>Browse Prospectus</span>
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
