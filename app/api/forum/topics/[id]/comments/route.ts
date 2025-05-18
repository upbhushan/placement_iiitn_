import { NextRequest, NextResponse } from "next/server";
import { Comment, Topic } from "@/lib/db/models/forum";
import mongoose from "mongoose";
import { redis } from "@/lib/redis";

export async function GET(
  req: NextRequest, 
  context: { params: { id: string } }
) {
  try {
    const { id: topicId } = await context.params;
    
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const lastCreatedAt = searchParams.get("lastCreatedAt");

    // Create a cache key that includes the query parameters
    const cacheKey = `comments:${topicId}:${limit}:${lastCreatedAt || 'initial'}`;
    
    try {
      // Try to get from Redis cache
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        // Parse the data if it's a string, otherwise use as is
        const parsed = typeof cachedData === 'string'
          ? JSON.parse(cachedData)
          : cachedData;
          
        return NextResponse.json({
          ...parsed,
          source: "cache"
        });
      }
    } catch (cacheError) {
      console.warn("Redis cache read error:", cacheError);
      // Continue with database query if cache fails
    }

    // Connect to DB if needed
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const query: any = { topicId, isActive: true };
    if (lastCreatedAt) {
      query.createdAt = { $lt: new Date(lastCreatedAt) };
    }

    const comments = await Comment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    const responseData = {
      comments,
      hasMore: comments.length === limit,
    };

    // Cache the result for 2 minutes (120 sec)
    // Use a shorter TTL for comments as they change more frequently
    try {
      await redis.set(cacheKey, JSON.stringify(responseData), {
        ex: 120 // Upstash uses lowercase 'ex' instead of 'EX'
      });
    } catch (cacheError) {
      console.warn("Redis cache write error:", cacheError);
      // Continue even if caching fails
    }

    return NextResponse.json({
      ...responseData,
      source: "db"
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest, 
  context: { params: { id: string } }
) {
  try {
    const { id: topicId } = await context.params;
    const data = await req.json();

    if (!data.content) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    // Connect to DB
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Create and save the comment
    const comment = new Comment({ ...data, topicId });
    await comment.save();

    // Update comment count on the topic
    await Topic.findByIdAndUpdate(
      topicId,
      { $inc: { commentsCount: 1 } }
    );

    // Invalidate related caches
    try {
      // 1. Delete all comment cache entries for this topic
      const commentKeys = await redis.keys(`comments:${topicId}:*`);
      for (const key of commentKeys) {
        await redis.del(key);
      }
      
      // 2. Delete topic cache as comment count has changed
      await redis.del(`topic:${topicId}`);
      
      // 3. Delete any user-specific topic caches
      const userKeys = await redis.keys(`topic:${topicId}:user:*`);
      for (const key of userKeys) {
        await redis.del(key);
      }
    } catch (cacheError) {
      console.warn("Redis cache invalidation error:", cacheError);
      // Continue even if cache invalidation fails
    }

    return NextResponse.json({ 
      message: "Comment added successfully", 
      comment 
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}