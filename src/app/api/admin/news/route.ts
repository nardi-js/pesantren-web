import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import News, { INews } from "@/models/News";
import { handleFileUpload } from "@/lib/upload";

interface ValidationError extends Error {
  name: "ValidationError";
  errors: Record<string, unknown>;
}

// GET /api/admin/news - Get all news with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const priority = searchParams.get("priority") || "";
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

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get news with pagination
    const news = await News.find(filter)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await News.countDocuments(filter);

    console.log(`Found ${news.length} news articles, total: ${total}`);
    console.log("News data:", news);

    return NextResponse.json({
      success: true,
      data: {
        data: news,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get news error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}

// POST /api/admin/news - Create new news
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const contentType = request.headers.get("content-type");
    console.log("Content-Type:", contentType);

    if (contentType?.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData();

      // Log received form data for debugging
      console.log("Received form data:");
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      // Extract news data
      const newsData: Partial<INews> = {
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

      // Ensure author name is not empty
      if (!newsData.author?.name || newsData.author.name.trim() === "") {
        newsData.author.name = "Admin";
      }

      console.log("Processed news data:", JSON.stringify(newsData, null, 2));

      // Handle image upload
      const imageFile = formData.get("image") as File;
      if (imageFile && imageFile.size > 0) {
        console.log("Processing image upload:", imageFile.name);
        const uploadResult = await handleFileUpload(request, {
          fieldName: "image",
          folder: "pesantren/news",
          tags: ["news", "image"],
        });

        if (!uploadResult.success) {
          console.error("Image upload failed:", uploadResult.error);
          return NextResponse.json(
            { success: false, error: uploadResult.error },
            { status: 400 }
          );
        }

        newsData.image = uploadResult.data!.secure_url;
        console.log("Image uploaded successfully:", newsData.image);
      } else {
        console.log("No image file provided or file is empty");
        // Don't set image field if no file is provided
        delete newsData.image;
      }

      const news = new News(newsData);
      await news.save();

      return NextResponse.json(
        {
          success: true,
          data: news,
        },
        { status: 201 }
      );
    } else {
      // Handle JSON data
      const data = await request.json();
      console.log("Received JSON data:", JSON.stringify(data, null, 2));

      // Process JSON data similar to FormData
      const newsData: Partial<INews> = {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        videoUrl: data.videoUrl || "",
        image: data.image || "",
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

      // Ensure author name is not empty
      if (!newsData.author?.name || newsData.author.name.trim() === "") {
        newsData.author.name = "Admin";
      }

      console.log(
        "Processed JSON news data:",
        JSON.stringify(newsData, null, 2)
      );

      const news = new News(newsData);
      await news.save();

      return NextResponse.json(
        {
          success: true,
          data: news,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Create news error:", error);

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
      { success: false, error: "Failed to create news" },
      { status: 500 }
    );
  }
}
