



// import { NextRequest, NextResponse } from "next/server";
// import { Topic } from "@/lib/models/student/forum";
// import mongoose from "mongoose";

// /**
//  * GET handler to fetch all topics with pagination and various filters
//  * Default sorting is by most recent
//  */
// export async function GET(req: NextRequest) {
//   try {
//     const searchParams = req.nextUrl.searchParams;
    
//     // Pagination parameters
//     const limit = parseInt(searchParams.get("limit") || "10");
//     const lastCreatedAt = searchParams.get("lastCreatedAt"); // For cursor-based pagination
    
//     // Filter parameters
//     const company = searchParams.get("company");
//     const tag = searchParams.get("tag");
//     const searchQuery = searchParams.get("search");
    
//     // Sort parameters (default to newest)
//     const sortBy = searchParams.get("sortBy") || "newest";
    
//     // Optional user ID for personalized responses
//     const userId = searchParams.get("userId");

//     // Ensure MongoDB connection
//     if (!mongoose.connections[0].readyState) {
//       await mongoose.connect(process.env.MONGODB_URI!);
//     }

//     // Build the query
//     const query: any = { isActive: true };
    
//     // Add cursor-based pagination
//     if (lastCreatedAt) {
//       query.createdAt = { $lt: new Date(lastCreatedAt) };
//     }
    
//     // Add optional filters
//     if (company) {
//       query.company = company;
//     }
    
//     if (tag) {
//       query.tags = tag;
//     }
    
//     if (searchQuery) {
//       query.$or = [
//         { title: { $regex: searchQuery, $options: 'i' } },
//         { content: { $regex: searchQuery, $options: 'i' } }
//       ];
//     }

//     // Determine sort order
//     let sortOptions: any = {};
//     switch (sortBy) {
//       case "oldest":
//         sortOptions.createdAt = 1;
//         break;
//       case "mostUpvoted":
//         sortOptions["upvotes.count"] = -1;
//         sortOptions.createdAt = -1;
//         break;
//       case "mostCommented":
//         sortOptions.commentsCount = -1;
//         sortOptions.createdAt = -1;
//         break;
//       case "newest":
//       default:
//         sortOptions.createdAt = -1;
//     }

//     // Fetch topics
//     const topics = await Topic.find(query)
//       .sort(sortOptions)
//       .limit(limit + 1); // Fetch one extra to determine if there are more

//     // Check if there are more topics to load
//     const hasMore = topics.length > limit;
//     if (hasMore) {
//       topics.pop(); // Remove the extra topic
//     }

//     // Process topics to add calculated fields and remove private data
//     const processedTopics = topics.map(topic => {
//       const topicObj = topic.toObject();
      
//       // Add calculated net votes
//       topicObj.netVotes = topic.upvotes.count - topic.downvotes.count;
      
//       // Add user's vote status if userId is provided
//       if (userId) {
//         topicObj.getUserVoteStatus = (userId)=> topic.getUserVoteStatus?.(userId) || 'none';
//       }
      
//     //   // Remove voter user lists for privacy
//     //   delete topicObj.upvotes.users;
//     //   delete topicObj.downvotes.users;
      
//       return topicObj;
//     });

//     // Return the processed topics
//     return NextResponse.json({
//       topics: processedTopics,
//       hasMore,
//       lastCreatedAt: topics.length > 0 ? topics[topics.length - 1].createdAt : null
//     });
//   } catch (error) {
//     console.error("Error fetching topics:", error);
//     return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
//   }
// }

// /**
//  * POST handler to create a new topic
//  */
// export async function POST(req: NextRequest) {
//   try {
//     const data = await req.json();

//     // Validate required fields
//     if (!data.title || !data.content || !data.createdBy) {
//       return NextResponse.json({ 
//         error: "Title, content, and creator information are required" 
//       }, { status: 400 });
//     }

//     // Ensure MongoDB connection
//     if (!mongoose.connections[0].readyState) {
//       await mongoose.connect(process.env.MONGODB_URI!);
//     }

//     // Create the new topic
//     const newTopic = new Topic({
//       title: data.title,
//       company: data.company,
//       content: data.content,
//       tags: data.tags || [],
//       images: data.images || [],
//       createdBy: {
//         userId: data.createdBy.userId,
//         name: data.createdBy.name,
//         email: data.createdBy.email
//       }
//     });

//     // Save to database
//     await newTopic.save();

//     return NextResponse.json({ 
//       message: "Topic created successfully", 
//       topic: newTopic 
//     }, { status: 201 });
//   } catch (error) {
//     console.error("Error creating topic:", error);
//     return NextResponse.json({ error: "Failed to create topic" }, { status: 500 });
//   }
// }