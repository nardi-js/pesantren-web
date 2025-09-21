import { NextResponse } from "next/server";

interface MockBlog {
  _id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: { name: string };
  category: string;
  tags: string[];
  status: string;
  seo: Record<string, unknown>;
  readTime: number;
  views: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Mock database - simpan di memory sementara untuk testing
const mockBlogs: MockBlog[] = [];
let nextId = 1;

export async function GET() {
  try {
    console.log("📋 Getting mock blogs:", mockBlogs.length, "blogs found");

    return NextResponse.json({
      success: true,
      data: {
        blogs: mockBlogs,
        pagination: {
          page: 1,
          limit: 10,
          total: mockBlogs.length,
          pages: Math.ceil(mockBlogs.length / 10),
        },
      },
    });
  } catch (error) {
    console.error("❌ Mock blog GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get blogs",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("📤 Creating mock blog with data:", data);

    // Validasi required fields
    if (!data.title || !data.content) {
      return NextResponse.json(
        {
          success: false,
          error: "Title and content are required",
        },
        { status: 400 }
      );
    }

    // Generate slug jika tidak ada
    const slug =
      data.slug ||
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

    // Buat blog object
    const blog: MockBlog = {
      _id: nextId++,
      title: data.title,
      slug: slug,
      excerpt: data.excerpt || data.content.substring(0, 200) + "...",
      content: data.content,
      featuredImage:
        data.featuredImage || "https://via.placeholder.com/800x400",
      author: data.author || { name: "Admin" },
      category: data.category || "General",
      tags: Array.isArray(data.tags)
        ? data.tags
        : data.tags
        ? data.tags.split(",").map((t: string) => t.trim())
        : [],
      status: data.status || "draft",
      seo: data.seo || {},
      readTime: Math.ceil(data.content.split(/\s+/).length / 200),
      views: 0,
      publishedAt: data.status === "published" ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Simpan ke mock database
    mockBlogs.push(blog);

    console.log("✅ Mock blog created successfully:", blog._id);
    console.log("📊 Total mock blogs:", mockBlogs.length);

    return NextResponse.json({
      success: true,
      data: blog,
      message: `Blog ${
        data.status === "published" ? "published" : "saved as draft"
      } successfully!`,
    });
  } catch (error) {
    console.error("❌ Mock blog creation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: `Failed to create blog: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
