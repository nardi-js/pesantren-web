// Shared News types for client and server usage
// Derived from Mongoose INews interface (src/models/News.ts) but with string dates for serialized API responses.

export interface AuthorInfo {
  name: string;
  email?: string;
  role?: string;
}

export type NewsStatus = "draft" | "published";

export interface News {
  _id: string; // serialized Mongo ObjectId as string
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  image?: string;
  videoUrl?: string;
  author: AuthorInfo;
  status: NewsStatus;
  publishedAt?: string; // ISO string when serialized
  views: number;
  category: string;
  priority: number; // 1..5
  featured: boolean;
  tags: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// Lightweight shape often used in lists/highlights (omit heavy content field)
export type NewsSummary = Omit<News, "content">;
