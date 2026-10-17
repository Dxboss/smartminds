"use client";

import React from "react";
import { Icon } from "@/components/ui/Icon";

export interface EditableElementWrapperProps {
  children: React.ReactNode;
  isEditor?: boolean;
  isSelected?: boolean;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  inline?: boolean;
}

/**
 * Elementor/Canva-style active bounding box & hover outline wrapper.
 * When `isEditor` is false, it renders zero DOM overhead (pure fragment).
 * When `isEditor` is true, it provides:
 * - Direct click selection with stopPropagation/preventDefault.
 * - Elementor-style solid gold bounding box with 4 corner pips and header badge when selected.
 * - Subtle dashed hover outline and hover badge when unselected.
 */
export const EditableElementWrapper: React.FC<EditableElementWrapperProps> = ({
  children,
  isEditor = false,
  isSelected = false,
  label,
  onClick,
  className = "",
  inline = false,
}) => {
  if (!isEditor) {
    return <>{children}</>;
  }

  const Tag = inline ? "span" : "div";

  return (
    <Tag
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onClick?.(e);
      }}
      className={`relative transition-all duration-150 ${inline ? "inline-block" : "block"} ${
        isSelected
          ? "outline outline-2 outline-gold-500 ring-4 ring-gold-500/20 z-30 cursor-default"
          : "cursor-pointer group/editable hover:outline hover:outline-dashed hover:outline-2 hover:outline-gold-500/80 hover:ring-2 hover:ring-gold-500/10 z-10"
      } ${className}`}
    >
      {/* Active State: Elementor-style persistent header badge + 4 corner pips */}
      {isSelected && (
        <>
          <span className="absolute -top-6 left-0 z-40 px-2 py-0.5 rounded-t-xs bg-navy-900 text-gold-300 text-[10px] font-bold shadow-md flex items-center gap-1 border-t border-x border-gold-500 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
            <Icon name="edit" size={10} className="text-gold-400" />
            <span>{label}</span>
          </span>
          {/* Corner resize/bounding handles */}
          <span className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 bg-gold-500 border border-navy-900 rounded-[1px] pointer-events-none z-40 shadow-xs" />
          <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-gold-500 border border-navy-900 rounded-[1px] pointer-events-none z-40 shadow-xs" />
          <span className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 bg-gold-500 border border-navy-900 rounded-[1px] pointer-events-none z-40 shadow-xs" />
          <span className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 bg-gold-500 border border-navy-900 rounded-[1px] pointer-events-none z-40 shadow-xs" />
        </>
      )}

      {/* Hover State (when not selected): Elementor hover badge */}
      {!isSelected && (
        <span className="hidden group-hover/editable:inline-flex absolute -top-5 left-0 z-30 px-1.5 py-0.5 rounded-xs bg-navy-900 text-gold-300 text-[9px] font-bold shadow-xs whitespace-nowrap pointer-events-none items-center gap-1">
          <span>{label}</span>
          <Icon name="edit" size={8} className="text-gold-400" />
        </span>
      )}

      {children}
    </Tag>
  );
};
