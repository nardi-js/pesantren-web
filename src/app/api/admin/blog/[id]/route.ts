import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Blog from "@/models/Blog";
import { handleFileUpload } from "@/lib/upload";
import { deleteFile } from "@/lib/cloudinary";

// Helper function to extract public ID from Cloudinary URL
function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Extract public ID from cloudinary URL
    // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg
    const match = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/admin/blog/[id] - Get single blog
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const blog = await Blog.findById(params.id).lean();

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Get blog error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/blog/[id] - Update blog
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const contentType = request.headers.get("content-type");
    let updateData: Record<string, unknown> = {};
    let featuredImageUrl: string | undefined;

    if (contentType?.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData();

      // Extract blog data
      updateData = {
        title: formData.get("title") as string,
        excerpt: formData.get("excerpt") as string,
        content: formData.get("content") as string,
        "author.name": formData.get("authorName") as string,
        "author.avatar": (formData.get("authorAvatar") as string) || undefined,
        category: formData.get("category") as string,
        tags: JSON.parse((formData.get("tags") as string) || "[]"),
        status: formData.get("status") as string,
        "seo.title": (formData.get("seoTitle") as string) || undefined,
        "seo.description":
          (formData.get("seoDescription") as string) || undefined,
        "seo.keywords": JSON.parse(
          (formData.get("seoKeywords") as string) || "[]"
        ),
      };

      // Handle featured image upload
      const imageFile = formData.get("featuredImage") as File;
      if (imageFile && imageFile.size > 0) {
        // Get current blog to delete old image
        const currentBlog = await Blog.findById(params.id);
        if (currentBlog?.featuredImage) {
          const oldPublicId = extractPublicIdFromUrl(currentBlog.featuredImage);
          if (oldPublicId) {
            try {
              await deleteFile(oldPublicId);
            } catch (error) {
              console.warn("Failed to delete old featured image:", error);
            }
          }
        }

        const uploadResult = await handleFileUpload(request, {
          fieldName: "featuredImage",
          folder: "pesantren/blog",
          tags: ["blog", "featured-image"],
        });

        if (!uploadResult.success) {
          return NextResponse.json(
            { success: false, error: uploadResult.error },
            { status: 400 }
          );
        }

        featuredImageUrl = uploadResult.data!.secure_url;
      }
    } else {
      // Handle JSON data
      updateData = await request.json();
    }

    // Add featured image URL if uploaded
    if (featuredImageUrl) {
      updateData.featuredImage = featuredImageUrl;
    }

    const blog = await Blog.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: blog,
    });
  } catch (error: unknown) {
    console.error("Update blog error:", error);

    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ValidationError"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: "errors" in error ? error.errors : undefined,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/blog/[id] - Delete blog
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const blog = await Blog.findById(params.id);

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    // Delete featured image from Cloudinary
    if (blog.featuredImage) {
      const publicId = extractPublicIdFromUrl(blog.featuredImage);
      if (publicId) {
        try {
          await deleteFile(publicId);
        } catch (error) {
          console.warn("Failed to delete featured image:", error);
        }
      }
    }

    await Blog.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Delete blog error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}
