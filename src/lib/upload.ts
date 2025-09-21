import { NextRequest } from "next/server";
import { uploadFromBuffer } from "@/lib/cloudinary";
import { UploadApiResponse } from "cloudinary";

export interface FileUploadResult {
  success: boolean;
  data?: UploadApiResponse;
  error?: string;
}

export interface FileData {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
}

/**
 * Extract file data from FormData
 */
export async function extractFileFromFormData(
  formData: FormData,
  fieldName: string = "file"
): Promise<FileData | null> {
  const file = formData.get(fieldName) as File;

  if (!file || file.size === 0) {
    return null;
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return {
    buffer,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
  };
}

/**
 * Extract multiple files from FormData
 */
export async function extractMultipleFilesFromFormData(
  formData: FormData,
  fieldName: string = "files"
): Promise<FileData[]> {
  const files = formData.getAll(fieldName) as File[];
  const fileDataPromises = files.map(async (file) => {
    if (!file || file.size === 0) return null;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      buffer,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
    };
  });

  const fileDataArray = await Promise.all(fileDataPromises);
  return fileDataArray.filter((fileData) => fileData !== null) as FileData[];
}

/**
 * Validate file type
 */
export function validateFileType(
  mimeType: string,
  allowedTypes: string[] = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ]
): boolean {
  return allowedTypes.includes(mimeType);
}

/**
 * Validate file size
 */
export function validateFileSize(
  size: number,
  maxSize: number = 10 * 1024 * 1024 // 10MB default
): boolean {
  return size <= maxSize;
}

/**
 * Upload single file with validation
 */
export async function uploadSingleFile(
  fileData: FileData,
  options: {
    folder?: string;
    allowedTypes?: string[];
    maxSize?: number;
    tags?: string[];
  } = {}
): Promise<FileUploadResult> {
  const {
    folder = "pesantren",
    allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
    maxSize = 10 * 1024 * 1024, // 10MB
    tags = [],
  } = options;

  try {
    // Validate file type
    if (!validateFileType(fileData.mimeType, allowedTypes)) {
      return {
        success: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
      };
    }

    // Validate file size
    if (!validateFileSize(fileData.size, maxSize)) {
      return {
        success: false,
        error: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`,
      };
    }

    // Upload to Cloudinary
    const result = await uploadFromBuffer(fileData.buffer, {
      folder,
      tags,
      resourceType: fileData.mimeType.startsWith("video/") ? "video" : "image",
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("File upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Handle file upload from API request
 */
export async function handleFileUpload(
  request: NextRequest,
  options: {
    fieldName?: string;
    folder?: string;
    allowedTypes?: string[];
    maxSize?: number;
    tags?: string[];
  } = {}
): Promise<FileUploadResult> {
  try {
    const formData = await request.formData();
    const fileData = await extractFileFromFormData(formData, options.fieldName);

    if (!fileData) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    return uploadSingleFile(fileData, options);
  } catch (error) {
    console.error("Handle file upload error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to process upload",
    };
  }
}

/**
 * Handle multiple files upload from API request
 */
export async function handleMultipleFileUpload(
  request: NextRequest,
  options: {
    fieldName?: string;
    folder?: string;
    allowedTypes?: string[];
    maxSize?: number;
    tags?: string[];
    maxFiles?: number;
  } = {}
): Promise<{
  success: boolean;
  data?: UploadApiResponse[];
  error?: string;
  results?: FileUploadResult[];
}> {
  try {
    const { maxFiles = 10 } = options;

    const formData = await request.formData();
    const filesData = await extractMultipleFilesFromFormData(
      formData,
      options.fieldName
    );

    if (filesData.length === 0) {
      return {
        success: false,
        error: "No files provided",
      };
    }

    if (filesData.length > maxFiles) {
      return {
        success: false,
        error: `Too many files. Maximum allowed: ${maxFiles}`,
      };
    }

    // Upload all files
    const uploadPromises = filesData.map((fileData) =>
      uploadSingleFile(fileData, options)
    );
    const results = await Promise.all(uploadPromises);

    // Check for any failures
    const failures = results.filter((result) => !result.success);
    if (failures.length > 0) {
      return {
        success: false,
        error: `${failures.length} upload(s) failed`,
        results,
      };
    }

    // All successful
    const uploadedFiles = results
      .filter((result) => result.success && result.data)
      .map((result) => result.data!);

    return {
      success: true,
      data: uploadedFiles,
      results,
    };
  } catch (error) {
    console.error("Handle multiple file upload error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to process uploads",
    };
  }
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const urlParts = url.split("/");
    const uploadIndex = urlParts.findIndex((part) => part === "upload");

    if (uploadIndex === -1 || uploadIndex + 2 >= urlParts.length) {
      return null;
    }

    // Get everything after the version (vXXXXXXXXX)
    const pathParts = urlParts.slice(uploadIndex + 2);
    const fullPath = pathParts.join("/");

    // Remove file extension
    const publicId = fullPath.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
}
