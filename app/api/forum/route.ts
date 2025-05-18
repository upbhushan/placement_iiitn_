import { NextRequest, NextResponse } from "next/server";
import { Topic } from "@/lib/db/models/forum";
import mongoose from "mongoose";
import { redis } from "@/lib/redis";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload to Cloudinary
async function uploadToCloudinary(
  buffer: ArrayBuffer,
  folder: string = "forum"
) {
  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result!.secure_url);
      }
    );

    // Convert ArrayBuffer to Buffer for Cloudinary stream
    const uint8Array = new Uint8Array(buffer);
    const nodeBuffer = Buffer.from(uint8Array);

    // Write buffer to stream
    const Readable = require("stream").Readable;
    const readableStream = new Readable();
    readableStream.push(nodeBuffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10"); // Number of topics to fetch
    const lastCreatedAt = searchParams.get("lastCreatedAt"); // Timestamp of the last loaded topic

    // Create a cache key based on the query parameters
    const cacheKey = `topics:${limit}:${lastCreatedAt || "initial"}`;

    try {
      // Try to get from Redis cache first
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        // Parse the data if it's a string, otherwise use as is
        const parsed =
          typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;

        return NextResponse.json({
          ...parsed,
          source: "cache",
        });
      }
    } catch (cacheError) {
      console.warn("Redis cache read error:", cacheError);
      // Continue with database query if cache fails
    }

    // Ensure MongoDB connection
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Build query for lazy loading
    const query: any = { isActive: true };
    if (lastCreatedAt) {
      // Fetch topics created before the last timestamp
      query.createdAt = { $lt: new Date(lastCreatedAt) };
    }

    // Fetch topics
    const topics = await Topic.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .limit(limit);

    const responseData = {
      topics,
      hasMore: topics.length === limit, // Indicate if there are more topics to load
      lastCreatedAt:
        topics.length > 0 ? topics[topics.length - 1].createdAt : null,
    };

    // Cache the result for 2 minutes (120 seconds)
    try {
      await redis.set(cacheKey, JSON.stringify(responseData), {
        ex: 120, // Upstash uses lowercase 'ex'
      });
    } catch (cacheError) {
      console.warn("Redis cache write error:", cacheError);
      // Continue even if caching fails
    }

    return NextResponse.json({
      ...responseData,
      source: "db",
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse as FormData instead of JSON
    const formData = await req.formData();

    // Extract basic fields
    const title = formData.get("title") as string | null;
    const company = formData.get("company") as string | null;
    const content = formData.get("content") as string | null;
    const createdByString = formData.get("createdBy") as string | null;
    const imageFile = formData.get("image") as File | null;

    // Validate required fields
    if (!title || !content || !company) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Parse createdBy from JSON string
    let createdBy;
    try {
      if (createdByString) {
        createdBy = JSON.parse(createdByString);
      }
    } catch (parseError) {
      console.error("Error parsing createdBy JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid user data format" },
        { status: 400 }
      );
    }

    // Ensure MongoDB connection
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Prepare topic data
    const topicData: any = {
      title,
      company,
      content,
      createdBy,
    };

    // Handle image if present
    if (imageFile) {
      try {
        // Convert File to buffer for upload
        const buffer = await imageFile.arrayBuffer();

        // Upload to Cloudinary
        const imageUrl = await uploadToCloudinary(buffer);

        // Store the URL in the images array to match schema
        topicData.images = [imageUrl];

        console.log(`Image uploaded to Cloudinary: ${imageUrl}`);
      } catch (uploadError) {
        console.error("Error uploading image to Cloudinary:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }
    }

    // Create and save topic
    const topic = new Topic(topicData);
    await topic.save();

    // Invalidate caches after creating a new topic
    try {
      // 1. Invalidate company stats cache since a new topic affects company counts
      await redis.del("forum:companies:stats");

      // 2. Invalidate topic list caches - we're using pattern matching here
      const topicCacheKeys = await redis.keys("topics:*");
      for (const key of topicCacheKeys) {
        await redis.del(key);
      }

      console.log("Cache invalidated after creating new topic");
    } catch (cacheError) {
      console.warn("Cache invalidation error:", cacheError);
      // Continue even if cache invalidation fails
    }

    return NextResponse.json(
      { message: "Topic created successfully", topic },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating topic:", error);
    return NextResponse.json(
      {
        error: "Failed to create topic",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
