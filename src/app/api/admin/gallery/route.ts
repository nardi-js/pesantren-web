import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Gallery from "@/models/Gallery";
import { handleFileUpload, handleMultipleFileUpload } from "@/lib/upload";

// GET /api/admin/gallery - Get all gallery items with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Gallery GET API called");

    await connectDB();
    console.log("✅ Database connected for Gallery GET");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const type = searchParams.get("type") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build filter object
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    if (type && type !== "all") {
      filter.type = type;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get gallery items with pagination
    const galleryItems = await Gallery.find(filter)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .select("-__v")
      .lean();

    // Get total count
    const total = await Gallery.countDocuments(filter);

    console.log(
      `✅ Found ${galleryItems.length} gallery items, total: ${total}`
    );

    return NextResponse.json({
      success: true,
      data: {
        data: galleryItems,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("❌ Get gallery error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gallery items" },
      { status: 500 }
    );
  }
}

// POST /api/admin/gallery - Create new gallery item
export async function POST(request: NextRequest) {
  try {
    console.log("📝 Gallery POST API called");

    await connectDB();
    console.log("✅ Database connected for Gallery POST");

    const contentType = request.headers.get("content-type");
    
    if (contentType?.includes("multipart/form-data")) {
      // Handle FormData with file uploads
      const formData = await request.formData();
      console.log("📋 FormData received");

      // Extract basic data
      const galleryData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        type: (formData.get("type") as string) || "image",
        category: formData.get("category") as string,
        tags: JSON.parse((formData.get("tags") as string) || "[]"),
        status: (formData.get("status") as string) || "draft",
        featured: (formData.get("featured") as string) === "true",
        coverImage: "", // Will be set after upload
        items: [] as any[],
        content: undefined as any,
      };

      console.log("📋 Extracted galleryData:", galleryData);

      // Handle cover image upload
      const coverImageFile = formData.get("coverImage") as File;
      if (coverImageFile && coverImageFile.size > 0) {
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

        galleryData.coverImage = uploadResult.data!.secure_url;
      }

      // Handle content based on type
      if (galleryData.type === "image") {
        // Single image upload
        const imageFile = formData.get("image") as File;
        if (imageFile && imageFile.size > 0) {
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

          galleryData.content = {
            type: "image",
            url: uploadResult.data!.secure_url,
            caption: formData.get("caption") as string,
            altText: formData.get("altText") as string,
          };
        }
      } else if (galleryData.type === "video") {
        // YouTube video
        const youtubeUrl = formData.get("youtubeUrl") as string;
        if (youtubeUrl) {
          const youtubeId = extractYouTubeId(youtubeUrl);
          if (!youtubeId) {
            return NextResponse.json(
              { success: false, error: "Invalid YouTube URL" },
              { status: 400 }
            );
          }

          galleryData.content = {
            type: "youtube",
            url: youtubeUrl,
            youtubeId,
            caption: formData.get("caption") as string,
          };
        }
      } else if (galleryData.type === "album") {
        // Multiple files upload
        const imageFiles = formData.getAll("images") as File[];
        const youtubeUrls = JSON.parse((formData.get("youtubeUrls") as string) || "[]");
        
        // Upload multiple images
        if (imageFiles.length > 0) {
          const uploadResults = await handleMultipleFileUpload(request, {
            fieldName: "images",
            folder: "pesantren/gallery/albums",
            tags: ["gallery", "album"],
            maxFiles: 20,
          });

          if (!uploadResults.success) {
            return NextResponse.json(
              { success: false, error: uploadResults.error },
              { status: 400 }
            );
          }

          const imageItems = uploadResults.data!.map((result, index) => ({
            type: "image",
            url: result.secure_url,
            caption: formData.get(`caption_${index}`) as string || "",
            altText: formData.get(`altText_${index}`) as string || "",
            order: index,
          }));

          galleryData.items.push(...imageItems);
        }

        // Add YouTube videos
        youtubeUrls.forEach((urlData: any, index: number) => {
          const youtubeId = extractYouTubeId(urlData.url);
          if (youtubeId) {
            galleryData.items.push({
              type: "youtube",
              url: urlData.url,
              youtubeId,
              caption: urlData.caption || "",
              order: galleryData.items.length + index,
            });
          }
        });
      }

      const gallery = new Gallery(galleryData);
      const savedGallery = await gallery.save();
      console.log("✅ Gallery saved successfully:", savedGallery._id);

      return NextResponse.json(
        {
          success: true,
          data: savedGallery,
          message: "Gallery item created successfully",
        },
        { status: 201 }
      );
    } else {
      // Handle JSON data (for YouTube-only items)
      const data = await request.json();
      console.log("📋 JSON data received:", data);

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

      const gallery = new Gallery(data);
      const savedGallery = await gallery.save();
      console.log("✅ Gallery saved successfully:", savedGallery._id);

      return NextResponse.json(
        {
          success: true,
          data: savedGallery,
          message: "Gallery item created successfully",
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("❌ Create gallery error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create gallery item" },
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
