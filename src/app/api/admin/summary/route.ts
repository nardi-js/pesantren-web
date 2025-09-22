import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

// Import Mongoose models (adjust paths/names if different)
import NewsModel from "@/models/News";
import BlogModel from "@/models/Blog";
import EventModel from "@/models/Event";
import GalleryModel from "@/models/Gallery";
import TestimonialModel from "@/models/Testimonial";
import DonationModels from "@/models/Donation";
import AdminUserModel from "@/models/AdminUser";

interface RecentItem {
  id: string;
  type: "news" | "blog" | "event";
  title: string;
  createdAt: string;
}

interface SummaryData {
  success: true;
  stats: {
    content: {
      news: number;
      blogs: number;
      events: number;
      gallery: number;
      testimonials: number;
    };
    donations: {
      count: number;
      totalAmount: number;
    };
    users: number;
  };
  recent: RecentItem[];
  generatedAt: string;
  cached?: boolean;
}

// Simple caching to reduce DB load (in-memory per server instance)
let cached: { data: SummaryData; timestamp: number } | null = null;
const CACHE_TTL_MS = 30 * 1000; // 30s

export async function GET() {
  try {
    await connectDB();

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ ...cached.data, cached: true });
    }

    const { Donation } = DonationModels;

    const [
      newsCount,
      blogCount,
      eventCount,
      galleryCount,
      testimonialCount,
      donationDocs,
      userCount,
    ] = await Promise.all([
      NewsModel.countDocuments().catch(() => 0),
      BlogModel.countDocuments().catch(() => 0),
      EventModel.countDocuments().catch(() => 0),
      GalleryModel.countDocuments().catch(() => 0),
      TestimonialModel.countDocuments().catch(() => 0),
      Donation.find({}, { amount: 1 })
        .lean()
        .catch(() => [] as Array<{ amount?: number }>),
      AdminUserModel.countDocuments().catch(() => 0),
    ]);

    const donationCount = donationDocs.length;
    interface DonationLean {
      amount?: number;
    }
    const donationAmounts: number[] = donationDocs.map((d: DonationLean) =>
      typeof d.amount === "number" ? d.amount : 0
    );
    const donationTotal = donationAmounts.reduce((sum, n) => sum + n, 0);

    // Recent activity fetch (limit 5 each then merge)
    type LeanDoc = {
      _id: mongoose.Types.ObjectId;
      createdAt?: Date;
      title?: string;
      name?: string;
      slug?: string;
    };
    const [latestNews, latestBlogs, latestEvents] = await Promise.all([
      NewsModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean<LeanDoc[]>()
        .catch(() => []),
      BlogModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean<LeanDoc[]>()
        .catch(() => []),
      EventModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean<LeanDoc[]>()
        .catch(() => []),
    ]);

    type WithCreated = {
      _id: mongoose.Types.ObjectId;
      createdAt?: Date;
      title?: string;
      name?: string;
      slug?: string;
    };
    const recent: RecentItem[] = [
      ...latestNews,
      ...latestBlogs,
      ...latestEvents,
    ]
      .filter((i: WithCreated) => !!i)
      .sort((a: WithCreated, b: WithCreated) => {
        const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bd - ad;
      })
      .slice(0, 8)
      .map((item: WithCreated) => {
        const id = String(item._id);
        const title = item.title || item.name || item.slug || "(untitled)";
        // Basic heuristic: presence of slug could mean news or blog; fallback by comparing arrays
        let type: RecentItem["type"] = "event";
        if (latestNews.some((n: LeanDoc) => String(n._id) === id))
          type = "news";
        else if (latestBlogs.some((b: LeanDoc) => String(b._id) === id))
          type = "blog";
        return {
          id,
          type,
          title,
          createdAt: item.createdAt
            ? new Date(item.createdAt).toISOString()
            : new Date().toISOString(),
        };
      });

    const data: SummaryData = {
      success: true,
      stats: {
        content: {
          news: newsCount,
          blogs: blogCount,
          events: eventCount,
          gallery: galleryCount,
          testimonials: testimonialCount,
        },
        donations: {
          count: donationCount,
          totalAmount: donationTotal,
        },
        users: userCount,
      },
      recent,
      generatedAt: new Date().toISOString(),
    };

    cached = { data, timestamp: Date.now() };
    return NextResponse.json(data);
  } catch (error) {
    console.error("/api/admin/summary error", error);
    return NextResponse.json(
      { success: false, error: "Failed to load summary" },
      { status: 500 }
    );
  }
}
