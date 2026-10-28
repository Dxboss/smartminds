"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import type { MediaLibraryItem } from "@/lib/persistedData";
import {
  listMediaLibraryAction,
  saveMediaLibraryItemAction,
  deleteMediaLibraryItemAction,
} from "@/app/admin/actions";

export interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: MediaLibraryItem) => void;
  currentUrl?: string;
  title?: string;
}

export function compressBrowserImageFile(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<{ dataUrl: string; width?: number; height?: number; mimeType: string }> {
  return new Promise((resolve, reject) => {
    if (file.type === "image/svg+xml" || !file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) =>
        resolve({
          dataUrl: e.target?.result as string,
          mimeType: file.type || "application/octet-stream",
        });
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        if (width / maxWidth > height / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        const reader = new FileReader();
        reader.onload = (e) =>
          resolve({
            dataUrl: e.target?.result as string,
            width,
            height,
            mimeType: file.type,
          });
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const mimeType = file.type === "image/png" ? "image/webp" : "image/jpeg";
      const compressedDataUrl = canvas.toDataURL(mimeType, quality);
      resolve({
        dataUrl: compressedDataUrl,
        width,
        height,
        mimeType,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = (e) =>
        resolve({
          dataUrl: e.target?.result as string,
          mimeType: file.type || "image/jpeg",
        });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };
    img.src = objectUrl;
  });
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentUrl,
  title = "Select or Upload Media",
}) => {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaLibraryItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "image" | "brand" | "document" | "video"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Editable attachment metadata in sidebar
  const [editTitle, setEditTitle] = useState("");
  const [editAltText, setEditAltText] = useState("");
  const [editCategory, setEditCategory] = useState<MediaLibraryItem["category"]>("image");

  // External URL add state
  const [externalUrl, setExternalUrl] = useState("");
  const [externalTitle, setExternalTitle] = useState("");
  const [externalAlt, setExternalAlt] = useState("");

  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setIsLoading(true);
    listMediaLibraryAction()
      .then((res) => {
        if (cancelled) return;
        if (res?.items) {
          setItems(res.items);
          if (currentUrl) {
            const match = res.items.find((i) => i.url === currentUrl);
            if (match) {
              setSelectedItem(match);
              setEditTitle(match.title);
              setEditAltText(match.altText || "");
              setEditCategory(match.category || "image");
            }
          } else if (res.items.length > 0 && !selectedItem) {
            setSelectedItem(res.items[0]);
            setEditTitle(res.items[0].title);
            setEditAltText(res.items[0].altText || "");
            setEditCategory(res.items[0].category || "image");
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleSelectItem = (item: MediaLibraryItem) => {
    setSelectedItem(item);
    setEditTitle(item.title || "");
    setEditAltText(item.altText || "");
    setEditCategory(item.category || "image");
    setStatusNotice(null);
  };

  const handleFilesUpload = async (fileList: FileList | File[]) => {
    setUploadError(null);
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setIsLoading(true);
    try {
      let newestItem: MediaLibraryItem | null = null;
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          setUploadError(`"${file.name}" exceeds the 10MB file size limit.`);
          continue;
        }
        const compressed = await compressBrowserImageFile(file);
        const res = await saveMediaLibraryItemAction({
          fileName: file.name,
          title: file.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[-_]+/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          url: compressed.dataUrl,
          mimeType: compressed.mimeType,
          sizeBytes: file.size,
          width: compressed.width,
          height: compressed.height,
        });
        if (res.success && res.items) {
          setItems(res.items);
          if (res.item) newestItem = res.item;
        }
      }
      if (newestItem) {
        handleSelectItem(newestItem);
        setActiveTab("library");
        setStatusNotice("Uploaded and saved to Media Library.");
      }
    } catch {
      setUploadError("Failed to upload file. Please try another file.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExternalUrl = () => {
    if (!externalUrl.trim()) {
      setUploadError("Please enter a valid media URL or path.");
      return;
    }
    setUploadError(null);
    startTransition(async () => {
      const res = await saveMediaLibraryItemAction({
        url: externalUrl.trim(),
        title: externalTitle.trim() || undefined,
        altText: externalAlt.trim() || undefined,
      });
      if (res.success && res.items) {
        setItems(res.items);
        if (res.item) {
          handleSelectItem(res.item);
        }
        setExternalUrl("");
        setExternalTitle("");
        setExternalAlt("");
        setActiveTab("library");
        setStatusNotice("External media added to library.");
      } else {
        setUploadError(res.error || "Could not save external media URL.");
      }
    });
  };

  const handleSaveMetadata = () => {
    if (!selectedItem) return;
    startTransition(async () => {
      const res = await saveMediaLibraryItemAction({
        id: selectedItem.id,
        url: selectedItem.url,
        fileName: selectedItem.fileName,
        title: editTitle.trim() || selectedItem.title,
        altText: editAltText.trim(),
        category: editCategory,
      });
      if (res.success && res.items && res.item) {
        setItems(res.items);
        setSelectedItem(res.item);
        setStatusNotice("Attachment details saved.");
      }
    });
  };

  const handleDeleteSelected = () => {
    if (!selectedItem) return;
    const itemToDelete = selectedItem;
    startTransition(async () => {
      const res = await deleteMediaLibraryItemAction(itemToDelete.id);
      if (res.success && res.items) {
        setItems(res.items);
        setSelectedItem(res.items[0] || null);
        if (res.items[0]) {
          setEditTitle(res.items[0].title);
          setEditAltText(res.items[0].altText || "");
          setEditCategory(res.items[0].category || "image");
        }
        setStatusNotice("Removed from Media Library.");
      }
    });
  };

  const filteredItems = items.filter((item) => {
    const matchesCat = categoryFilter === "all" || item.category === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.fileName.toLowerCase().includes(q) ||
      (item.altText || "").toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div
      className="fixed inset-0 z-[120] bg-navy-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white border border-line rounded-lg shadow-2xl w-full max-w-6xl h-[86vh] max-h-[820px] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top WordPress-Style Modal Header & Tabs */}
        <div className="px-6 pt-4 border-b border-line bg-paper flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 pb-3">
              <div className="w-8 h-8 rounded-sm bg-navy-900 text-gold-500 flex items-center justify-center">
                <Icon name="image" size={16} />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-navy-900 leading-none">
                  {title}
                </h2>
                <p className="text-[11px] text-ink-soft mt-0.5">
                  Central College Media Library — Upload once, reuse across pages, courses & articles
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 self-end">
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`px-4 py-2.5 text-xs font-bold border-t border-x rounded-t-sm transition-colors flex items-center gap-1.5 ${
                  activeTab === "upload"
                    ? "bg-white text-navy-900 border-line -mb-px"
                    : "bg-transparent text-ink-soft border-transparent hover:text-navy-900"
                }`}
              >
                <Icon name="upload" size={14} />
                <span>Upload Files</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("library")}
                className={`px-4 py-2.5 text-xs font-bold border-t border-x rounded-t-sm transition-colors flex items-center gap-1.5 ${
                  activeTab === "library"
                    ? "bg-white text-navy-900 border-line -mb-px"
                    : "bg-transparent text-ink-soft border-transparent hover:text-navy-900"
                }`}
              >
                <Icon name="image" size={14} />
                <span>Media Library ({items.length})</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="self-end sm:self-center mb-3 sm:mb-0 p-2 text-ink-soft hover:text-navy-900 hover:bg-line/40 rounded-sm transition-colors"
            aria-label="Close Media Library"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Body Content */}
        {activeTab === "upload" ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl space-y-6">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files?.length) {
                    handleFilesUpload(e.dataTransfer.files);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? "border-gold-500 bg-gold-300/15 scale-[0.99]"
                    : "border-line hover:border-navy-900 bg-paper/60 hover:bg-paper"
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-navy-900 text-gold-500 flex items-center justify-center shadow-sm">
                  <Icon name="upload" size={24} />
                </div>
                <div>
                  <p className="font-heading text-xl font-bold text-navy-900">
                    Drop files anywhere to upload
                  </p>
                  <p className="text-xs text-ink-soft mt-1">
                    or click to browse from your computer (JPG, PNG, WebP, SVG, PDF up to 10MB)
                  </p>
                </div>
                <span className="mt-2 px-5 py-2.5 bg-navy-900 text-white text-xs font-bold rounded-sm shadow-xs">
                  Select Files from Computer
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/svg+xml,image/jpeg,image/webp,application/pdf"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      handleFilesUpload(e.target.files);
                    }
                  }}
                  className="hidden"
                />
              </div>

              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm flex items-center gap-2">
                  <Icon name="alert-circle" size={15} />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Add from External URL */}
              <div className="border border-line rounded-sm p-5 bg-paper/50 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 flex items-center gap-1.5">
                  <Icon name="globe" size={14} />
                  <span>Or Register Media by URL (Image, Video, or Document Link)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={externalTitle}
                    onChange={(e) => setExternalTitle(e.target.value)}
                    placeholder="Asset title (e.g. Campus Workshop Banner)"
                    className="px-3 py-2 text-xs border border-line rounded-sm bg-white"
                  />
                  <input
                    type="text"
                    value={externalAlt}
                    onChange={(e) => setExternalAlt(e.target.value)}
                    placeholder="Alt text description (for accessibility)"
                    className="px-3 py-2 text-xs border border-line rounded-sm bg-white"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://... or /images/..."
                    className="flex-1 px-3 py-2 text-xs font-mono border border-line rounded-sm bg-white"
                  />
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleAddExternalUrl}
                    className="px-4 py-2 bg-navy-900 hover:bg-navy-700 text-white text-xs font-bold rounded-sm transition-colors disabled:opacity-50"
                  >
                    Add to Library
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left: Filter Bar + Thumbnail Grid */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              {/* Filter & Search Toolbar */}
              <div className="p-4 border-b border-line flex flex-wrap items-center justify-between gap-3 bg-paper/40">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { key: "all", label: "All Media" },
                      { key: "image", label: "Photos & Banners" },
                      { key: "brand", label: "Branding & Logos" },
                      { key: "document", label: "Documents" },
                      { key: "video", label: "Videos" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setCategoryFilter(tab.key)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-colors ${
                        categoryFilter === tab.key
                          ? "bg-navy-900 text-white"
                          : "bg-white border border-line text-ink-soft hover:text-navy-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Icon
                    name="search"
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search media items..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-line rounded-sm bg-white focus:outline-hidden focus:border-navy-900"
                  />
                </div>
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center text-xs text-ink-soft">
                    Loading media library...
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-paper border border-line flex items-center justify-center text-ink-soft">
                      <Icon name="image" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-navy-900">No matching media found</p>
                      <p className="text-xs text-ink-soft mt-0.5">
                        Upload a new image or clear your search filter.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("upload")}
                      className="px-4 py-2 bg-navy-900 text-white text-xs font-bold rounded-sm"
                    >
                      Upload New Media
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                    {filteredItems.map((item) => {
                      const isSelected = selectedItem?.id === item.id;
                      const isImage =
                        item.category === "image" ||
                        item.category === "brand" ||
                        item.mimeType.startsWith("image/");

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectItem(item)}
                          className={`group relative aspect-square rounded-sm border text-left overflow-hidden transition-all flex flex-col bg-paper ${
                            isSelected
                              ? "border-navy-900 ring-2 ring-navy-900 shadow-md"
                              : "border-line hover:border-navy-900/50"
                          }`}
                        >
                          <div
                            className="flex-1 w-full flex items-center justify-center overflow-hidden relative"
                            style={{
                              backgroundColor: "#f8fafc",
                              backgroundImage:
                                "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
                              backgroundSize: "14px 14px",
                              backgroundPosition: "0 0, 0 7px, 7px -7px, -7px 0px",
                            }}
                          >
                            {isImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.url}
                                alt={item.altText || item.title}
                                className={`w-full h-full ${
                                  item.category === "brand" || item.url.endsWith(".svg")
                                    ? "object-contain p-3"
                                    : "object-cover"
                                }`}
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center gap-1.5 p-3 text-navy-900">
                                <Icon
                                  name={item.category === "video" ? "video" : "file-text"}
                                  size={28}
                                />
                                <span className="text-[10px] font-mono uppercase bg-white px-1.5 py-0.5 rounded-xs border border-line">
                                  {item.category}
                                </span>
                              </div>
                            )}

                            {isSelected && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-sm bg-navy-900 text-gold-500 flex items-center justify-center shadow-sm">
                                <Icon name="check" size={14} />
                              </div>
                            )}
                          </div>

                          <div className="px-2.5 py-1.5 bg-white border-t border-line w-full">
                            <p className="text-[11px] font-bold text-navy-900 truncate">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-ink-soft truncate">
                              {item.fileName}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: WordPress Attachment Details Inspector */}
            <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-line bg-paper p-5 overflow-y-auto flex flex-col justify-between gap-4">
              {selectedItem ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-line pb-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900">
                      Attachment Details
                    </h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-xs bg-navy-900/10 text-navy-900">
                      {selectedItem.category}
                    </span>
                  </div>

                  {/* Preview Box */}
                  <div
                    className="w-full h-40 rounded-sm border border-line flex items-center justify-center overflow-hidden p-2"
                    style={{
                      backgroundColor: "#f8fafc",
                      backgroundImage:
                        "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
                      backgroundSize: "14px 14px",
                      backgroundPosition: "0 0, 0 7px, 7px -7px, -7px 0px",
                    }}
                  >
                    {selectedItem.category === "image" ||
                    selectedItem.category === "brand" ||
                    selectedItem.mimeType.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedItem.url}
                        alt={selectedItem.altText || selectedItem.title}
                        className="max-h-full max-w-full object-contain rounded-xs"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-navy-900">
                        <Icon
                          name={selectedItem.category === "video" ? "video" : "file-text"}
                          size={32}
                        />
                        <span className="text-xs font-bold">{selectedItem.fileName}</span>
                      </div>
                    )}
                  </div>

                  {/* File Meta */}
                  <div className="text-[11px] text-ink-soft space-y-1 border-b border-line pb-3">
                    <p className="font-bold text-ink break-all">{selectedItem.fileName}</p>
                    <p>Type: {selectedItem.mimeType}</p>
                    {selectedItem.width && selectedItem.height && (
                      <p>
                        Dimensions: {selectedItem.width} × {selectedItem.height} px
                      </p>
                    )}
                    <p>
                      Added:{" "}
                      {new Date(selectedItem.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Editable Fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-900 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-line rounded-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-900 mb-1">
                        Alt Text (Accessibility)
                      </label>
                      <input
                        type="text"
                        value={editAltText}
                        onChange={(e) => setEditAltText(e.target.value)}
                        placeholder="Describe this image..."
                        className="w-full px-2.5 py-1.5 text-xs border border-line rounded-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-900 mb-1">
                        Category
                      </label>
                      <select
                        value={editCategory}
                        onChange={(e) =>
                          setEditCategory(e.target.value as MediaLibraryItem["category"])
                        }
                        className="w-full px-2.5 py-1.5 text-xs border border-line rounded-sm bg-white"
                      >
                        <option value="image">Photos & Banners</option>
                        <option value="brand">Branding & Logos</option>
                        <option value="document">Documents & PDFs</option>
                        <option value="video">Video Assets</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={handleSaveMetadata}
                        className="flex-1 px-3 py-1.5 bg-white hover:bg-navy-900 text-navy-900 hover:text-white border border-line text-xs font-bold rounded-sm transition-colors"
                      >
                        Save Details
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(selectedItem.url);
                          setCopiedId(selectedItem.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-paper border border-line text-navy-900 text-xs font-bold rounded-sm flex items-center gap-1"
                      >
                        <Icon name="copy" size={12} />
                        <span>{copiedId === selectedItem.id ? "Copied" : "Copy URL"}</span>
                      </button>
                    </div>

                    {statusNotice && (
                      <p className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-sm">
                        {statusNotice}
                      </p>
                    )}

                    <div className="pt-2 border-t border-line flex items-center justify-between">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={handleDeleteSelected}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                      >
                        <Icon name="trash" size={12} />
                        <span>Delete Permanently</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-ink-soft text-center my-auto">
                  Select a media item to inspect or edit its details.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Action Bar */}
        <div className="px-6 py-3.5 border-t border-line bg-paper flex items-center justify-between gap-4">
          <div className="text-xs text-ink-soft truncate">
            {selectedItem ? (
              <span>
                Selected: <strong className="text-navy-900">{selectedItem.title}</strong>
              </span>
            ) : (
              <span>No media item selected</span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-ink-soft hover:text-navy-900 border border-line rounded-sm bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedItem}
              onClick={() => {
                if (selectedItem) {
                  onSelect(selectedItem);
                  onClose();
                }
              }}
              className="px-5 py-2 bg-navy-900 hover:bg-navy-700 text-white text-xs font-bold rounded-sm shadow-xs transition-colors disabled:opacity-40 flex items-center gap-1.5"
            >
              <Icon name="check" size={14} />
              <span>Insert Selected Media</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

