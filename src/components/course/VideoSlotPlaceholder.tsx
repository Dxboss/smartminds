import React from "react";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";

interface VideoSlotPlaceholderProps {
  courseTitle: string;
}

export const VideoSlotPlaceholder: React.FC<VideoSlotPlaceholderProps> = ({
  courseTitle,
}) => {
  return (
    <div
      aria-label="Course preview video placeholder"
      className="relative aspect-video w-full rounded-lg bg-navy-900 text-white overflow-hidden flex flex-col items-center justify-center p-6 text-center border border-line shadow-subtle group"
    >
      {/* Decorative crescent background geometry */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 pointer-events-none opacity-[0.08] text-white"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 100 100"
          fill="currentColor"
          className="w-full h-full"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-md space-y-3">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Tag variant="gold" className="text-xs">
            1-Min Course Overview
          </Tag>
          <span className="px-2 py-0.5 rounded-sm bg-white/10 text-[10px] font-mono uppercase tracking-wider text-paper/70">
            PLACEHOLDER
          </span>
        </div>

        <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-gold-500 shadow-sm">
          <Icon name="clock" size={24} />
        </div>

        <h3 className="font-heading text-lg font-bold text-white">
          Course Tutor Introduction: {courseTitle}
        </h3>

        <p className="text-xs text-paper/80 leading-relaxed max-w-sm mx-auto">
          Short video overview with the lead course tutor explaining syllabus
          structure, live webinars, and assignment expectations. (Video clip
          being recorded by college team).
        </p>
      </div>
    </div>
  );
};
