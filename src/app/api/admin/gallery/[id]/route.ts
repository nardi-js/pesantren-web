import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Gallery, { IGallery } from "@/models/Gallery";
import { handleFileUpload } from "@/lib/upload";
import { deleteFile } from "@/lib/cloudinary";
import { extractPublicIdFromUrl } from "@/lib/upload";

// GET /api/admin/gallery/[id] - Get single gallery item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const galleryItem = await Gallery.findById(id).select("-__v").lean();

    if (!galleryItem) {
      return NextResponse.json(
        { success: false, error: "Gallery item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: galleryItem,
    });
  } catch (error) {
    console.error("Get gallery item error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gallery item" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/gallery/[id] - Update gallery item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const contentType = request.headers.get("content-type");

    // Find existing gallery item
    const existingGallery = await Gallery.findById(id);
    if (!existingGallery) {
      return NextResponse.json(
        { success: false, error: "Gallery item not found" },
        { status: 404 }
      );
    }

    if (contentType?.includes("multipart/form-data")) {
      // Handle FormData with file uploads
      const formData = await request.formData();

      const updateData: Partial<IGallery> = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        type:
          (formData.get("type") as string as "image" | "video" | "album") ||
          existingGallery.type,
        category: formData.get("category") as string,
        tags: JSON.parse((formData.get("tags") as string) || "[]"),
        status:
          (formData.get("status") as string as
            | "draft"
            | "published"
            | "archived") || existingGallery.status,
        featured: (formData.get("featured") as string) === "true",
      };

      // Handle cover image update
      const coverImageFile = formData.get("coverImage") as File;
      if (coverImageFile && coverImageFile.size > 0) {
        // Delete old cover image
        if (existingGallery.coverImage) {
          const publicId = extractPublicIdFromUrl(existingGallery.coverImage);
          if (publicId) {
            await deleteFile(publicId);
          }
        }

        // Upload new cover image
        const uploadResult = await handleFileUpload(request, {
          fieldName: "coverImage",
          folder: "pesantren/gallery/covers",
          tags: ["gallery", "cover"],
        });

        if (!uploadResult.success) {
          return NextResponse.json(
            { success: false, error: uploadResult.error },
            { status: 400 }
          );
        }

        updateData.coverImage = uploadResult.data!.secure_url;
      }

      // Handle content updates based on type
      if (updateData.type === "image") {
        const imageFile = formData.get("image") as File;
        if (imageFile && imageFile.size > 0) {
          // Delete old image if exists
          if (
            existingGallery.content?.url &&
            existingGallery.content.type === "image"
          ) {
            const publicId = extractPublicIdFromUrl(
              existingGallery.content.url
            );
            if (publicId) {
              await deleteFile(publicId);
            }
          }

          // Upload new image
          const uploadResult = await handleFileUpload(request, {
            fieldName: "image",
            folder: "pesantren/gallery/images",
            tags: ["gallery", "image"],
          });

          if (!uploadResult.success) {
            return NextResponse.json(
              { success: false, error: uploadResult.error },
              { status: 400 }
            );
          }

          updateData.content = {
            type: "image",
            url: uploadResult.data!.secure_url,
            caption: formData.get("caption") as string,
            altText: formData.get("altText") as string,
          };
        }
      } else if (updateData.type === "video") {
        const youtubeUrl = formData.get("youtubeUrl") as string;
        if (youtubeUrl) {
          const youtubeId = extractYouTubeId(youtubeUrl);
          if (!youtubeId) {
            return NextResponse.json(
              { success: false, error: "Invalid YouTube URL" },
              { status: 400 }
            );
          }

          updateData.content = {
            type: "youtube",
            url: youtubeUrl,
            youtubeId,
            caption: formData.get("caption") as string,
          };
        }
      }

      const updatedGallery = await Gallery.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      return NextResponse.json({
        success: true,
        data: updatedGallery,
        message: "Gallery item updated successfully",
      });
    } else {
      // Handle JSON data
      const data = await request.json();

      if (data.type === "video" && data.youtubeUrl) {
        const youtubeId = extractYouTubeId(data.youtubeUrl);
        if (!youtubeId) {
          return NextResponse.json(
            { success: false, error: "Invalid YouTube URL" },
            { status: 400 }
          );
        }

        data.content = {
          type: "youtube",
          url: data.youtubeUrl,
          youtubeId,
          caption: data.caption,
        };
      }

      const updatedGallery = await Gallery.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      );

      if (!updatedGallery) {
        return NextResponse.json(
          { success: false, error: "Gallery item not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: updatedGallery,
        message: "Gallery item updated successfully",
      });
    }
  } catch (error) {
    console.error("Update gallery item error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update gallery item" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/gallery/[id] - Delete gallery item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Find gallery item first to get image URLs for deletion
    const galleryItem = await Gallery.findById(id);
    if (!galleryItem) {
      return NextResponse.json(
        { success: false, error: "Gallery item not found" },
        { status: 404 }
      );
    }

    // Delete cover image from Cloudinary
    if (galleryItem.coverImage) {
      const publicId = extractPublicIdFromUrl(galleryItem.coverImage);
      if (publicId) {
        await deleteFile(publicId);
      }
    }

    // Delete content images from Cloudinary
    if (galleryItem.content?.url && galleryItem.content.type === "image") {
      const publicId = extractPublicIdFromUrl(galleryItem.content.url);
      if (publicId) {
        await deleteFile(publicId);
      }
    }

    // Delete album images from Cloudinary
    if (galleryItem.items && galleryItem.items.length > 0) {
      for (const item of galleryItem.items) {
        if (item.type === "image" && item.url) {
          const publicId = extractPublicIdFromUrl(item.url);
          if (publicId) {
            await deleteFile(publicId);
          }
        }
      }
    }

    // Delete from database
    await Gallery.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Gallery item deleted successfully",
    });
  } catch (error) {
    console.error("Delete gallery item error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete gallery item" },
      { status: 500 }
    );
  }
}

// Helper function to extract YouTube ID from URL
function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
