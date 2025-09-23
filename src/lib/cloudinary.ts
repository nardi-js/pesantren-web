// Cloudinary configuration helper.
// Provides an initialized Cloudinary instance ready for uploads.
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from "cloudinary";

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error("❌ Missing Cloudinary environment variables:", {
    CLOUDINARY_CLOUD_NAME: !!CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: !!CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: !!CLOUDINARY_API_SECRET,
  });
  throw new Error("Missing required Cloudinary environment variables");
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

type UploadResult = UploadApiResponse;

interface BaseUploadParams {
  folder?: string; // Cloudinary folder
  publicId?: string; // custom public ID
  tags?: string[];
  overwrite?: boolean;
}

export async function uploadImage(
  filePath: string,
  params: BaseUploadParams = {},
  options: UploadApiOptions = {}
): Promise<UploadResult> {
  return cloudinary.uploader.upload(filePath, {
    folder: params.folder || "pesantren/images",
    public_id: params.publicId,
    tags: params.tags,
    overwrite: params.overwrite ?? false,
    resource_type: "image",
    ...options,
  });
}

export async function uploadVideo(
  filePath: string,
  params: BaseUploadParams = {},
  options: UploadApiOptions = {}
): Promise<UploadResult> {
  return cloudinary.uploader.upload(filePath, {
    folder: params.folder || "pesantren/videos",
    public_id: params.publicId,
    tags: params.tags,
    overwrite: params.overwrite ?? false,
    resource_type: "video",
    ...options,
  });
}

/**
 * Upload file from buffer or base64 string
 */
export async function uploadFromBuffer(
  buffer: Buffer | string,
  options: {
    folder?: string;
    resourceType?: "image" | "video" | "raw";
    quality?: string | number;
    tags?: string[];
    transformation?: string;
  } = {}
): Promise<UploadResult> {
  const {
    folder = "pesantren",
    resourceType = "image",
    quality = "auto",
    tags = [],
    transformation,
  } = options;

  let uploadData: string;

  if (Buffer.isBuffer(buffer)) {
    uploadData = `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } else {
    uploadData = buffer;
  }

  return cloudinary.uploader.upload(uploadData, {
    folder,
    resource_type: resourceType,
    quality,
    tags,
    transformation,
    use_filename: true,
    unique_filename: true,
  });
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFile(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<{ result: string }> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    throw new Error(
      `Delete failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Generate optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
    crop?: string;
    gravity?: string;
  } = {}
): string {
  const {
    width,
    height,
    quality = "auto",
    format = "auto",
    crop = "fill",
    gravity = "center",
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    quality,
    format,
    crop,
    gravity,
    fetch_format: "auto",
    secure: true,
  });
}

/**
 * Generate thumbnail URL
 */
export function getThumbnailUrl(publicId: string, size: number = 150): string {
  return getOptimizedImageUrl(publicId, {
    width: size,
    height: size,
    crop: "fill",
    quality: "auto",
  });
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: Array<{ buffer: Buffer; originalName: string; mimeType: string }>,
  options: {
    folder?: string;
    tags?: string[];
  } = {}
): Promise<UploadResult[]> {
  const { folder = "pesantren", tags = [] } = options;

  const uploadPromises = files.map((file) => {
    const base64Data = `data:${file.mimeType};base64,${file.buffer.toString(
      "base64"
    )}`;
    return cloudinary.uploader.upload(base64Data, {
      folder,
      tags,
      use_filename: true,
      unique_filename: true,
      resource_type: "auto",
    });
  });

  return Promise.all(uploadPromises);
}

/**
 * Generate signed upload URL for direct uploads
 */
export function generateSignedUploadUrl(options: {
  folder?: string;
  tags?: string[];
  resourceType?: "image" | "video" | "raw";
  maxFileSize?: number;
}) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const params = {
    timestamp,
    folder: options.folder || "pesantren",
    tags: options.tags?.join(","),
    upload_preset: "pesantren_upload", // You'll need to create this in Cloudinary console
    max_file_size: options.maxFileSize || 10000000, // 10MB default
  };

  // Filter out undefined values
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  );

  const signature = cloudinary.utils.api_sign_request(
    filteredParams,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    url: `https://api.cloudinary.com/v1_1/${ process.env.CLOUDINARY_CLOUD_NAME }/${options.resourceType || "image"}/upload`,
    params: {
      ...filteredParams,
      signature,
      api_key: process.env.CLOUDINARY_API_KEY,
    },
  };
}

export { cloudinary };
export default cloudinary;
