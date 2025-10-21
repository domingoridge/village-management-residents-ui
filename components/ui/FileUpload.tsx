"use client";

import { useRef, useState } from "react";
import { Upload, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";

export interface FileUploadProps {
  label: string;
  name: string;
  required?: boolean;
  accept?: string;
  acceptedFormats?: string[];
  maxSize?: number;
  multiple?: boolean;
  value?: File | File[];
  onChange: (files: File | File[] | undefined) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  label,
  name,
  required = false,
  accept,
  acceptedFormats = [],
  maxSize,
  multiple = false,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const files = multiple
    ? Array.isArray(value)
      ? value
      : value
        ? [value]
        : []
    : value
      ? [value as File]
      : [];

  const handleFileChange = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      onChange(undefined);
      setPreview(null);
      return;
    }

    const fileArray = Array.from(selectedFiles);
    const newFiles = multiple ? fileArray : fileArray[0];

    // Generate preview for single image
    if (!multiple && fileArray[0]?.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(fileArray[0]);
    } else {
      setPreview(null);
    }

    onChange(newFiles);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    handleFileChange(droppedFiles);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleRemove = (indexToRemove?: number) => {
    if (multiple && indexToRemove !== undefined) {
      const newFiles = files.filter((_, index) => index !== indexToRemove);
      onChange(newFiles.length > 0 ? newFiles : undefined);
    } else {
      onChange(undefined);
      setPreview(null);
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getAcceptedFormats = () => {
    if (acceptedFormats.length > 0) {
      return acceptedFormats.join(", ");
    }
    return "All files";
  };

  const getHelperText = () => {
    const parts = [];
    if (acceptedFormats.length > 0) {
      parts.push(getAcceptedFormats());
    }
    if (maxSize) {
      parts.push(`Max ${formatFileSize(maxSize)}`);
    }
    return parts.join(" • ");
  };

  const inputId = `${name}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn("w-full", className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-neutral">
        {label}
        {required && <span className="ml-1 text-error-500">*</span>}
      </label>

      <div
        className={cn(
          "mt-1 rounded-lg border-2 border-dashed p-6 transition-colors",
          dragActive && !disabled && "border-primary-500 bg-primary-500/5",
          error
            ? "border-error-500 bg-error-500/5"
            : files.length > 0
              ? "border-success-500 bg-success-500/5"
              : "border-neutral/20 bg-neutral/5 hover:border-primary-500/50",
          disabled && "cursor-not-allowed opacity-50",
        )}
        onDrop={handleDrop}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
      >
        <input
          ref={inputRef}
          type="file"
          id={inputId}
          name={name}
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileChange(e.target.files)}
          disabled={disabled}
          className="hidden"
          aria-describedby={`${inputId}-helper ${error ? `${inputId}-error` : ""}`}
          aria-invalid={!!error}
          aria-required={required}
          data-testid={`file-upload-${name}`}
        />

        {files.length > 0 ? (
          <div className="space-y-3">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded-lg border border-neutral/20 bg-white p-3"
              >
                <div className="flex items-center gap-3">
                  {file.type.startsWith("image/") && preview && !multiple ? (
                    <img
                      src={preview}
                      alt={`Preview of ${file.name}`}
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-neutral/10">
                      <FileText className="h-6 w-6 text-neutral/50" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-neutral">
                      {file.name}
                    </p>
                    <p className="text-xs text-neutral/70">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                  className="gap-2"
                  data-testid={`remove-file-${index}`}
                >
                  <X className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            ))}
            {multiple && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClick}
                disabled={disabled}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Add More Files
              </Button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className="w-full text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-primary-500/10 p-3">
                <Upload
                  className="h-8 w-8 text-primary-500"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="font-medium text-neutral">
                  {dragActive
                    ? "Drop files here"
                    : `Click to upload or drag and drop`}
                </p>
                {helperText || getHelperText() ? (
                  <p
                    id={`${inputId}-helper`}
                    className="mt-1 text-sm text-neutral/70"
                  >
                    {helperText || getHelperText()}
                  </p>
                ) : null}
              </div>
            </div>
          </button>
        )}
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-2 text-sm text-error-500"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
