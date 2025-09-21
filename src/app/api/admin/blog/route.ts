import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Blog from "@/models/Blog";
import { handleFileUpload } from "@/lib/upload";

// GET /api/admin/blog - Get all blogs with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build filter object
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { "author.name": { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get blogs with pagination
    const blogs = await Blog.find(filter)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await Blog.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: {
        data: blogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get blogs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

// POST /api/admin/blog - Create new blog
export async function POST(request: NextRequest) {
  try {
    console.log("📝 Blog POST  API called");

    await connectDB();
    console.log("✅ Database connected for Blog POST");

    const contentType = request.headers.get("content-type");
    console.log("📋 Content-Type:", contentType);

    if (contentType?.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData();
      console.log("📁 FormData entries:");
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      // Extract blog data
      const blogData: any = {
        title: formData.get("title") as string,
        excerpt: formData.get("excerpt") as string,
        content: formData.get("content") as string,
        author: {
          name: formData.get("authorName") as string,
          avatar: (formData.get("authorAvatar") as string) || undefined,
        },
        category: formData.get("category") as string,
        tags: JSON.parse((formData.get("tags") as string) || "[]"),
        status: (formData.get("status") as string) || "draft",
        seo: {
          title: (formData.get("seoTitle") as string) || undefined,
          description: (formData.get("seoDescription") as string) || undefined,
          keywords: JSON.parse((formData.get("seoKeywords") as string) || "[]"),
        },
        featuredImage: "", // Will be set after upload
      };

      console.log("📋 Extracted blogData:", blogData);

      // Handle featured image upload
      const imageFile = formData.get("featuredImage") as File;
      if (imageFile && imageFile.size > 0) {
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

        blogData.featuredImage = uploadResult.data!.secure_url;
      }

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();
      console.log("✅ Blog saved successfully:", savedBlog._id);

      return NextResponse.json(
        {
          success: true,
          data: savedBlog,
          message: "Blog created successfully",
        },
        { status: 201 }
      );
    } else {
      // Handle JSON data
      const data = await request.json();
      console.log("📋 JSON data received:", data);

      // Check if data is empty or missing required fields
      if (!data || Object.keys(data).length === 0) {
        console.error("❌ Empty data received");
        return NextResponse.json(
          { success: false, error: "No data provided" },
          { status: 400 }
        );
      }

      // Validate required fields
      if (!data.title) {
        console.error("❌ Missing required field: title");
        return NextResponse.json(
          { success: false, error: "Title is required" },
          { status: 400 }
        );
      }

      // Create slug from title if not provided
      if (!data.slug) {
        data.slug = data.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();
      }

      // Set default values if not provided
      data.status = data.status || "draft";
      data.views = data.views || 0;
      data.featuredImage =
        data.featuredImage ||
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop";

      // Ensure author object structure
      if (!data.author || typeof data.author !== "object") {
        data.author = { name: data.authorName || "Admin" };
      }

      // Ensure seo object structure
      if (!data.seo || typeof data.seo !== "object") {
        data.seo = {
          title: data.seoTitle,
          description: data.seoDescription,
          keywords: Array.isArray(data.seoKeywords) ? data.seoKeywords : [],
        };
      }

      console.log("📋 Processed data for saving:", data);

      const blog = new Blog(data);
      const savedBlog = await blog.save();
      console.log("✅ Blog saved successfully:", savedBlog._id);

      return NextResponse.json(
        {
          success: true,
          data: savedBlog,
          message: "Blog created successfully",
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("❌ Create blog error:", error);

    if (error.name === "ValidationError") {
      console.error("❌ Validation errors:", error.errors);
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create blog" },
      { status: 500 }
    );
  }
}
