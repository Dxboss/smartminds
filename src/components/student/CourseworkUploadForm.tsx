"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { uploadCourseworkAction } from "@/app/student/assignments/actions";

interface Props {
  assignmentId: string;
  unitCode: string;
  existingFileName?: string;
  isMarked?: boolean;
}

export const CourseworkUploadForm: React.FC<Props> = ({
  assignmentId,
  unitCode,
  existingFileName,
  isMarked,
}) => {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      setSelectedFileSize(file.size);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFileName) {
      setError("Please select a coursework document to upload.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await uploadCourseworkAction({
        assignmentId,
        unitCode,
        fileName: selectedFileName,
        fileSizeBytes: selectedFileSize || 350000,
      });
      setUploadSuccess(true);
      setIsSubmitting(false);
    } catch {
      setError("Failed to record submission metadata in demo. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isMarked) {
    return (
      <div className="p-4 rounded-sm bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
        <div className="flex items-center gap-2 font-bold">
          <Icon name="check-circle" size={16} className="text-emerald-700" />
          <span>Coursework Marked & Finalized</span>
        </div>
        <p>
          This assignment has been evaluated by your tutor. Further uploads are closed unless requested by your instructor.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {uploadSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-sm text-xs text-emerald-900 flex items-center gap-2">
          <Icon name="check-circle" size={16} className="text-emerald-700 flex-shrink-0" />
          <span>Coursework successfully submitted for tutor evaluation! Metadata recorded in demo.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-sm text-xs text-red-800 flex items-center gap-2">
          <Icon name="alert-circle" size={16} className="text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="border-2 border-dashed border-line hover:border-navy-900 rounded-sm p-6 text-center bg-paper transition-colors">
        <Icon name="file-text" size={32} className="mx-auto text-navy-900/60 mb-2" />
        <label
          htmlFor="file-upload"
          className="cursor-pointer block space-y-1"
        >
          <span className="text-sm font-bold text-navy-900 underline">
            {selectedFileName || existingFileName || "Choose document to upload"}
          </span>
          <p className="text-xs text-ink-soft">
            PDF, DOCX, or RTF up to 15MB (Stores metadata only in demo prototype)
          </p>
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".pdf,.doc,.docx,.rtf"
          onChange={handleFileChange}
          className="hidden"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[11px] text-ink-soft">
          Ensure your name and unit code are clearly stated on the title page.
        </p>
        <button
          type="submit"
          disabled={isSubmitting || !selectedFileName}
          className="px-5 py-2.5 rounded-sm bg-navy-900 text-white text-xs font-bold hover:bg-navy-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm min-h-[44px]"
        >
          {isSubmitting ? "Uploading..." : "Submit coursework"}
        </button>
      </div>
    </form>
  );
};
