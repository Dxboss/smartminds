"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { LearningMaterial } from "@/lib/persistedData";

interface StudentMaterialsViewProps {
  materials: LearningMaterial[];
  enrolledCohortName?: string;
  tutorName?: string;
}

export function StudentMaterialsView({
  materials,
  enrolledCohortName,
  tutorName,
}: StudentMaterialsViewProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Document pack";
    if (bytes >= 1048576) {
      return `${(bytes / 1048576).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  const getFormatDetails = (type: string) => {
    switch (type) {
      case "pdf":
        return {
          label: "PDF Guide",
          bg: "bg-red-50 text-red-700 border-red-200",
          icon: "file-text" as const,
        };
      case "ppt":
        return {
          label: "Presentation Slides",
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          icon: "monitor" as const,
        };
      case "docx":
        return {
          label: "Criteria Brief / Word",
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          icon: "file-text" as const,
        };
      default:
        return {
          label: "Resource Link",
          bg: "bg-navy-900/5 text-navy-900 border-navy-900/20",
          icon: "external-link" as const,
        };
    }
  };

  const publishedMaterials = materials.filter((m) => m.published);

  const filtered = publishedMaterials.filter((m) => {
    if (filterType !== "all" && m.fileType !== filterType) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchDesc = m.description.toLowerCase().includes(q);
      const matchUnit = m.unitCode?.toLowerCase().includes(q);
      const matchFile = m.fileName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchUnit && !matchFile) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Active Cohort Banner */}
      {enrolledCohortName && (
        <div className="p-4 rounded-sm bg-navy-900/5 border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-navy-900 text-gold-300 flex items-center justify-center shrink-0">
              <Icon name="graduation-cap" size={16} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-navy-900 uppercase tracking-wider block">
                Enrolled Cohort Materials
              </span>
              <p className="text-xs text-ink-soft">
                <strong className="text-navy-900">{enrolledCohortName}</strong>
                {tutorName ? ` · Lead Tutor: ${tutorName}` : ""}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-sm bg-white border border-line text-navy-900 self-start sm:self-auto">
            {publishedMaterials.length} Documents Available
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-md border border-line p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
              filterType === "all"
                ? "bg-navy-900 text-white"
                : "bg-paper text-navy-900 border border-line hover:border-navy-900"
            }`}
          >
            All materials ({publishedMaterials.length})
          </button>
          <button
            onClick={() => setFilterType("pdf")}
            className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
              filterType === "pdf"
                ? "bg-navy-900 text-white"
                : "bg-paper text-navy-900 border border-line hover:border-navy-900"
            }`}
          >
            PDF Guides
          </button>
          <button
            onClick={() => setFilterType("ppt")}
            className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
              filterType === "ppt"
                ? "bg-navy-900 text-white"
                : "bg-paper text-navy-900 border border-line hover:border-navy-900"
            }`}
          >
            Presentations
          </button>
          <button
            onClick={() => setFilterType("docx")}
            className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
              filterType === "docx"
                ? "bg-navy-900 text-white"
                : "bg-paper text-navy-900 border border-line hover:border-navy-900"
            }`}
          >
            Word & Briefs
          </button>
          <button
            onClick={() => setFilterType("link")}
            className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
              filterType === "link"
                ? "bg-navy-900 text-white"
                : "bg-paper text-navy-900 border border-line hover:border-navy-900"
            }`}
          >
            Resource Links
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search study materials..."
            className="w-full text-xs rounded-sm border border-line pl-8 pr-3 py-1.5 text-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900 bg-paper"
          />
          <div className="absolute left-2.5 top-2 text-ink-soft">
            <Icon name="search" size={13} />
          </div>
        </div>
      </div>

      {/* Materials List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-md border border-line p-12 text-center space-y-3 shadow-sm">
          <Icon name="book-open" size={36} className="text-navy-900/40 mx-auto" />
          <h3 className="font-heading text-lg font-bold text-navy-900">
            No study materials found
          </h3>
          <p className="text-xs text-ink-soft max-w-sm mx-auto">
            {searchQuery
              ? "No materials match your search query. Try clearing your search term."
              : "Your course tutor has not published any study documents for this category yet. Check back soon."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((mat) => {
            const format = getFormatDetails(mat.fileType);
            return (
              <div
                key={mat.id}
                className="bg-white rounded-md border border-line p-5 flex flex-col justify-between gap-4 shadow-sm hover:border-navy-900/30 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-sm border ${format.bg}`}>
                      <Icon name={format.icon} size={12} />
                      <span>{format.label}</span>
                    </span>

                    {mat.unitCode && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-sm bg-navy-900/5 text-navy-900 border border-navy-900/10">
                        Unit {mat.unitCode}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-navy-900 line-clamp-2">
                      {mat.title}
                    </h3>
                    <p className="text-xs text-ink-soft leading-relaxed mt-1 line-clamp-3">
                      {mat.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-line/60">
                  <div className="flex items-center justify-between text-[11px] text-ink-soft">
                    <span className="truncate max-w-[180px] font-mono text-navy-900">
                      {mat.fileName}
                    </span>
                    <span>{formatFileSize(mat.fileSizeBytes)}</span>
                  </div>

                  <a
                    href={mat.fileUrl}
                    download={mat.fileType === "link" ? undefined : mat.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-sm bg-navy-900 text-white text-xs font-semibold hover:bg-navy-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Icon name={mat.fileType === "link" ? "external-link" : "download"} size={14} />
                    <span>{mat.fileType === "link" ? "Open resource link" : "Download study material"}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
