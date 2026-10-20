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
  const [activeTab, setActiveTab] = useState<"video" | "photos" | "portal">("video");
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Gallery images curated based on category
  const galleryImages = getGalleryImagesForCourse(course);

  // Video embed URL formatter
  const formattedVideoUrl = formatVideoEmbedUrl(course.intro_video_url);

  return (
    <div className="rounded-lg bg-white border border-line shadow-subtle overflow-hidden">
      {/* 1. Header Media Control Bar */}
      <div className="p-3 sm:p-4 bg-paper border-b border-line flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-md border border-line text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("video")}
            className={`px-3 py-1.5 rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "video"
                ? "bg-navy-900 text-gold-300 font-bold shadow-2xs"
                : "text-ink-soft hover:text-navy-900"
            }`}
          >
            <Icon name="video" size={14} className={activeTab === "video" ? "text-gold-400" : "text-ink-soft"} />
            <span>{course.intro_video_url ? "Video Overview" : "Qualification Briefing"}</span>
            <span className={`text-[10px] font-mono px-1 rounded-xs ${
              activeTab === "video" ? "bg-white/10 text-gold-300" : "bg-paper text-ink-soft"
            }`}>
              {course.intro_video_url ? "2:15" : "Overview"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("photos")}
            className={`px-3 py-1.5 rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "photos"
                ? "bg-navy-900 text-gold-300 font-bold shadow-2xs"
                : "text-ink-soft hover:text-navy-900"
            }`}
          >
            <Icon name="layers" size={14} className={activeTab === "photos" ? "text-gold-400" : "text-ink-soft"} />
            <span>Training & Faculty</span>
            <span className={`text-[10px] font-mono px-1 rounded-xs ${
              activeTab === "photos" ? "bg-white/10 text-gold-300" : "bg-paper text-ink-soft"
            }`}>
              {galleryImages.length} Photos
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("portal")}
            className={`px-3 py-1.5 rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "portal"
                ? "bg-navy-900 text-gold-300 font-bold shadow-2xs"
                : "text-ink-soft hover:text-navy-900"
            }`}
          >
            <Icon name="shield-check" size={14} className={activeTab === "portal" ? "text-gold-400" : "text-ink-soft"} />
            <span>Delivery Model</span>
          </button>
        </div>

        {/* Live Status indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-ink-soft">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Interactive Preview •{" "}
            {course.attendance_type === "physical_venue" || course.delivery === "classroom"
              ? "Physical Venue / Campus"
              : course.delivery === "blended"
              ? "Blended Practical"
              : "100% Online Distance"}
          </span>
        </div>
      </div>

      {/* 2. Media Display Screen */}
      <div className="relative aspect-[16/9] w-full bg-navy-950 overflow-hidden">
        {/* TAB A: VIDEO OVERVIEW */}
        {activeTab === "video" && (
          <div className="relative w-full h-full">
            {!isVideoPlaying ? (
              <div className="relative w-full h-full group cursor-pointer" onClick={() => setIsVideoPlaying(true)}>
                <Image
                  src={
                    course.intro_video_poster ||
                    course.image ||
                    galleryImages[0]?.src ||
                    "/images/adult-care-training.jpg"
                  }
                  alt={course.title}
                  fill
                  priority
                  unoptimized={Boolean(
                    (course.intro_video_poster || course.image)?.startsWith("data:") ||
                    (course.intro_video_poster || course.image)?.startsWith("http")
                  )}
                  className="object-cover opacity-60 group-hover:opacity-75 group-hover:scale-102 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />

                {/* Center Play Button */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gold-500 group-hover:bg-gold-400 text-navy-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5" viewBox="0 0 24 24">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>

                  <div className="space-y-1.5 max-w-lg">
                    <span className="inline-block text-[11px] font-mono uppercase tracking-wider text-gold-300 font-bold px-2 py-0.5 rounded-xs bg-navy-900/80 border border-gold-500/30">
                      {course.intro_video_url ? "Qualification Briefing Video" : "Qualification Induction Walkthrough"}
                    </span>
                    <h3 className="font-heading text-xl sm:text-2xl font-bold text-white tracking-wide">
                      Watch How You Will Complete Your {course.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-paper/80 leading-relaxed hidden sm:block">
                      Click to review the 4-step delivery architecture: live weekly seminars, 1-to-1 assessor allocation, coursework grading, and official Ofqual certificate dispatch.
                    </p>
                  </div>
                </div>

                {/* Corner Badges */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-paper/90 pointer-events-none">
                  <span className="px-2 py-1 rounded-xs bg-navy-900/90 border border-white/10 font-mono text-[11px]">
                    Ofqual Regulated Framework
                  </span>
                  <span className="px-2 py-1 rounded-xs bg-gold-500/90 text-navy-900 font-bold text-[11px]">
                    {course.intro_video_url ? "Click to Play Video" : "Click to View Briefing"}
                  </span>
                </div>
              </div>
            ) : formattedVideoUrl ? (
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
                  ✕ Close Video
                </button>
              </div>
            ) : (
              <div className="w-full h-full bg-navy-900 text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-gold-300 font-bold">
                      Smartminds Induction Walkthrough
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsVideoPlaying(false)}
                    className="px-2.5 py-1 rounded-xs bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Return to Cover
                  </button>
                </div>

                <div className="max-w-2xl mx-auto text-center space-y-3 py-2">
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
                    Step-by-Step Delivery for {course.title}
                  </h3>
                  <p className="text-xs text-paper/80 leading-relaxed max-w-xl mx-auto">
                    This qualification is delivered via British distance learning standards with full assessor guidance from enrolment to certificate dispatch.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-left">
                  <div className="p-3 bg-white/5 rounded-xs border border-white/10">
                    <span className="text-[10px] font-mono text-gold-300 block mb-1">Step 01</span>
                    <strong className="text-xs font-bold text-white block">Portal & Induction</strong>
                    <span className="text-[11px] text-paper/70 block mt-0.5">Instant portal access and tutor onboarding.</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xs border border-white/10">
                    <span className="text-[10px] font-mono text-gold-300 block mb-1">Step 02</span>
                    <strong className="text-xs font-bold text-white block">Evening Zoom Classes</strong>
                    <span className="text-[11px] text-paper/70 block mt-0.5">Live seminars with session replays saved.</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xs border border-white/10">
                    <span className="text-[10px] font-mono text-gold-300 block mb-1">Step 03</span>
                    <strong className="text-xs font-bold text-white block">100% Coursework</strong>
                    <span className="text-[11px] text-paper/70 block mt-0.5">Submit portfolio units with 5-day feedback.</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xs border border-white/10">
                    <span className="text-[10px] font-mono text-gold-300 block mb-1">Step 04</span>
                    <strong className="text-xs font-bold text-white block">Official Certificate</strong>
                    <span className="text-[11px] text-paper/70 block mt-0.5">Regulated RQF certificate posted to you.</span>
                  </div>
                </div>

                <div className="text-center pt-2 text-[11px] text-paper/60">
                  Admissions Open • Custom cohort schedules and private tutoring options available
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB B: TRAINING & FACULTY PHOTOS */}
        {activeTab === "photos" && (
          <div className="relative w-full h-full">
            <Image
              src={galleryImages[selectedPhotoIndex]?.src || galleryImages[0].src}
              alt={galleryImages[selectedPhotoIndex]?.caption || course.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent pointer-events-none" />

            {/* Photo Caption & Trust Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-white pointer-events-none">
              <div className="bg-navy-900/90 backdrop-blur-sm p-3 rounded-md border border-white/10 max-w-md">
                <div className="text-[10px] font-mono uppercase text-gold-300 font-bold mb-0.5">
                  Verified Learning Environment • Photo {selectedPhotoIndex + 1} of {galleryImages.length}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-white">
                  {galleryImages[selectedPhotoIndex]?.caption}
                </div>
              </div>

              {/* Thumbnail Selector */}
              <div className="flex items-center gap-1.5 pointer-events-auto bg-navy-900/80 p-1.5 rounded-md border border-white/10">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative w-12 h-8 rounded-xs overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedPhotoIndex === idx ? "border-gold-500 scale-105" : "border-white/30 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img.src} alt={img.caption} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB C: DELIVERY MODEL & PILLARS */}
        {activeTab === "portal" && (
          <div className="relative w-full h-full bg-navy-900 text-white p-6 sm:p-8 flex flex-col justify-center">
            {/* Background geometric accents */}
            <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full border border-gold-500/20 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full border border-white/10 pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-4 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-gold-300 font-bold">
                  {course.attendance_type === "physical_venue" || course.delivery === "classroom"
                    ? "British Campus & Practical Training Architecture"
                    : course.delivery === "blended"
                    ? "Blended Theory & Practical Healthcare Architecture"
                    : "British Distance Learning Architecture"}
                </span>
              </div>

              {course.custom_delivery_text && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/15 text-gold-300 border border-gold-500/30 text-xs font-semibold">
                  <Icon name="clock" size={12} />
                  <span>Cohort Schedule: {course.custom_delivery_text}</span>
                </div>
              )}

              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-wide">
                How You Study For Your {course.title}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
                <div className="p-3.5 rounded-md bg-white/5 border border-white/10 space-y-1">
                  <div className="w-8 h-8 rounded-xs bg-gold-500/20 text-gold-300 flex items-center justify-center mb-2">
                    <Icon
                      name={
                        course.attendance_type === "physical_venue" || course.delivery === "classroom"
                          ? "map-pin"
                          : "video"
                      }
                      size={16}
                    />
                  </div>
                  <strong className="text-xs font-bold text-white block">
                    {course.attendance_type === "physical_venue" || course.delivery === "classroom"
                      ? "1. Campus & Clinical Labs"
                      : course.delivery === "blended"
                      ? "1. Blended Live & Practical"
                      : "1. Live Evening Lectures"}
                  </strong>
                  <p className="text-[11px] text-paper/80 leading-normal">
                    {course.attendance_type === "physical_venue" || course.delivery === "classroom"
                      ? "Direct hands-on training with expert tutors at accredited UK campus venues."
                      : course.delivery === "blended"
                      ? "Interactive online theory combined with practical campus training and simulation."
                      : "Interactive weekly evening Zoom sessions with certified assessors. Session replays saved for revision."}
                  </p>
                </div>

                <div className="p-3.5 rounded-md bg-white/5 border border-white/10 space-y-1">
                  <div className="w-8 h-8 rounded-xs bg-gold-500/20 text-gold-300 flex items-center justify-center mb-2">
                    <Icon name="user" size={16} />
                  </div>
                  <strong className="text-xs font-bold text-white block">
                    2. Dedicated 1-to-1 Assessor
                  </strong>
                  <p className="text-[11px] text-paper/80 leading-normal">
                    Assigned personal mentor with 5 working day turnaround on coursework feedback via phone and WhatsApp.
                  </p>
                </div>

                <div className="p-3.5 rounded-md bg-white/5 border border-white/10 space-y-1">
                  <div className="w-8 h-8 rounded-xs bg-gold-500/20 text-gold-300 flex items-center justify-center mb-2">
                    <Icon name="check-circle" size={16} />
                  </div>
                  <strong className="text-xs font-bold text-white block">
                    3. Zero Exam Hall Pressure
                  </strong>
                  <p className="text-[11px] text-paper/80 leading-normal">
                    100% coursework portfolio assessment. Evidence gathered through workplace practice and portfolio units.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. High-Trust Value Strip Underneath Media */}
      <div className="p-4 bg-paper/80 border-t border-line grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
            <Icon name="shield-check" size={15} />
          </div>
          <div>
            <strong className="font-bold text-navy-900 block leading-tight">100% Coursework</strong>
            <span className="text-[11px] text-ink-soft">No written exam halls</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gold-500/20 text-gold-700 flex items-center justify-center shrink-0">
            <Icon name="clock" size={15} />
          </div>
          <div>
            <strong className="font-bold text-navy-900 block leading-tight">5-Day Feedback</strong>
            <span className="text-[11px] text-ink-soft">Fast assessor marking</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-navy-100 text-navy-900 flex items-center justify-center shrink-0">
            <Icon name="calendar" size={15} />
          </div>
          <div>
            <strong className="font-bold text-navy-900 block leading-tight">Evening Schedule</strong>
            <span className="text-[11px] text-ink-soft">Fits around work shifts</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-navy-100 text-navy-900 flex items-center justify-center shrink-0">
            <Icon name="credit-card" size={15} />
          </div>
          <div>
            <strong className="font-bold text-navy-900 block leading-tight">0% Interest Plans</strong>
            <span className="text-[11px] text-ink-soft">Spread over 6–12 months</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface GalleryImage {
  src: string;
  caption: string;
}

function getGalleryImagesForCourse(course: Course): GalleryImage[] {
  const cat = course.category.toLowerCase();

  if (cat.includes("health") || cat.includes("care")) {
    return [
      {
        src: "/images/adult-care-training.jpg",
        caption: "Adult Social Care Practical Assessment Suite & Clinical Guidance",
      },
      {
        src: "/images/hero-learner.jpg",
        caption: "Healthcare Practitioner Studying Diploma Units Online",
      },
      {
        src: "/images/tutor-teaching.jpg",
        caption: "Live Interactive Assessor Lecture & Portfolio Q&A Seminar",
      },
      {
        src: "/images/certificate-moment.jpg",
        caption: "Graduation & Official RQF Qualification Certificate Issuance",
      },
    ];
  }

  if (cat.includes("early years") || cat.includes("child")) {
    return [
      {
        src: "/images/early-years-training.jpg",
        caption: "Early Years & Nursery Educator Learning Suite",
      },
      {
        src: "/images/tutor-teaching.jpg",
        caption: "Dedicated Early Years Assessor 1-to-1 Mentoring",
      },
      {
        src: "/images/certificate-moment.jpg",
        caption: "NCFE CACHE Diploma Qualification Certification",
      },
    ];
  }

  if (cat.includes("teach") || cat.includes("education")) {
    return [
      {
        src: "/images/teacher-training.jpg",
        caption: "Teacher Education Seminar Room & Micro-Teach Observation Suite",
      },
      {
        src: "/images/tutor-teaching.jpg",
        caption: "Faculty Assessor Providing Feedback on Micro-Teaching Session",
      },
      {
        src: "/images/certificate-moment.jpg",
        caption: "Level 3 / Level 5 Teaching Qualification Certification",
      },
    ];
  }

  // Default / Business / IT
  return [
    {
      src: "/images/tutor-teaching.jpg",
      caption: "Interactive Online Faculty Lecture & Student Mentoring Seminar",
    },
    {
      src: "/images/hero-learner.jpg",
      caption: "Digital Learning Portal & Structured Coursework Units",
    },
    {
      src: "/images/certificate-moment.jpg",
      caption: "Official Regulated British Diploma Certification",
    },
  ];
}

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
