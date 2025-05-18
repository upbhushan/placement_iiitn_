import { NextRequest, NextResponse } from "next/server";
import { Topic } from "@/lib/db/models/forum";
import mongoose from "mongoose";
import { redis } from "@/lib/redis";

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  try {
    // Unwrap params
    const params = await context.params;
    const topicId = params.id;
    
    const data = await req.json();
    const { userId } = data;

    // Validate userId exists
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Ensure MongoDB connection
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Toggle like status using the toggleLike method
    const result = await Topic.toggleLike(topicId, userId);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 404 });
    }

    // Re-fetch the updated topic
    const updatedTopic = await Topic.findById(topicId);
    
    if (!updatedTopic) {
      return NextResponse.json({ message: result.message }, { status: 404 });
    }
    
    // Convert to plain object
    const topicData = updatedTopic.toObject();
    
    // Check if user liked the topic and add the property to the plain object
    const isLiked = updatedTopic.isLikedByUser(userId);
    
    const responseData = {
      message: result.message,
      liked: result.liked,
      topic: {
        ...topicData,
        isLiked
      }
    };
    
    try {
      // Update Redis cache with the latest topic data
      // We store a version with the isLiked status for this specific user
      await redis.set(
        `topic:${topicId}:user:${userId}`, 
        JSON.stringify({ topic: responseData.topic }),
        { ex: 300 } // Note: Upstash uses lowercase 'ex' instead of 'EX'
      );
      
      // Also update the general topic cache without user-specific like status
      // First delete the existing cache to force a refresh
      await redis.del(`topic:${topicId}`);
      
      // Then cache the fresh topic data (without isLiked to keep it neutral)
      const generalTopicData = { ...topicData };
      // Use type assertion if isLiked exists as a dynamic property
      if ('isLiked' in generalTopicData) {
        delete (generalTopicData as any).isLiked; // Remove user-specific data
      }
      
      await redis.set(
        `topic:${topicId}`, 
        JSON.stringify({ topic: generalTopicData }),
        { ex: 300 } // Upstash uses lowercase 'ex'
      );
    } catch (err) {
      // Log error but continue - caching should not break core functionality
      console.error("Redis cache error:", err);
    }

    // Send response with the topic data and an explicit isLiked field
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error processing like:", error);
    return NextResponse.json({ error: "Failed to process like" }, { status: 500 });
  }
}