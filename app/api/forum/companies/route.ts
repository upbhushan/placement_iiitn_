import { NextRequest, NextResponse } from "next/server";
import { Topic } from "@/lib/db/models/forum";
import mongoose from "mongoose";
import { redis } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    // Create a cache key
    const cacheKey = "forum:companies:stats";
    
    try {
      // Try to get from Redis cache first
      const cached = await redis.get(cacheKey);
      if (cached) {
        // Parse if string, otherwise use directly
        const parsedData = typeof cached === 'string' 
          ? JSON.parse(cached) 
          : cached;
          
        return NextResponse.json({
          companies: parsedData,
          source: "cache"
        });
      }
    } catch (cacheError) {
      console.warn("Redis cache read error:", cacheError);
      // Continue with database query if cache fails
    }

    // If not in cache, connect to MongoDB
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Aggregate to get companies and their topic counts
    const companyStats = await Topic.aggregate([
      { $match: { isActive: true } }, // Only consider active topics
      { $group: { _id: "$company", count: { $sum: 1 } } }, // Group by company name and count
      { $project: { _id: 0, name: "$_id", count: 1 } }, // Reshape for better readability
      { $sort: { count: -1, name: 1 } } // Sort by count desc, then name asc
    ]);

    // Cache the result for 30 minutes (1800 seconds)
    // Company stats don't change very frequently so a longer TTL is appropriate
    try {
      await redis.set(cacheKey, JSON.stringify(companyStats), {
        ex: 1800 // Note: Upstash uses lowercase 'ex' instead of 'EX'
      });
    } catch (cacheError) {
      console.warn("Redis cache write error:", cacheError);
      // Continue even if caching fails
    }

    return NextResponse.json({ 
      companies: companyStats,
      source: "db" 
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

// Add a function to invalidate company stats when topics change
export async function invalidateCompanyCache() {
  try {
    await redis.del("forum:companies:stats");
    console.log("Company stats cache invalidated");
    return true;
  } catch (error) {
    console.error("Failed to invalidate company stats cache:", error);
    return false;
  }
}