import { NextRequest, NextResponse } from "next/server";
import { Topic } from "@/lib/db/models/forum";
import mongoose from "mongoose";
import { redis } from "@/lib/redis"

/**
 * GET handler to fetch a single topic by ID with essential data
 */
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id: topicId } = await context.params;
    const userId = req.nextUrl.searchParams.get("userId");

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return NextResponse.json(
        { error: "Invalid topic ID format" },
        { status: 400 }
      );
    }

    // 1. Try user-specific Redis cache first if userId is provided
    if (userId) {
      const userCacheKey = `topic:${topicId}:user:${userId}`;
      const userCached = await redis.get(userCacheKey);
      
      if (userCached) {
        const parsed = typeof userCached === 'string' 
          ? JSON.parse(userCached) 
          : userCached;
        
        // Increment view count asynchronously without awaiting (for performance)
        // This ensures we still count views even when serving from cache
        Topic.findByIdAndUpdate(topicId, { $inc: { viewsCount: 1 } })
          .catch(err => console.error("Error incrementing view count:", err));
          
        return NextResponse.json({
          topic: parsed.topic,
          source: "cache",
        });
      }
    }
    
    // 2. Try general Redis cache if no user-specific cache found
    const generalCacheKey = `topic:${topicId}`;
    const generalCached = await redis.get(generalCacheKey);
    
    // If general cache exists and no userId provided, we can use it
    if (generalCached && !userId) {
      const parsed = typeof generalCached === 'string' 
        ? JSON.parse(generalCached) 
        : generalCached;
      
      // Increment view count asynchronously
      Topic.findByIdAndUpdate(topicId, { $inc: { viewsCount: 1 } })
        .catch(err => console.error("Error incrementing view count:", err));
      
      return NextResponse.json({
        topic: parsed.topic,
        source: "cache",
      });
    }

    // 3. Connect to DB if cache miss
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const topic = await Topic.findById(topicId);
    if (!topic || !topic.isActive) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Increment view count
    await Topic.findByIdAndUpdate(topicId, { $inc: { viewsCount: 1 } });

    const topicData: { [key: string]: any; isLiked?: boolean } =
      topic.toObject();

    // Add like status if userId provided
    if (userId) {
      try {
        if (typeof topic.isLikedByUser === "function") {
          topicData.isLiked = topic.isLikedByUser(userId);
        } else {
          topicData.isLiked = (topic.likes?.users || []).some(
            (id) => id.toString() === userId.toString()
          );
        }
      } catch (err) {
        console.error("Error checking like status:", err);
        topicData.isLiked = false;
      }
    }

    const responseData = {
      topic: topicData,
    };

    // 4. Cache the result - both user-specific and general caches
    // Store in Redis for 5 minutes (300 sec)
    const cachePromises = [];
    
    // Save user-specific cache if userId provided
    if (userId) {
      cachePromises.push(
        redis.set(
          `topic:${topicId}:user:${userId}`, 
          JSON.stringify(responseData),
          { ex: 300 } // Note: Upstash uses lowercase 'ex' instead of 'EX'
        )
      );
    }
    
    // Save general cache (without isLiked field)
    const generalCacheData = {
      topic: { ...topicData }
    };
    
    // Remove user-specific data from general cache
    if (generalCacheData.topic.isLiked !== undefined) {
      delete generalCacheData.topic.isLiked;
    }
    
    cachePromises.push(
      redis.set(
        generalCacheKey,
        JSON.stringify(generalCacheData),
        { ex: 300 } // Note: Upstash uses lowercase 'ex' instead of 'EX'
      )
    );
    
    // Execute all cache operations in parallel
    try {
      await Promise.allSettled(cachePromises);
    } catch (err) {
      console.error("Error caching topic data:", err);
      // Continue even if caching fails
    }

    return NextResponse.json({ ...responseData, source: "db" });
  } catch (error) {
    console.error(`Error fetching topic:`, error);
    return NextResponse.json(
      { error: "Failed to fetch topic" },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler to update a topic
 */
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params;
    const topicId = params.id;

    const data = await req.json();

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No update data provided" },
        { status: 400 }
      );
    }

    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const allowedUpdates = {
      title: data.title,
      content: data.content,
      company: data.company,
      tags: data.tags,
      isActive: data.isActive,
      isPinned: data.isPinned,
    };

    const updates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([_, v]) => v !== undefined)
    );

    const updatedTopic = await Topic.findByIdAndUpdate(
      topicId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedTopic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Invalidate all caches related to this topic
    try {
      // Delete the general topic cache
      await redis.del(`topic:${topicId}`);
      
      // Get all user-specific cache keys and delete them
      // With Upstash, we need to handle multi-deletion differently
      const userCacheKeys = await redis.keys(`topic:${topicId}:user:*`);
      
      // Delete each key individually
      for (const key of userCacheKeys) {
        await redis.del(key);
      }
    } catch (err) {
      console.error("Error invalidating topic caches:", err);
    }

    return NextResponse.json({
      message: "Topic updated successfully",
      topic: updatedTopic,
    });
  } catch (error) {
    console.error(`Error updating topic:`, error);
    return NextResponse.json(
      { error: "Failed to update topic" },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler to remove a topic
 */
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params;
    const topicId = params.id;

    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const deletedTopic = await Topic.findByIdAndUpdate(
      topicId,
      { isActive: false },
      { new: true }
    );
    
    if (!deletedTopic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Invalidate all caches related to this topic
    try {
      // Delete general topic cache
      await redis.del(`topic:${topicId}`);
      
      // Delete user-specific topic caches
      const userCacheKeys = await redis.keys(`topic:${topicId}:user:*`);
      for (const key of userCacheKeys) {
        await redis.del(key);
      }
      
      // Delete comment caches for this topic
      const commentCacheKeys = await redis.keys(`comments:${topicId}:*`);
      for (const key of commentCacheKeys) {
        await redis.del(key);
      }
    } catch (err) {
      console.error("Error invalidating topic caches:", err);
    }

    return NextResponse.json({ message: "Topic deleted successfully" });
  } catch (error) {
    console.error(`Error deleting topic:`, error);
    return NextResponse.json(
      { error: "Failed to delete topic" },
      { status: 500 }
    );
  }
}