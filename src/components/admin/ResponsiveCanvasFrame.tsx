"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/Icon";

export interface ResponsiveCanvasFrameProps {
  viewport: "desktop" | "tablet" | "mobile";
  onViewportChange: (viewport: "desktop" | "tablet" | "mobile") => void;
  children: React.ReactNode;
}

export const ResponsiveCanvasFrame: React.FC<ResponsiveCanvasFrameProps> = ({
  viewport,
  onViewportChange,
  children,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [customWidth, setCustomWidth] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartX = useRef<number>(0);
  const dragStartWidth = useRef<number>(0);

  // Synchronize stylesheets, link tags, and html/body classes into iframe
  const syncStyles = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    const doc = iframe.contentDocument;

    if (!doc.head) return;

    // Set title and viewport meta
    let meta = doc.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = doc.createElement("meta");
      meta.setAttribute("name", "viewport");
      meta.setAttribute("content", "width=device-width, initial-scale=1");
      doc.head.appendChild(meta);
    }

    // Clean previous cloned styles
    const existingClones = doc.head.querySelectorAll('[data-cloned="true"]');
    existingClones.forEach((el) => el.remove());

    // Clone all style and link tags from main document
    const sourceStyles = document.querySelectorAll('link[rel="stylesheet"], style');
    sourceStyles.forEach((node) => {
      const clone = node.cloneNode(true) as HTMLElement;
      clone.setAttribute("data-cloned", "true");
      doc.head.appendChild(clone);
    });

    // Mirror HTML & BODY classes and styles for Next.js font variables and Tailwind theme
    doc.documentElement.className = document.documentElement.className;
    doc.body.className = `${document.body.className} bg-white antialiased overflow-x-hidden min-h-screen`;
    doc.documentElement.style.cssText = document.documentElement.style.cssText;
    doc.body.style.cssText = document.body.style.cssText;

    // Reset margin and padding inside iframe body
    doc.body.style.margin = "0";
    doc.body.style.padding = "0";

    setMountNode(doc.body);
  }, []);

  // Observe dynamically injected styles (Turbopack / Next.js dev server)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      syncStyles();
    });
    observer.observe(document.head, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [syncStyles]);

  // Initial load
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    if (iframe.contentDocument?.readyState === "complete") {
      syncStyles();
    } else {
      const handleLoad = () => syncStyles();
      iframe.addEventListener("load", handleLoad);
      return () => iframe.removeEventListener("load", handleLoad);
    }
  }, [syncStyles]);

  // Reset custom width when switching viewports
  useEffect(() => {
    setCustomWidth(null);
  }, [viewport]);

  // Drag-to-resize handlers
  const handleMouseDownRight = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartX.current = e.clientX;
    const current =
      customWidth ||
      (viewport === "mobile" ? 390 : viewport === "tablet" ? 768 : 1150);
    dragStartWidth.current = current;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartX.current;
      // Double the delta because the container is centered
      const newWidth = Math.max(320, Math.min(1440, dragStartWidth.current + deltaX * 2));
      setCustomWidth(Math.round(newWidth));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Determine active rendered width
  const activeWidth =
    customWidth ||
    (viewport === "mobile" ? 390 : viewport === "tablet" ? 768 : "100%");

  const isFluidDesktop = viewport === "desktop" && !customWidth;

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-slate-200/80 overflow-hidden relative select-none">
      {/* Viewport Control Bar with Real Dimension Badges & Quick Presets */}
      <div className="h-10 bg-slate-900 text-white px-4 flex items-center justify-between text-xs flex-shrink-0 border-b border-slate-800 z-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] font-bold text-gold-300 flex items-center gap-1.5">
            <Icon
              name={
                viewport === "mobile"
                  ? "smartphone"
                  : viewport === "tablet"
                  ? "tablet"
                  : "monitor"
              }
              size={13}
            />
            <span>
              {typeof activeWidth === "number" ? `${activeWidth}px` : "100% Full Width"}
            </span>
          </span>

          {/* Quick Presets for Current Viewport */}
          {viewport === "mobile" && (
            <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-sm">
              <button
                type="button"
                onClick={() => setCustomWidth(360)}
                className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold transition-colors ${
                  activeWidth === 360
                    ? "bg-navy-700 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                360px (Android)
              </button>
              <button
                type="button"
                onClick={() => setCustomWidth(390)}
                className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold transition-colors ${
                  activeWidth === 390
                    ? "bg-navy-700 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                390px (iPhone)
              </button>
              <button
                type="button"
                onClick={() => setCustomWidth(414)}
                className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold transition-colors ${
                  activeWidth === 414
                    ? "bg-navy-700 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                414px (Plus)
              </button>
            </div>
          )}

          {viewport === "tablet" && (
            <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-sm">
              <button
                type="button"
                onClick={() => setCustomWidth(768)}
                className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold transition-colors ${
                  activeWidth === 768
                    ? "bg-navy-700 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                768px (iPad)
              </button>
              <button
                type="button"
                onClick={() => setCustomWidth(820)}
                className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold transition-colors ${
                  activeWidth === 820
                    ? "bg-navy-700 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                820px (Air)
              </button>
              <button
                type="button"
                onClick={() => setCustomWidth(1024)}
                className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold transition-colors ${
                  activeWidth === 1024
                    ? "bg-navy-700 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                1024px (Pro)
              </button>
            </div>
          )}

          {customWidth && (
            <button
              type="button"
              onClick={() => setCustomWidth(null)}
              className="text-[10px] text-slate-400 hover:text-gold-300 underline"
            >
              Reset Width
            </button>
          )}
        </div>

        {/* Zoom Scale Controls */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">Scale:</span>
          <div className="flex items-center bg-slate-800 p-0.5 rounded-sm">
            {[1, 0.85, 0.75].map((scale) => (
              <button
                key={scale}
                type="button"
                onClick={() => setZoomScale(scale)}
                className={`px-1.5 py-0.5 rounded-xs text-[10px] font-semibold ${
                  zoomScale === scale
                    ? "bg-navy-700 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {Math.round(scale * 100)}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas Scrollable Workspace Area */}
      <div className="flex-1 min-h-0 overflow-auto p-4 sm:p-8 flex justify-center items-start">
        <div
          style={{
            transform: zoomScale !== 1 ? `scale(${zoomScale})` : undefined,
            transformOrigin: "top center",
            transition: isDragging ? "none" : "all 0.25s ease-out",
            width: isFluidDesktop ? "100%" : `${activeWidth}px`,
          }}
          className={`relative flex flex-col items-center max-w-full ${
            viewport === "mobile"
              ? "rounded-[40px] shadow-2xl border-[12px] border-slate-900 bg-slate-900 ring-4 ring-slate-800/60"
              : viewport === "tablet"
              ? "rounded-2xl shadow-2xl border-[10px] border-slate-800 bg-slate-800 ring-2 ring-slate-700/50"
              : "rounded-sm shadow-xl"
          }`}
        >
          {/* Mobile Speaker / Notch Simulation Bar */}
          {viewport === "mobile" && (
            <div className="w-full bg-slate-900 text-white px-6 py-2 flex items-center justify-between text-[11px] font-mono select-none rounded-t-[26px]">
              <span className="font-semibold text-slate-300">09:41</span>
              <div className="w-20 h-4 bg-slate-950 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-900/60 border border-slate-800" />
              </div>
              <span className="text-slate-300">5G 100%</span>
            </div>
          )}

          {/* Tablet Status Simulation Bar */}
          {viewport === "tablet" && (
            <div className="w-full bg-slate-800 text-slate-300 px-6 py-1.5 flex items-center justify-between text-[10px] font-mono select-none rounded-t-lg border-b border-slate-700/60">
              <span>iPad • 09:41</span>
              <span>100% Charged</span>
            </div>
          )}

          {/* Real Isolated Iframe */}
          <iframe
            ref={iframeRef}
            title="Smartminds Live Responsive Canvas"
            style={{
              width: "100%",
              height:
                viewport === "mobile"
                  ? "844px"
                  : viewport === "tablet"
                  ? "1024px"
                  : "100vh",
              minHeight:
                viewport === "mobile"
                  ? "844px"
                  : viewport === "tablet"
                  ? "1024px"
                  : "100vh",
            }}
            className={`border-none bg-white transition-opacity duration-200 ${
              mountNode ? "opacity-100" : "opacity-0"
            } ${viewport === "mobile" ? "rounded-b-[26px]" : viewport === "tablet" ? "rounded-b-lg" : ""}`}
          />

          {/* Interactive Drag Handles on Left & Right */}
          {viewport !== "desktop" && (
            <>
              {/* Right Drag Handle */}
              <div
                onMouseDown={handleMouseDownRight}
                title="Drag to resize viewport"
                className="absolute top-1/2 -right-4 -translate-y-1/2 w-4 h-16 bg-slate-900/80 hover:bg-gold-500 rounded-r-md cursor-ew-resize flex items-center justify-center text-white transition-colors shadow-md z-30 group"
              >
                <div className="w-0.5 h-6 bg-white/60 group-hover:bg-navy-900 rounded-full" />
              </div>

              {/* Left Drag Handle Mirror */}
              <div
                onMouseDown={handleMouseDownRight}
                title="Drag to resize viewport"
                className="absolute top-1/2 -left-4 -translate-y-1/2 w-4 h-16 bg-slate-900/80 hover:bg-gold-500 rounded-l-md cursor-ew-resize flex items-center justify-center text-white transition-colors shadow-md z-30 group"
              >
                <div className="w-0.5 h-6 bg-white/60 group-hover:bg-navy-900 rounded-full" />
              </div>
            </>
          )}

          {/* React Portal renders live components directly into iframe body! */}
          {mountNode && createPortal(children, mountNode)}
        </div>
      </div>
    </div>
  );
};
