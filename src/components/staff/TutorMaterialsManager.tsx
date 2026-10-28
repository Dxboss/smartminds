"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { LearningMaterial } from "@/lib/persistedData";
import { saveMaterialAction, deleteMaterialAction } from "@/app/staff/actions";

interface TutorMaterialsManagerProps {
  initialMaterials: LearningMaterial[];
  tutorClasses: { id: string; name: string }[];
  currentTutorName: string;
}

export function TutorMaterialsManager({
  initialMaterials,
  tutorClasses,
  currentTutorName,
}: TutorMaterialsManagerProps) {
  const [materials, setMaterials] = useState<LearningMaterial[]>(initialMaterials);
  const [selectedCohort, setSelectedCohort] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [unitCode, setUnitCode] = useState("");
  const [cohortId, setCohortId] = useState(tutorClasses[0]?.id || "");
  const [fileType, setFileType] = useState<"pdf" | "ppt" | "docx" | "link">("pdf");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(0);
  const [published, setPublished] = useState(true);

  // File picker handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSizeBytes(file.size);
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf") setFileType("pdf");
      else if (ext === "ppt" || ext === "pptx") setFileType("ppt");
      else if (ext === "doc" || ext === "docx") setFileType("docx");

      // Read file as data URL if under 4MB so students can download the real uploaded document
      if (file.size <= 4 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            setFileUrl(reader.result);
          }
        };
        reader.readAsDataURL(file);
      } else {
        setFileUrl(`/documents/${encodeURIComponent(file.name)}`);
      }

      if (!title) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        setTitle(cleanName);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Please provide a material title.");
      return;
    }

    if (fileType === "link") {
      if (!fileUrl.trim()) {
        setErrorMsg("Please enter the external resource URL (https://...).");
        return;
      }
    } else if (!fileName.trim()) {
      setErrorMsg("Please select a document file to upload.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const selectedClassObj = tutorClasses.find((c) => c.id === cohortId);
    const resolvedFileName =
      fileType === "link"
        ? fileName.trim() || fileUrl.trim()
        : fileName.trim();
    const resolvedFileUrl =
      fileType === "link"
        ? fileUrl.trim()
        : fileUrl.trim() || `/documents/${encodeURIComponent(resolvedFileName)}`;

    try {
      const res = await saveMaterialAction({
        title: title.trim(),
        description: description.trim(),
        unitCode: unitCode.trim() || undefined,
        cohortId: cohortId || undefined,
        cohortName: selectedClassObj ? selectedClassObj.name : "All Assigned Cohorts",
        fileType,
        fileName: resolvedFileName,
        fileUrl: resolvedFileUrl,
        fileSizeBytes: fileType === "link" ? undefined : fileSizeBytes,
        published,
      });

      if (res.success && res.material) {
        setMaterials((prev) => [res.material, ...prev.filter((m) => m.id !== res.material.id)]);
        setIsModalOpen(false);
        // Reset form
        setTitle("");
        setDescription("");
        setUnitCode("");
        setFileName("");
        setFileUrl("");
        setFileSizeBytes(0);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save learning material.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the learning materials cabinet?`)) {
      return;
    }

    try {
      const res = await deleteMaterialAction(id);
      if (res.success) {
        setMaterials((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err: any) {
      alert("Failed to delete material: " + err.message);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes >= 1048576) {
      return `${(bytes / 1048576).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  const getFormatBadge = (type: string) => {
    switch (type) {
      case "pdf":
        return {
          label: "PDF Document",
          bg: "bg-red-50 text-red-700 border-red-200",
          icon: "file-text" as const,
        };
      case "ppt":
        return {
          label: "PowerPoint Slides",
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          icon: "monitor" as const,
        };
      case "docx":
        return {
          label: "Word / Criteria Brief",
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

  // Filter materials
  const filtered = materials.filter((m) => {
    if (selectedCohort !== "all" && m.cohortId && m.cohortId !== selectedCohort) {
      return false;
    }
    if (selectedType !== "all" && m.fileType !== selectedType) {
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
      {/* Top Banner / Actions */}
      <div className="bg-white rounded-md border border-line p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="font-heading text-xl font-bold text-navy-900">
            Tutor document cabinet & study packs
          </h2>
          <p className="text-xs text-ink-soft">
            Upload and organise accredited study guides, presentation slides, practice papers, and observation forms for your learners.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-sm bg-navy-900 text-white text-xs font-semibold hover:bg-navy-700 transition-colors inline-flex items-center gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Icon name="plus" size={15} />
          <span>+ Upload course material</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-md border border-line p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-navy-900 mb-1">
            Filter by cohort
          </label>
          <select
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
            className="w-full text-xs rounded-sm border border-line px-2.5 py-1.5 text-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900 bg-paper"
          >
            <option value="all">All assigned cohorts ({materials.length})</option>
            {tutorClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy-900 mb-1">
            Document format
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full text-xs rounded-sm border border-line px-2.5 py-1.5 text-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900 bg-paper"
          >
            <option value="all">All formats</option>
            <option value="pdf">PDF documents (.pdf)</option>
            <option value="ppt">PowerPoint presentations (.ppt, .pptx)</option>
            <option value="docx">Word documents (.docx, .doc)</option>
            <option value="link">External resource links</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy-900 mb-1">
            Search materials
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, unit, or filename..."
              className="w-full text-xs rounded-sm border border-line pl-8 pr-2.5 py-1.5 text-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900 bg-paper"
            />
            <div className="absolute left-2.5 top-2 text-ink-soft">
              <Icon name="search" size={13} />
            </div>
          </div>
        </div>
      </div>

      {/* Materials List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-md border border-line p-12 text-center space-y-3 shadow-sm">
          <Icon name="book-open" size={36} className="text-navy-900/40 mx-auto" />
          <h3 className="font-heading text-lg font-bold text-navy-900">
            No course materials match your selection
          </h3>
          <p className="text-xs text-ink-soft max-w-sm mx-auto">
            You can upload your first lecture pack or assessment brief using the upload button above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((mat) => {
            const badge = getFormatBadge(mat.fileType);
            return (
              <div
                key={mat.id}
                className="bg-white rounded-md border border-line p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-navy-900/30 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-sm border ${badge.bg}`}>
                      <Icon name={badge.icon} size={12} />
                      <span>{badge.label}</span>
                    </span>

                    {mat.unitCode && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-sm bg-navy-900/5 text-navy-900 border border-navy-900/10">
                        Unit {mat.unitCode}
                      </span>
                    )}

                    {mat.cohortName && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-sm bg-paper text-ink-soft border border-line">
                        {mat.cohortName}
                      </span>
                    )}

                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${mat.published ? "bg-emerald-50 text-emerald-800" : "bg-gray-100 text-gray-700"}`}>
                      {mat.published ? "Published to students" : "Draft (hidden)"}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-navy-900">
                    {mat.title}
                  </h3>

                  <p className="text-xs text-ink-soft leading-relaxed max-w-3xl">
                    {mat.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-ink-soft">
                    <span className="font-mono text-navy-900">{mat.fileName}</span>
                    <span>·</span>
                    <span>{formatFileSize(mat.fileSizeBytes)}</span>
                    <span>·</span>
                    <span>Uploaded by {mat.tutorName || currentTutorName}</span>
                    <span>·</span>
                    <span>{new Date(mat.createdAt).toLocaleDateString("en-GB")}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center">
                  <a
                    href={mat.fileUrl}
                    download={mat.fileType === "link" ? undefined : mat.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-sm bg-paper border border-line text-navy-900 text-xs font-semibold hover:bg-navy-900 hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Icon name={mat.fileType === "link" ? "external-link" : "download"} size={13} />
                    <span>{mat.fileType === "link" ? "Open link" : "Download"}</span>
                  </a>

                  <button
                    onClick={() => handleDelete(mat.id, mat.title)}
                    className="p-1.5 rounded-sm border border-line text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                    title="Delete document"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-md border border-line shadow-xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Icon name="upload" size={18} className="text-navy-900" />
                <h3 className="font-heading text-lg font-bold text-navy-900">
                  Upload course material
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-sm text-ink-soft hover:text-navy-900 hover:bg-paper cursor-pointer"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-sm bg-red-50 border border-red-200 text-red-800 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Document title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unit 1: Safeguarding Statutory Guidance & Lecture Slides"
                  className="w-full text-xs rounded-sm border border-line px-3 py-2 text-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900 bg-paper"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1">
                    Target cohort
                  </label>
                  <select
                    value={cohortId}
                    onChange={(e) => setCohortId(e.target.value)}
                    className="w-full text-xs rounded-sm border border-line px-3 py-2 text-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900 bg-paper"
                  >
                    <option value="">All assigned cohorts</option>
                    {tutorClasses.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1">
                    Unit code (optional)
                  </label>
                  <input
                    type="text"
                    value={unitCode}
                    onChange={(e) => setUnitCode(e.target.value)}
                    placeholder="e.g. MOD-01 or EYFS-02"
                    className="w-full text-xs rounded-sm border border-line px-3 py-2 text-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900 bg-paper"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Instructions & learner description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide guidance on what students should review before attending live sessions or submitting coursework..."
                  className="w-full text-xs rounded-sm border border-line px-3 py-2 text-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900 bg-paper leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-line pt-3">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1">
                    Document format
                  </label>
                  <select
                    value={fileType}
                    onChange={(e) => {
                      const nextType = e.target.value as "pdf" | "ppt" | "docx" | "link";
                      setFileType(nextType);
                      if (nextType === "link" && fileUrl.startsWith("/documents/")) {
                        setFileUrl("");
                      }
                    }}
                    className="w-full text-xs rounded-sm border border-line px-3 py-2 text-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900 bg-paper"
                  >
                    <option value="pdf">PDF document (.pdf)</option>
                    <option value="ppt">PowerPoint presentation (.ppt, .pptx)</option>
                    <option value="docx">Word document (.docx, .doc)</option>
                    <option value="link">External link</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-navy-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="rounded-xs border-line text-navy-900 focus:ring-navy-900"
                    />
                    <span>Publish immediately to student portal</span>
                  </label>
                </div>
              </div>

              {/* Conditional File Upload OR External Link Input */}
              {fileType === "link" ? (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-navy-900">
                    External resource URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={fileUrl}
                    onChange={(e) => {
                      setFileUrl(e.target.value);
                      setFileName(e.target.value);
                    }}
                    placeholder="https://..."
                    className="w-full text-xs font-mono rounded-sm border border-line px-3 py-2 text-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900 bg-paper"
                  />
                  <p className="text-[11px] text-ink-soft">
                    Paste the full web address (e.g. Google Drive, OneDrive, Gov.uk statutory guidance, or article URL).
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-navy-900">
                    Select file to upload (PDF, PPT, DOCX) *
                  </label>

                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      id="material-upload-input"
                      accept=".pdf,.ppt,.pptx,.doc,.docx"
                      onChange={handleFileChange}
                      className="text-xs text-ink-soft file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-navy-900 file:text-white hover:file:bg-navy-700 cursor-pointer"
                    />
                  </div>

                  {fileName && (
                    <div className="p-2.5 rounded-sm bg-navy-900/5 border border-navy-900/10 flex items-center justify-between text-xs">
                      <span className="font-mono text-navy-900">{fileName}</span>
                      <span className="text-ink-soft">{formatFileSize(fileSizeBytes)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-sm border border-line text-xs font-semibold text-navy-900 hover:bg-paper transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-sm bg-navy-900 text-white text-xs font-semibold hover:bg-navy-700 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {isSubmitting ? (
                    <span>Saving material...</span>
                  ) : (
                    <>
                      <Icon name="check" size={14} />
                      <span>Upload & publish</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
