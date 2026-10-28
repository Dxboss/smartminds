"use client";

import React, { useState, useRef, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import type { MediaLibraryItem } from "@/lib/persistedData";
import { compressBrowserImageFile } from "@/components/ui/MediaLibraryModal";
import {
  saveMediaLibraryItemAction,
  deleteMediaLibraryItemAction,
} from "@/app/admin/actions";

interface MediaLibraryViewProps {
  initialItems: MediaLibraryItem[];
}

export function MediaLibraryView({ initialItems }: MediaLibraryViewProps) {
  const [items, setItems] = useState<MediaLibraryItem[]>(initialItems);
  const [selectedItem, setSelectedItem] = useState<MediaLibraryItem | null>(
    initialItems[0] || null
  );
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "image" | "brand" | "document" | "video"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Editable attachment details
  const [editTitle, setEditTitle] = useState(initialItems[0]?.title || "");
  const [editAltText, setEditAltText] = useState(initialItems[0]?.altText || "");
  const [editCaption, setEditCaption] = useState(initialItems[0]?.caption || "");
  const [editCategory, setEditCategory] = useState<MediaLibraryItem["category"]>(
    initialItems[0]?.category || "image"
  );

  // External URL registration
  const [externalUrl, setExternalUrl] = useState("");
  const [externalTitle, setExternalTitle] = useState("");
  const [externalAlt, setExternalAlt] = useState("");

  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectItem = (item: MediaLibraryItem) => {
    setSelectedItem(item);
    setEditTitle(item.title || "");
    setEditAltText(item.altText || "");
    setEditCaption(item.caption || "");
    setEditCategory(item.category || "image");
    setStatusNotice(null);
  };

  const handleFilesUpload = async (fileList: FileList | File[]) => {
    setUploadError(null);
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setIsUploading(true);
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
        setShowUploadPanel(false);
        setStatusNotice("Media uploaded and saved to cloud library.");
      }
    } catch {
      setUploadError("Failed to upload file. Please try another file.");
    } finally {
      setIsUploading(false);
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
        if (res.item) handleSelectItem(res.item);
        setExternalUrl("");
        setExternalTitle("");
        setExternalAlt("");
        setShowUploadPanel(false);
        setStatusNotice("External media registered in library.");
      } else {
        setUploadError(res.error || "Failed to add external media.");
      }
    });
  };

  const handleSaveDetails = () => {
    if (!selectedItem) return;
    startTransition(async () => {
      const res = await saveMediaLibraryItemAction({
        id: selectedItem.id,
        url: selectedItem.url,
        fileName: selectedItem.fileName,
        title: editTitle.trim() || selectedItem.title,
        altText: editAltText.trim(),
        caption: editCaption.trim(),
        category: editCategory,
      });
      if (res.success && res.items && res.item) {
        setItems(res.items);
        setSelectedItem(res.item);
        setStatusNotice("Attachment details updated.");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteMediaLibraryItemAction(id);
      if (res.success && res.items) {
        setItems(res.items);
        if (selectedItem?.id === id) {
          const next = res.items[0] || null;
          setSelectedItem(next);
          if (next) {
            setEditTitle(next.title);
            setEditAltText(next.altText || "");
            setEditCaption(next.caption || "");
            setEditCategory(next.category || "image");
          }
        }
        setStatusNotice("Asset removed from Media Library.");
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

  const counts = {
    all: items.length,
    image: items.filter((i) => i.category === "image").length,
    brand: items.filter((i) => i.category === "brand").length,
    document: items.filter((i) => i.category === "document").length,
    video: items.filter((i) => i.category === "video").length,
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-navy-900 tracking-tight">
            Media library
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Central repository for college photos, logos, banners, documents, and video links used across CMS pages, courses, and blog articles.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowUploadPanel((prev) => !prev)}
          className="px-5 py-2.5 bg-navy-900 hover:bg-navy-700 text-white text-xs font-bold rounded-sm shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Icon name={showUploadPanel ? "x" : "upload"} size={15} />
          <span>{showUploadPanel ? "Close Uploader" : "Add New Media File"}</span>
        </button>
      </div>

      {/* Collapsible WordPress-style Dropzone Drawer */}
      {showUploadPanel && (
        <div className="bg-white border border-line rounded-lg p-6 shadow-xs space-y-5">
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
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
              isDragging
                ? "border-gold-500 bg-gold-300/15"
                : "border-line hover:border-navy-900 bg-paper/60 hover:bg-paper"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-navy-900 text-gold-500 flex items-center justify-center">
              <Icon name="upload" size={20} />
            </div>
            <div>
              <p className="font-heading text-lg font-bold text-navy-900">
                {isUploading ? "Uploading & optimizing media..." : "Drop files here to upload"}
              </p>
              <p className="text-xs text-ink-soft mt-0.5">
                Supports JPG, PNG, WebP, SVG, and PDF files (automatically persisted to cloud database)
              </p>
            </div>
            <span className="mt-1 px-4 py-2 bg-navy-900 text-white text-xs font-bold rounded-sm">
              Select Files
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

          {/* Add by URL */}
          <div className="border-t border-line pt-4 flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div className="flex-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-900 mb-1">
                Register External Image / Video / Document URL
              </label>
              <input
                type="text"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://... or /images/..."
                className="w-full px-3 py-2 text-xs font-mono border border-line rounded-sm bg-white"
              />
            </div>
            <div className="sm:w-56">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-900 mb-1">
                Asset Title
              </label>
              <input
                type="text"
                value={externalTitle}
                onChange={(e) => setExternalTitle(e.target.value)}
                placeholder="e.g. Campus Lab Photo"
                className="w-full px-3 py-2 text-xs border border-line rounded-sm bg-white"
              />
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={handleAddExternalUrl}
              className="px-4 py-2 bg-navy-900 hover:bg-navy-700 text-white text-xs font-bold rounded-sm transition-colors"
            >
              Add URL to Library
            </button>
          </div>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-line rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { key: "all", label: `All Media (${counts.all})` },
              { key: "image", label: `Photos & Banners (${counts.image})` },
              { key: "brand", label: `Branding & Logos (${counts.brand})` },
              { key: "document", label: `Documents (${counts.document})` },
              { key: "video", label: `Videos (${counts.video})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setCategoryFilter(tab.key)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-sm transition-colors ${
                categoryFilter === tab.key
                  ? "bg-navy-900 text-white"
                  : "bg-paper border border-line text-ink-soft hover:text-navy-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Icon
            name="search"
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, filename, or alt text..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-line rounded-sm bg-paper/50 focus:bg-white focus:outline-hidden focus:border-navy-900"
          />
        </div>
      </div>

      {/* Main Split View: Media Grid + Attachment Details Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Media Thumbnail Grid */}
        <div className="lg:col-span-8 bg-white border border-line rounded-lg p-5 shadow-2xs">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-paper border border-line mx-auto flex items-center justify-center text-ink-soft">
                <Icon name="image" size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-navy-900">No media items match your filter</p>
                <p className="text-xs text-ink-soft mt-0.5">
                  Try clearing your search or upload a new file.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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

                    <div className="px-2.5 py-2 bg-white border-t border-line w-full">
                      <p className="text-xs font-bold text-navy-900 truncate">{item.title}</p>
                      <p className="text-[10px] text-ink-soft truncate">{item.fileName}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Attachment Details Inspector */}
        <div className="lg:col-span-4 bg-white border border-line rounded-lg p-5 shadow-2xs space-y-4 sticky top-6">
          {selectedItem ? (
            <>
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h2 className="font-heading text-lg font-bold text-navy-900">
                  Attachment details
                </h2>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-xs bg-navy-900/10 text-navy-900">
                  {selectedItem.category}
                </span>
              </div>

              <div
                className="w-full h-48 rounded-sm border border-line flex items-center justify-center overflow-hidden p-3"
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
                      size={36}
                    />
                    <span className="text-xs font-bold">{selectedItem.fileName}</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-ink-soft space-y-1 border-b border-line pb-3">
                <p className="font-bold text-ink break-all">{selectedItem.fileName}</p>
                <p>MIME Type: {selectedItem.mimeType}</p>
                {selectedItem.width && selectedItem.height && (
                  <p>
                    Dimensions: {selectedItem.width} × {selectedItem.height} px
                  </p>
                )}
                <p>
                  Uploaded:{" "}
                  {new Date(selectedItem.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-900 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-line rounded-sm bg-paper/40 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-900 mb-1">
                    Alt Text (Screen Readers & SEO)
                  </label>
                  <input
                    type="text"
                    value={editAltText}
                    onChange={(e) => setEditAltText(e.target.value)}
                    placeholder="Describe the image for accessibility..."
                    className="w-full px-3 py-1.5 text-xs border border-line rounded-sm bg-paper/40 focus:bg-white"
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
                    className="w-full px-3 py-1.5 text-xs border border-line rounded-sm bg-paper/40 focus:bg-white"
                  >
                    <option value="image">Photos & Banners</option>
                    <option value="brand">Branding & Logos</option>
                    <option value="document">Documents & PDFs</option>
                    <option value="video">Video Assets</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-900 mb-1">
                    Caption / Notes
                  </label>
                  <textarea
                    rows={2}
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    placeholder="Optional caption or usage notes..."
                    className="w-full px-3 py-1.5 text-xs border border-line rounded-sm bg-paper/40 focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleSaveDetails}
                    className="flex-1 px-4 py-2 bg-navy-900 hover:bg-navy-700 text-white text-xs font-bold rounded-sm transition-colors"
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
                    className="px-3 py-2 bg-paper hover:bg-line/50 border border-line text-navy-900 text-xs font-bold rounded-sm flex items-center gap-1.5"
                  >
                    <Icon name="copy" size={13} />
                    <span>{copiedId === selectedItem.id ? "Copied!" : "Copy URL"}</span>
                  </button>
                </div>

                {statusNotice && (
                  <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-sm">
                    {statusNotice}
                  </p>
                )}

                <div className="pt-3 border-t border-line flex items-center justify-between">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDelete(selectedItem.id)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5"
                  >
                    <Icon name="trash" size={13} />
                    <span>Delete Permanently</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-xs text-ink-soft">
              Click any media asset on the left to inspect its preview, edit alt text, copy its URL, or delete it.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

