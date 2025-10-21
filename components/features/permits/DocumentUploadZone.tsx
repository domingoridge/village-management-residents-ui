/**
 * DocumentUploadZone Component
 *
 * File upload zone for permit documents with drag-and-drop support,
 * file validation, and visual feedback.
 */

"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { useFileUpload, type UploadedFile } from "@/lib/hooks/useFileUpload";
import {
  validateFile,
  type FileValidationResult,
} from "@/lib/utils/fileValidation";
import {
  ALLOWED_FILE_FORMATS,
  type DocumentType,
} from "@/constants/fileFormats";
import { Trash2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DocumentUploadZoneProps {
  documentType: DocumentType;
  label: string;
  description?: string;
  required?: boolean;
  multiple?: boolean;
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  error?: string;
}

/**
 * DocumentUploadZone Component
 *
 * Provides file upload functionality with visual feedback for different document types.
 *
 * @example
 * ```tsx
 * <DocumentUploadZone
 *   documentType="building_plans"
 *   label="Building Plans"
 *   description="Upload architectural plans in JPG, PNG, or DWG format"
 *   required
 *   multiple
 *   onChange={(files) => console.log(files)}
 * />
 * ```
 */
export function DocumentUploadZone({
  documentType,
  label,
  description,
  required = false,
  multiple = true,
  value = [],
  onChange,
  error,
}: DocumentUploadZoneProps) {
  const { uploadFile, removeFile, uploadProgress } = useFileUpload();
  const [validationError, setValidationError] = useState<string | undefined>();
  const [files, setFiles] = useState<UploadedFile[]>(value);

  const formatConfig = ALLOWED_FILE_FORMATS[documentType];

  /**
   * Handle file selection
   */
  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setValidationError(undefined);

    // Convert FileList to array
    const fileArray = Array.from(selectedFiles);

    // Validate each file
    for (const file of fileArray) {
      const validation: FileValidationResult = validateFile(file, documentType);

      if (!validation.valid) {
        setValidationError(validation.error);
        return;
      }

      try {
        // Upload file
        const uploadedFile = await uploadFile(file, documentType);

        // Update files list
        const newFiles = multiple ? [...files, uploadedFile] : [uploadedFile];
        setFiles(newFiles);
        onChange?.(newFiles);
      } catch (err) {
        console.error("Upload error:", err);
        setValidationError(
          err instanceof Error ? err.message : "Failed to upload file",
        );
      }
    }
  };

  /**
   * Handle file removal
   */
  const handleRemoveFile = async (fileId: string) => {
    try {
      await removeFile(fileId);

      const newFiles = files.filter((f) => f.id !== fileId);
      setFiles(newFiles);
      onChange?.(newFiles);
    } catch (err) {
      console.error("Remove error:", err);
      setValidationError(
        err instanceof Error ? err.message : "Failed to remove file",
      );
    }
  };

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const displayError = error || validationError;
  const hasUploading = Object.values(uploadProgress).some(
    (p) => p.status === "uploading",
  );

  return (
    <div
      className="space-y-3"
      data-testid={`document-upload-zone-${documentType}`}
    >
      {/* Label and Description */}
      <div>
        <label className="text-sm font-medium text-neutral">
          {label}
          {required && <span className="ml-1 text-error-500">*</span>}
        </label>
        {description && (
          <p className="mt-1 text-sm text-neutral/70">{description}</p>
        )}
        <p className="mt-1 text-xs text-neutral/60">
          Accepted formats: {formatConfig.allowedFormats.join(", ")} • Max size:{" "}
          {formatFileSize(formatConfig.maxSize)}
        </p>
      </div>

      {/* File Upload Zone */}
      {(multiple || files.length === 0) && (
        <FileUpload
          name={`document-${documentType}`}
          accept={formatConfig.allowedMimeTypes.join(",")}
          maxSize={formatConfig.maxSize}
          multiple={multiple}
          onChange={(selectedFiles) => {
            if (selectedFiles instanceof FileList) {
              handleFileSelect(selectedFiles);
            }
          }}
          error={displayError}
          disabled={hasUploading}
          data-testid={`upload-zone-${documentType}`}
        />
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div
          className="space-y-2"
          data-testid={`uploaded-files-${documentType}`}
        >
          {files.map((file) => {
            const progress = uploadProgress[file.id];
            const isUploading = progress?.status === "uploading";
            const hasError = progress?.status === "error";

            return (
              <div
                key={file.id}
                className="flex items-center gap-3 rounded-lg border-2 border-neutral/10 bg-white p-3 transition-colors hover:border-neutral/20"
                data-testid={`uploaded-file-${file.id}`}
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {isUploading && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                  )}
                  {!isUploading && !hasError && (
                    <CheckCircle className="h-5 w-5 text-success-500" />
                  )}
                  {hasError && (
                    <AlertCircle className="h-5 w-5 text-error-500" />
                  )}
                </div>

                {/* File Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral">
                    {file.name}
                  </p>
                  <p className="text-xs text-neutral/70">
                    {formatFileSize(file.size)}
                    {isUploading && progress && ` • ${progress.progress}%`}
                    {hasError && progress?.error && ` • ${progress.error}`}
                  </p>

                  {/* Progress Bar */}
                  {isUploading && progress && (
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-neutral/10">
                      <div
                        className="h-full bg-primary-500 transition-all duration-300"
                        style={{ width: `${progress.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(file.id)}
                    disabled={hasUploading}
                    data-testid={`remove-file-${file.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-error-500" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
