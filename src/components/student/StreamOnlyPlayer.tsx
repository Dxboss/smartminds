"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";

interface Props {
  viewerEmail: string;
  videoTitle: string;
  sessionDate: string;
  classNameTitle: string;
  videoUrl?: string;
}

export const StreamOnlyPlayer: React.FC<Props> = ({
  viewerEmail,
  videoTitle,
  sessionDate,
  classNameTitle,
  videoUrl,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const isDirectPlayable = Boolean(
    videoUrl &&
      videoUrl.trim() !== "" &&
      (videoUrl.endsWith(".mp4") ||
        videoUrl.endsWith(".webm") ||
        videoUrl.endsWith(".ogg") ||
        videoUrl.startsWith("blob:"))
  );

  return (
    <div className="space-y-4">
      {/* Video Container with Stream-only watermark overlay */}
      <div
        className="relative aspect-video bg-navy-900 rounded-md overflow-hidden shadow-card border border-navy-700 select-none group"
        onContextMenu={(e) => e.preventDefault()}
      >
        {isPlaying ? (
          <div className="w-full h-full flex items-center justify-center bg-black relative">
            {isDirectPlayable ? (
              <video
                className="w-full h-full object-cover"
                controls
                controlsList="nodownload"
                disablePictureInPicture
                playsInline
                autoPlay
                src={videoUrl}
              >
                Your browser does not support stream playback.
              </video>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-navy-950 via-navy-900 to-black text-white space-y-3">
                <div className="w-16 h-16 rounded-full bg-navy-800/80 border border-gold-300/40 flex items-center justify-center shadow-lg">
                  <Icon name="video" size={32} className="text-gold-300 animate-pulse" />
                </div>
                <div className="space-y-1 max-w-md">
                  <p className="font-heading text-lg font-bold text-white">
                    Streaming Session: {videoTitle}
                  </p>
                  <p className="text-xs text-white/70">
                    Encrypted stream delivery active · Watermarked to {viewerEmail} · Duration: 1h 48m
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPlaying(false)}
                  className="px-3.5 py-1.5 rounded-sm bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors pointer-events-auto cursor-pointer"
                >
                  Stop Stream
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-br from-navy-900 to-navy-700 relative">
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              className="w-16 h-16 rounded-full bg-gold-500 hover:bg-gold-300 text-navy-900 flex items-center justify-center transition-transform hover:scale-105 shadow-lg group-hover:scale-110 mb-4 cursor-pointer"
              aria-label="Play recording"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="ml-1"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <span className="text-xs uppercase font-semibold tracking-wider text-gold-300 block mb-1">
              Class Recording Archive
            </span>
            <h3 className="font-heading text-xl sm:text-2xl font-bold max-w-lg">
              {videoTitle}
            </h3>
            <p className="text-xs text-white/70 mt-1">
              {classNameTitle} · {sessionDate}
            </p>
          </div>
        )}

        {/* Security Watermark Overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20 overflow-hidden">
          <div className="flex justify-between items-center text-[10px] sm:text-xs text-white/40 font-mono select-none">
            <span className="bg-navy-900/60 px-2 py-0.5 rounded-sm">
              STREAM ONLY · {viewerEmail}
            </span>
            <span className="bg-navy-900/60 px-2 py-0.5 rounded-sm">
              ID: SMARTMINDS-DEMO
            </span>
          </div>

          {/* Diagonal Center Watermark */}
          <div className="text-center transform -rotate-12 select-none opacity-25">
            <p className="text-xs sm:text-sm md:text-base font-bold font-mono tracking-widest text-white uppercase">
              STUDENT STUDY ONLY · {viewerEmail}
            </p>
            <p className="text-[10px] text-white/60 font-mono">
              UNAUTHORIZED COPYING PROHIBITED
            </p>
          </div>

          <div className="flex justify-between items-center text-[10px] text-white/40 font-mono select-none">
            <span className="bg-navy-900/60 px-2 py-0.5 rounded-sm">
              CONFIDENTIAL EDUCATIONAL ASSET
            </span>
            <span className="bg-navy-900/60 px-2 py-0.5 rounded-sm">
              {viewerEmail}
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory PRD 12.5 Protection Notice */}
      <div className="p-3 bg-paper rounded-sm border border-line text-xs text-ink-soft flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon name="shield-check" size={16} className="text-navy-900 flex-shrink-0" />
          <span>
            Recordings are for your own study and cannot be downloaded.
          </span>
        </div>
        <span className="text-[11px] font-mono text-ink-soft hidden sm:inline">
          Protected stream (Watermarked to {viewerEmail})
        </span>
      </div>
    </div>
  );
};
