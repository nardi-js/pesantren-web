// Frontend API client for blog

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: {
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  publishedAt: string;
  views: number;
  status: "draft" | "published";
}

export interface BlogListResponse {
  success: boolean;
  data: {
    blogs: BlogPost[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  error?: string;
}

export interface BlogDetailResponse {
  success: boolean;
  data: BlogPost;
  error?: string;
}

export class BlogApi {
  private static getBaseUrl() {
    // For server-side rendering, use localhost
    if (typeof window === "undefined") {
      return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    }
    // For client-side, use relative URL
    return "";
  }

  private static get baseUrl() {
    return `${this.getBaseUrl()}/api/blog`;
  }

  /**
   * Get list of published blogs
   */
  static async getBlogs(
    params: {
      page?: number;
      limit?: number;
      category?: string;
      search?: string;
    } = {}
  ): Promise<BlogListResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set("page", params.page.toString());
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.category) searchParams.set("category", params.category);
    if (params.search) searchParams.set("search", params.search);

    const url = `${this.baseUrl}?${searchParams}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get blogs error:", error);
      return {
        success: false,
        data: {
          blogs: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        },
        error: error instanceof Error ? error.message : "Failed to fetch blogs",
      };
    }
  }

  /**
   * Get single blog by slug
   */
  static async getBlogBySlug(slug: string): Promise<BlogDetailResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${slug}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get blog by slug error:", error);
      return {
        success: false,
        data: {} as BlogPost,
        error: error instanceof Error ? error.message : "Failed to fetch blog",
      };
    }
  }

  /**
   * Get all available categories
   */
  static async getCategories(): Promise<string[]> {
    try {
      const response = await this.getBlogs({ limit: 1000 });
      if (response.success) {
        const categories = Array.from(
          new Set(response.data.blogs.map((blog) => blog.category))
        );
        return categories.sort();
      }
      return [];
    } catch (error) {
      console.error("Get categories error:", error);
      return [];
    }
  }
}
