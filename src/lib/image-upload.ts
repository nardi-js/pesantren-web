import { ImageData } from "@/components/admin/ImageUploader";

/**
 * Upload image to Cloudinary from ImageData
 */
export async function uploadImageToCloudinary(imageData: ImageData): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    const formData = new FormData();
    formData.append("file", imageData.file);

    console.log("🚀 Uploading image to Cloudinary:", {
      name: imageData.file.name,
      size: imageData.file.size,
      type: imageData.file.type,
    });

    const response = await fetch("/api/upload/image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Upload response error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success && result.data?.secure_url) {
      console.log("✅ Upload successful, URL:", result.data.secure_url);
      return {
        success: true,
        url: result.data.secure_url,
      };
    } else {
      throw new Error(result.error || "Upload failed");
    }
  } catch (error) {
    console.error("❌ Image upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Upload multiple images to Cloudinary
 */
export async function uploadMultipleImagesToCloudinary(
  images: ImageData[]
): Promise<{
  success: boolean;
  urls?: string[];
  errors?: string[];
}> {
  const results = await Promise.allSettled(
    images.map((image) => uploadImageToCloudinary(image))
  );

  const urls: string[] = [];
  const errors: string[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled" && result.value.success) {
      urls.push(result.value.url!);
    } else {
      const error =
        result.status === "fulfilled"
          ? result.value.error
          : result.reason?.message || "Unknown error";
      errors.push(`Image ${index + 1}: ${error}`);
    }
  });

  return {
    success: errors.length === 0,
    urls: urls.length > 0 ? urls : undefined,
    errors: errors.length > 0 ? errors : undefined,
  };
}
