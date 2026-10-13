"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";

export interface ImageDropzoneProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  accept?: string;
  maxSizeMb?: number;
  previewHeight?: number;
  showUrlInput?: boolean;
  className?: string;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  value,
  onChange,
  label = "Upload Image or Logo",
  helperText = "PNG, SVG, JPG, or WebP (max 5MB, transparent background recommended)",
  accept = "image/png,image/svg+xml,image/jpeg,image/webp",
  maxSizeMb = 5,
  previewHeight = 48,
  showUrlInput = true,
  className = "",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setErrorMsg(null);

    // Validate size
    if (file.size > maxSizeMb * 1024 * 1024) {
      setErrorMsg(`File size exceeds ${maxSizeMb}MB limit.`);
      return;
    }

    // Convert file to base64 data URL for instant client-side preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onChange(dataUrl);
      }
    };
    reader.onerror = () => {
      setErrorMsg("Failed to read image file. Please try another image.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-[11px] font-bold text-navy-900 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* If an image is currently set, show live preview card */}
      {value ? (
        <div className="relative rounded-sm border border-line bg-white p-3 shadow-xs space-y-2">
          {/* Subtle Checkerboard background to test transparency */}
          <div
            className="w-full flex items-center justify-center p-4 rounded-xs border border-line/60 overflow-hidden relative"
            style={{
              backgroundColor: "#f8fafc",
              backgroundImage:
                "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
              minHeight: `${Math.max(previewHeight + 24, 72)}px`,
            }}
          >
            <div
              style={{ height: `${previewHeight}px` }}
              className="relative max-w-full flex items-center justify-center"
            >
              {/* If base64 or SVG, standard img tag ensures crisp display without Next.js domain restrictions */}
              {value.startsWith("data:") || value.endsWith(".svg") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={value}
                  alt="Uploaded Asset Preview"
                  style={{ maxHeight: `${previewHeight}px` }}
                  className="max-h-full w-auto object-contain drop-shadow-xs"
                />
              ) : (
                <div
                  style={{ height: `${previewHeight}px`, width: "160px" }}
                  className="relative"
                >
                  <Image
                    src={value}
                    alt="Uploaded Asset Preview"
                    fill
                    className="object-contain"
                    sizes="160px"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 text-[11px] font-bold text-navy-900 hover:text-white bg-paper hover:bg-navy-900 border border-line rounded-sm transition-all flex items-center gap-1.5"
            >
              <Icon name="edit" size={12} />
              <span>Replace File</span>
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-sm transition-colors flex items-center gap-1"
            >
              <Icon name="trash" size={12} />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-sm p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
            isDragging
              ? "border-gold-500 bg-gold-50/60 scale-[0.99]"
              : "border-line hover:border-navy-900/40 bg-paper/50 hover:bg-paper"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-navy-900/5 text-navy-900 flex items-center justify-center">
            <Icon name="download" size={14} className="rotate-180 text-navy-900" />
          </div>
          <div>
            <span className="text-xs font-bold text-navy-900 block">
              Drag & Drop or Click to Browse
            </span>
            <span className="text-[10px] text-ink-soft block leading-normal mt-0.5">
              {helperText}
            </span>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Error Message */}
      {errorMsg && (
        <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] rounded-sm flex items-center gap-1.5">
          <Icon name="alert-circle" size={13} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Optional Manual URL input toggle */}
      {showUrlInput && (
        <div className="pt-1">
          {!showManualUrl ? (
            <button
              type="button"
              onClick={() => setShowManualUrl(true)}
              className="text-[10px] text-ink-soft hover:text-navy-900 underline flex items-center gap-1"
            >
              <span>Or enter public image URL / existing path</span>
            </button>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-ink-soft">
                  Image Path / URL:
                </span>
                <button
                  type="button"
                  onClick={() => setShowManualUrl(false)}
                  className="text-[10px] text-ink-soft hover:text-navy-900"
                >
                  ✕ Close
                </button>
              </div>
              <input
                type="text"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder="/images/custom-logo.png or https://..."
                className="w-full px-2 py-1 text-xs font-mono border border-line rounded-sm bg-white"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
