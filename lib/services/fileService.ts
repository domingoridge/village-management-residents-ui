/**
 * File Service
 *
 * Service for uploading and managing documents in Supabase Storage.
 */

import { createClient } from "@/lib/supabase/browser";
import type { DocumentType } from "@/constants/fileFormats";

const STORAGE_BUCKET = "permit-documents";

export interface UploadDocumentResult {
  url: string;
  path: string;
  name: string;
  size: number;
}

/**
 * Upload a document to Supabase Storage
 */
export async function uploadDocument(
  file: File,
  documentType: DocumentType,
): Promise<UploadDocumentResult> {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User not authenticated");
  }

  // Generate unique file path: userId/documentType/timestamp-filename
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${user.id}/${documentType}/${timestamp}-${sanitizedFileName}`;

  try {
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading file:", error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path,
      name: file.name,
      size: file.size,
    };
  } catch (error) {
    console.error("Error in uploadDocument:", error);
    throw error instanceof Error ? error : new Error("Upload failed");
  }
}

/**
 * Delete a document from Supabase Storage
 */
export async function deleteDocument(urlOrPath: string): Promise<void> {
  const supabase = createClient();

  // Extract path from URL if a full URL is provided
  let filePath = urlOrPath;
  if (urlOrPath.includes(STORAGE_BUCKET)) {
    const parts = urlOrPath.split(`${STORAGE_BUCKET}/`);
    filePath = parts[1] || urlOrPath;
  }

  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error("Error deleting file:", error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in deleteDocument:", error);
    throw error instanceof Error ? error : new Error("Delete failed");
  }
}

/**
 * Get a signed URL for a private document
 * (useful if you need temporary access to a private file)
 */
export async function getSignedUrl(
  filePath: string,
  expiresIn = 3600,
): Promise<string> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error("Error creating signed URL:", error);
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Error in getSignedUrl:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to get signed URL");
  }
}

/**
 * List all documents for a specific user and document type
 */
export async function listDocuments(
  documentType?: DocumentType,
): Promise<string[]> {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User not authenticated");
  }

  try {
    const path = documentType ? `${user.id}/${documentType}` : user.id;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(path);

    if (error) {
      console.error("Error listing files:", error);
      throw new Error(`Failed to list files: ${error.message}`);
    }

    return data.map((file) => file.name);
  } catch (error) {
    console.error("Error in listDocuments:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to list documents");
  }
}
