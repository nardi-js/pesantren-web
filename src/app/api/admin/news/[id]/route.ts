import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import News, { INews } from "@/models/News";
import { handleFileUpload } from "@/lib/upload";
import { v2 as cloudinary } from "cloudinary";

interface ValidationError extends Error {
  name: "ValidationError";
  errors: Record<string, unknown>;
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/admin/news/[id] - Get single news by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const news = await News.findById(id);

    if (!news) {
      return NextResponse.json(
        { success: false, error: "News not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: news,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/news/[id] - Update news
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Check if news exists
    const existingNews = await News.findById(id);
    if (!existingNews) {
      return NextResponse.json(
        { success: false, error: "News not found" },
        { status: 404 }
      );
    }

    const contentType = request.headers.get("content-type");

    if (contentType?.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData();

      // Extract news data
      const updateData: Partial<INews> = {
        title: formData.get("title") as string,
        excerpt: formData.get("excerpt") as string,
        content: formData.get("content") as string,
        category: formData.get("category") as string,
        videoUrl: (formData.get("videoUrl") as string) || "",
        author: {
          name: (formData.get("authorName") as string) || "Admin",
          email: (formData.get("authorEmail") as string) || "",
          role: (formData.get("authorRole") as string) || "Admin",
        },
        status: (formData.get("status") as "draft" | "published") || "draft",
        priority: parseInt(formData.get("priority") as string) || 1,
        featured: formData.get("featured") === "true",
        tags: formData.get("tags")
          ? (formData.get("tags") as string).split(",").map((tag) => tag.trim())
          : [],
      };

      // Handle image upload
      const imageFile = formData.get("image") as File;
      if (imageFile && imageFile.size > 0) {
        // Delete old image from Cloudinary if exists
        if (existingNews.image) {
          try {
            const publicId = existingNews.image.split("/").pop()?.split(".")[0];
            if (publicId) {
              await cloudinary.uploader.destroy(`pesantren/news/${publicId}`);
            }
          } catch {}
        }

        // Upload new image
        const uploadResult = await handleFileUpload(request, {
          fieldName: "image",
          folder: "pesantren/news",
          tags: ["news", "image"],
        });

        if (!uploadResult.success) {
          return NextResponse.json(
            { success: false, error: uploadResult.error },
            { status: 400 }
          );
        }

        updateData.image = uploadResult.data!.secure_url;
      }

      // Update publishedAt if status changed to published
      if (
        updateData.status === "published" &&
        existingNews.status !== "published"
      ) {
        updateData.publishedAt = new Date();
      }

      const updatedNews = await News.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      return NextResponse.json({
        success: true,
        data: updatedNews,
      });
    } else {
      // Handle JSON data
      const data = await request.json();
      // Process JSON data properly
      const updateData: Partial<INews> = {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        videoUrl: data.videoUrl || "",
        author: {
          name: data.authorName || "Admin",
          email: data.authorEmail || "",
          role: data.authorRole || "Admin",
        },
        status: data.status || "draft",
        priority: parseInt(data.priority) || 1,
        featured: data.featured === true || data.featured === "true",
        tags: data.tags
          ? typeof data.tags === "string"
            ? data.tags.split(",").map((tag: string) => tag.trim())
            : data.tags
          : [],
      };

      // Only include image if it's a valid string URL
      if (
        data.image &&
        typeof data.image === "string" &&
        data.image.trim() !== ""
      ) {
        updateData.image = data.image;
      }

      // Ensure author name is not empty
      if (!updateData.author?.name || updateData.author.name.trim() === "") {
        if (updateData.author) {
          updateData.author.name = "Admin";
        } else {
          updateData.author = { name: "Admin", email: "", role: "Admin" };
        }
      }
      // Update publishedAt if status changed to published
      if (
        updateData.status === "published" &&
        existingNews.status !== "published"
      ) {
        updateData.publishedAt = new Date();
      }

      const updatedNews = await News.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      return NextResponse.json({
        success: true,
        data: updatedNews,
      });
    }
  } catch (error) {
    if ((error as ValidationError).name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: (error as ValidationError).errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update news" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/news/[id] - Delete news
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Check if news exists
    const existingNews = await News.findById(id);
    if (!existingNews) {
      return NextResponse.json(
        { success: false, error: "News not found" },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary if exists
    if (existingNews.image) {
      try {
        const publicId = existingNews.image.split("/").pop()?.split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`pesantren/news/${publicId}`);
        }
      } catch {}
    }

    // Delete news from database
    await News.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "News deleted successfully",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete news" },
      { status: 500 }
    );
  }
}
