"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  sizeBytes: number;
  category: "photography" | "logos" | "uploads";
  createdAt: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentValue?: string;
  title?: string;
}

export const MediaLibraryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelect,
  currentValue,
  title = "College Media Library",
}) => {
  const [assets, setAssets] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | "photography" | "logos" | "uploads">("all");
  const [selectedUrl, setSelectedUrl] = useState<string>(currentValue || "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        if (data.assets && Array.isArray(data.assets)) {
          setAssets(data.assets);
        }
      }
    } catch (err) {
      console.error("Failed to load media assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedUrl(currentValue || "");
      fetchAssets();
    }
  }, [isOpen, currentValue]);

  if (!isOpen) return null;

  const handleUploadFile = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Upload failed");
      }

      const data = await res.json();
      if (data.asset) {
        setAssets((prev) => [data.asset, ...prev]);
        setSelectedUrl(data.asset.url);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.url.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === "all" || asset.category === category;
    return matchesSearch && matchesCat;
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const selectedAsset = assets.find((a) => a.url === selectedUrl);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 sm:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-line flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-line bg-paper flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy-900 text-gold-500 flex items-center justify-center shadow-xs">
              <Icon name="image" size={20} />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-lg sm:text-xl text-navy-900 leading-tight">
                {title}
              </h2>
              <p className="text-xs text-ink-soft">
                Upload college photos, logos, or select existing media assets.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full text-ink-soft hover:text-navy-900 hover:bg-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Media Library"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Toolbar: Category tabs, Search, Upload Button */}
        <div className="p-4 border-b border-line bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-paper rounded-xl border border-line overflow-x-auto">
            {[
              { id: "all", label: "All Assets" },
              { id: "photography", label: "College Photos" },
              { id: "logos", label: "Logos & Crests" },
              { id: "uploads", label: "Uploaded" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  category === cat.id
                    ? "bg-navy-900 text-white shadow-xs"
                    : "text-ink-soft hover:text-navy-900"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search & Upload Action */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search photos & logos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-line bg-paper/50 focus:bg-white focus:border-navy-900 focus:outline-hidden"
              />
              <Icon name="search" size={14} className="absolute left-3 top-2.5 text-ink-soft" />
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF5722] hover:bg-[#e64a19] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Icon name="upload" size={14} />
              <span>{isUploading ? "Uploading..." : "Upload Photo"}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(e) => e.target.files?.[0] && handleUploadFile(e.target.files[0])}
              className="hidden"
            />
          </div>
        </div>

        {/* Drag & Drop Upload Strip */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`mx-4 mt-3 p-3 rounded-xl border-2 border-dashed text-center transition-all cursor-pointer ${
            isDragging
              ? "border-[#FF5722] bg-orange-50/70"
              : "border-line bg-paper/40 hover:bg-paper"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex items-center justify-center gap-2 text-xs text-ink-soft">
            <Icon name="upload" size={16} className={isDragging ? "text-[#FF5722]" : "text-ink-soft"} />
            <span className="font-semibold text-navy-900">Drag & drop any photo from your computer here</span>
            <span className="hidden sm:inline">&mdash; JPG, PNG, WebP, SVG</span>
          </div>
        </div>

        {uploadError && (
          <div className="mx-4 mt-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
            <span>{uploadError}</span>
            <button type="button" onClick={() => setUploadError(null)} className="text-red-500 hover:text-red-800">
              <Icon name="x" size={14} />
            </button>
          </div>
        )}

        {/* Body: Thumbnail Grid & Sidebar Details */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {loading ? (
            <div className="py-20 text-center text-xs text-ink-soft flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-navy-900 border-t-transparent animate-spin" />
              <span>Loading media repository...</span>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="py-16 text-center text-ink-soft">
              <Icon name="image" size={36} className="mx-auto mb-2 text-line" />
              <p className="text-sm font-semibold text-navy-900">No media assets found</p>
              <p className="text-xs mt-1">Upload a photo from your computer or adjust your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {filteredAssets.map((asset) => {
                const isSelected = selectedUrl === asset.url;
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setSelectedUrl(asset.url)}
                    className={`group relative rounded-xl border-2 overflow-hidden text-left transition-all cursor-pointer flex flex-col bg-white ${
                      isSelected
                        ? "border-[#FF5722] ring-2 ring-[#FF5722]/30 shadow-md"
                        : "border-line hover:border-navy-900/40 hover:shadow-sm"
                    }`}
                  >
                    {/* Thumbnail Container */}
                    <div className="relative w-full aspect-[4/3] bg-paper overflow-hidden flex items-center justify-center">
                      <Image
                        src={asset.url}
                        alt={asset.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#FF5722] text-white flex items-center justify-center shadow-xs">
                          <Icon name="check" size={14} />
                        </div>
                      )}
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-2.5 bg-white border-t border-line/60">
                      <p className="text-xs font-bold text-navy-900 truncate">{asset.name}</p>
                      <div className="flex items-center justify-between text-[10px] text-ink-soft mt-0.5">
                        <span className="uppercase">{asset.category}</span>
                        <span>{formatSize(asset.sizeBytes)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-line bg-paper flex items-center justify-between">
          <div className="text-xs text-ink-soft truncate max-w-md hidden sm:block">
            {selectedAsset ? (
              <span>
                Selected: <strong className="text-navy-900">{selectedAsset.name}</strong> ({selectedAsset.url})
              </span>
            ) : (
              <span>Select an image from the gallery or upload a new photo.</span>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-line bg-white hover:bg-paper text-ink-soft font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedUrl}
              onClick={() => {
                if (selectedUrl) {
                  onSelect(selectedUrl);
                  onClose();
                }
              }}
              className="px-6 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Insert Selected Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
