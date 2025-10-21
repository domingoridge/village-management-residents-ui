/**
 * useFileUpload Hook
 *
 * Manages file uploads to Supabase Storage with progress tracking.
 */

import { useState } from "react";
import { uploadDocument, deleteDocument } from "@/lib/services/fileService";
import type { DocumentType } from "@/constants/fileFormats";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface UploadProgress {
  fileId: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
}

interface UseFileUploadReturn {
  uploadedFiles: UploadedFile[];
  uploadProgress: Record<string, UploadProgress>;
  isUploading: boolean;
  uploadFile: (file: File, documentType: DocumentType) => Promise<UploadedFile>;
  removeFile: (fileId: string) => Promise<void>;
  clearFiles: () => void;
}

/**
 * Hook for managing file uploads with progress tracking
 *
 * @example
 * ```tsx
 * const { uploadedFiles, uploadFile, removeFile, uploadProgress } = useFileUpload();
 *
 * const handleUpload = async (file: File) => {
 *   try {
 *     const uploaded = await uploadFile(file, 'building_plans');
 *     console.log('Uploaded:', uploaded);
 *   } catch (error) {
 *     console.error('Upload failed:', error);
 *   }
 * };
 * ```
 */
export function useFileUpload(): UseFileUploadReturn {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<
    Record<string, UploadProgress>
  >({});

  // Check if any file is currently uploading
  const isUploading = Object.values(uploadProgress).some(
    (progress) => progress.status === "uploading",
  );

  /**
   * Upload a file to Supabase Storage
   */
  const uploadFile = async (
    file: File,
    documentType: DocumentType,
  ): Promise<UploadedFile> => {
    const fileId = `${Date.now()}-${file.name}`;

    try {
      // Set initial progress
      setUploadProgress((prev) => ({
        ...prev,
        [fileId]: {
          fileId,
          progress: 0,
          status: "uploading",
        },
      }));

      // Simulate progress updates (Supabase doesn't provide native progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const current = prev[fileId];
          if (!current || current.status !== "uploading") {
            clearInterval(progressInterval);
            return prev;
          }
          // Increment progress up to 90% (final 10% when upload completes)
          const newProgress = Math.min(current.progress + 10, 90);
          return {
            ...prev,
            [fileId]: {
              ...current,
              progress: newProgress,
            },
          };
        });
      }, 200);

      // Upload to Supabase Storage
      const uploadedFile = await uploadDocument(file, documentType);

      // Clear progress interval
      clearInterval(progressInterval);

      // Update progress to 100%
      setUploadProgress((prev) => ({
        ...prev,
        [fileId]: {
          fileId,
          progress: 100,
          status: "completed",
        },
      }));

      // Add to uploaded files list
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: uploadedFile.url,
        uploadedAt: new Date().toISOString(),
      };

      setUploadedFiles((prev) => [...prev, newFile]);

      // Remove progress after 2 seconds
      setTimeout(() => {
        setUploadProgress((prev) => {
          const updated = { ...prev };
          delete updated[fileId];
          return updated;
        });
      }, 2000);

      return newFile;
    } catch (error) {
      // Set error status
      setUploadProgress((prev) => ({
        ...prev,
        [fileId]: {
          fileId,
          progress: 0,
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
        },
      }));

      throw error;
    }
  };

  /**
   * Remove an uploaded file
   */
  const removeFile = async (fileId: string): Promise<void> => {
    const file = uploadedFiles.find((f) => f.id === fileId);
    if (!file) {
      throw new Error("File not found");
    }

    try {
      // Delete from Supabase Storage
      await deleteDocument(file.url);

      // Remove from uploaded files list
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));

      // Remove progress if exists
      setUploadProgress((prev) => {
        const updated = { ...prev };
        delete updated[fileId];
        return updated;
      });
    } catch (error) {
      console.error("Error removing file:", error);
      throw error;
    }
  };

  /**
   * Clear all uploaded files
   */
  const clearFiles = () => {
    setUploadedFiles([]);
    setUploadProgress({});
  };

  return {
    uploadedFiles,
    uploadProgress,
    isUploading,
    uploadFile,
    removeFile,
    clearFiles,
  };
}
