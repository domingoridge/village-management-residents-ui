"use client";

import { useRef, useState } from "react";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DocumentUploadFieldProps {
  label: string;
  name: string;
  required?: boolean;
  acceptedTypes: readonly string[];
  maxSize: number;
  value?: File;
  onChange: (file: File | undefined) => void;
  error?: string;
  disabled?: boolean;
}

export function DocumentUploadField({
  label,
  name,
  required = false,
  acceptedTypes,
  maxSize,
  value,
  onChange,
  error,
  disabled = false,
}: DocumentUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      onChange(undefined);
      setPreview(null);
      return;
    }

    // Generate preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    onChange(file);
  };

  const handleRemove = () => {
    onChange(undefined);
    setPreview(null);
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
    return acceptedTypes
      .map((type) => type.split("/")[1].toUpperCase())
      .join(", ");
  };

  return (
    <div className="w-full">
      <label htmlFor={name} className="label">
        <span className="label-text font-medium">
          {label}
          {required && <span className="ml-1 text-error">*</span>}
        </span>
      </label>

      <div
        className={`rounded-lg border-2 border-dashed p-6 transition-colors ${
          error
            ? "border-error bg-error/5"
            : value
              ? "border-success bg-success/5"
              : "border-base-300 bg-base-200 hover:border-primary"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          id={name}
          name={name}
          accept={acceptedTypes.join(",")}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
          aria-describedby={`${name}-requirements ${error ? `${name}-error` : ""}`}
          aria-invalid={!!error}
          aria-required={required}
        />

        {value ? (
          <div className="space-y-3">
            {preview ? (
              <div className="flex justify-center">
                <img
                  src={preview}
                  alt={`Preview of ${label}`}
                  className="h-32 w-auto rounded-lg object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <FileText className="h-16 w-16 text-base-content/50" />
              </div>
            )}

            <div className="text-center">
              <p className="font-medium text-base-content">{value.name}</p>
              <p className="text-sm text-base-content/70">
                {formatFileSize(value.size)}
              </p>
            </div>

            <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClick}
                disabled={disabled}
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={disabled}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className="w-full text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <Upload className="h-8 w-8 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium text-base-content">
                  Click to upload {label}
                </p>
                <p
                  id={`${name}-requirements`}
                  className="mt-1 text-sm text-base-content/70"
                >
                  {getAcceptedFormats()} • Max {maxSize / (1024 * 1024)}MB
                </p>
              </div>
            </div>
          </button>
        )}
      </div>

      {error && (
        <p
          id={`${name}-error`}
          className="mt-2 text-sm text-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
