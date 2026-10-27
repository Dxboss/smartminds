"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Course } from "@/content/types";
import { Icon } from "@/components/ui/Icon";
import { ConsentGuard } from "@/components/consent/ConsentGuard";

interface CourseMediaShowcaseProps {
  course: Course;
}

export const CourseMediaShowcase: React.FC<CourseMediaShowcaseProps> = ({
  course,
}) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const formattedVideoUrl = formatVideoEmbedUrl(course.intro_video_url);

  // If a real video URL is configured on the course
  if (formattedVideoUrl) {
    return (
      <div className="rounded-lg bg-white border border-line shadow-subtle overflow-hidden">
        <div className="p-3 sm:p-3.5 bg-paper border-b border-line flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-navy-900">
            <Icon name="video" size={15} className="text-navy-900" />
            <span>Course Briefing &amp; Video Overview</span>
          </div>
          <span className="text-[10px] font-mono text-ink-soft uppercase bg-white px-2 py-0.5 rounded border border-line">
            Official Briefing
          </span>
        </div>

        <div className="relative aspect-[16/9] w-full bg-navy-950 overflow-hidden">
          {!isVideoPlaying ? (
            <div
              className="relative w-full h-full group cursor-pointer"
              onClick={() => setIsVideoPlaying(true)}
            >
              <Image
                src={
                  course.intro_video_poster ||
                  course.image ||
                  "/images/adult-care-training.jpg"
                }
                alt={course.title}
                fill
                priority
                unoptimized={Boolean(
                  (course.intro_video_poster || course.image)?.startsWith("data:") ||
                  (course.intro_video_poster || course.image)?.startsWith("http")
                )}
                className="object-cover opacity-75 group-hover:opacity-90 group-hover:scale-102 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/30 to-transparent" />

              {/* Center Play Button */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gold-500 group-hover:bg-gold-400 text-navy-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>

                <div className="space-y-1 max-w-md">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-white tracking-wide">
                    Watch Qualification Briefing Video
                  </h3>
                  <p className="text-xs text-paper/80 leading-relaxed hidden sm:block">
                    Click to play the briefing with our course leads and academic assessors.
                  </p>
                </div>
              </div>

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-paper/90 pointer-events-none">
                <span className="px-2 py-0.5 rounded-xs bg-navy-900/90 border border-white/10 font-mono text-[11px]">
                  Video Overview
                </span>
                <span className="px-2 py-0.5 rounded-xs bg-gold-500/90 text-navy-900 font-bold text-[11px]">
                  Click to Play
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full relative">
              <ConsentGuard
                category="marketing"
                fallbackTitle="Video Consent Required"
                fallbackDescription="Please accept cookie consent to load the course overview video."
              >
                <iframe
                  src={formattedVideoUrl}
                  title={`${course.title} Course Video Overview`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </ConsentGuard>
              <button
                type="button"
                onClick={() => setIsVideoPlaying(false)}
                className="absolute top-3 right-3 z-30 px-2.5 py-1 rounded-xs bg-navy-900/90 hover:bg-navy-900 text-white text-[11px] font-semibold border border-white/20 transition-colors cursor-pointer"
              >
                &times; Close Video
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard Clean Editorial Presentation (No Fake Video, No Gimmicks)
  return (
    <div className="rounded-lg bg-white border border-line shadow-subtle overflow-hidden">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-navy-950">
        <Image
          src={course.image || "/images/adult-care-training.jpg"}
          alt={course.imageAlt || course.title}
          fill
          priority
          unoptimized={Boolean(
            course.image?.startsWith("data:") || course.image?.startsWith("http")
          )}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent pointer-events-none" />

        {/* Subtle, authentic corner badges */}
        <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-white text-xs">
          <span className="px-2.5 py-1 rounded-xs bg-navy-900/90 backdrop-blur-xs border border-white/15 font-semibold text-[11px] flex items-center gap-1.5 shadow-xs">
            <Icon name="shield-check" size={13} className="text-gold-300" />
            <span>
              {course.type === "cpd"
                ? "CPD Accredited"
                : course.type === "tutoring" || course.is_private_tutoring
                ? "Academic Tutoring"
                : "Ofqual Regulated (RQF)"}
            </span>
          </span>

          {course.awarding_body && (
            <span className="px-2.5 py-1 rounded-xs bg-white/15 backdrop-blur-xs border border-white/20 text-white font-medium text-[11px]">
              {course.awarding_body}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

function formatVideoEmbedUrl(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();

  // If already an embed url
  if (trimmed.includes("/embed/")) {
    return trimmed.includes("?") ? `${trimmed}&autoplay=1` : `${trimmed}?autoplay=1&rel=0`;
  }

  // YouTube watch url: https://www.youtube.com/watch?v=XYZ or https://youtu.be/XYZ
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
  }

  // Vimeo url: https://vimeo.com/123456789
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[3]) {
    return `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=1`;
  }

  return trimmed;
}
