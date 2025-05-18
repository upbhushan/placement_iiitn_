"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ThumbsUp,
  ArrowLeft,
  Send,
  MessageCircle,
  Share2,
  Copy,
} from "lucide-react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Image from "next/image";
// UI components imports remain the same
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useStudentStore from "@/lib/store/userStore";

// Define the TopicDetailPageProps type
type TopicDetailPageProps = {
  id: string;
};

// Updated Topic interface to match the new like system
interface Topic {
  _id: string;
  title: string;
  company: string;
  content: string;
  createdBy: {
    userId: string;
    name: string;
  };
  likes: {
    count: number;
  };
  isLiked?: boolean;
  commentsCount: number;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];

  images?: string[];
}

interface Comment {
  _id: string;
  content: string;
  topicId: string;
  createdBy: {
    userId: string;
    name: string;
    photo?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export default function TopicDetailPage({ id }: TopicDetailPageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { student } = useStudentStore();

  // Get user ID from session or zustand store
  const userId = student?.id || session?.user?.id || null;
  const userName = student?.name || session?.user?.name || "Anonymous User";

  // State
  const [topic, setTopic] = useState<Topic | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCommentDate, setLastCommentDate] = useState<string | null>(null);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [newComment, setNewComment] = useState("");

  // Fetch topic data
  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/forum/topics/${id}`, {
          params: { userId },
        });

        setTopic(response.data.topic);
      } catch (err: any) {
        console.error("Error loading topic:", err);
        if (err.response?.status === 404) {
          setError("Topic not found");
        } else {
          setError("Failed to load topic. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTopic();
    }
  }, [id, userId]);

  // Fetch comments - Keep this unchanged
  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return;

      try {
        setCommentsLoading(true);
        const response = await axios.get(`/api/forum/topics/${id}/comments`, {
          params: {
            limit: 10,
          },
        });

        setComments(response.data.comments || []);
        setHasMoreComments(response.data.hasMore || false);

        if (response.data.comments && response.data.comments.length > 0) {
          const lastComment =
            response.data.comments[response.data.comments.length - 1];
          setLastCommentDate(lastComment.createdAt);
        }
      } catch (error) {
        console.error("Error loading comments:", error);
      } finally {
        setCommentsLoading(false);
      }
    };

    if (topic && !error) {
      fetchComments();
    }
  }, [id, topic, error]);

  const loadMoreComments = async () => {
    // Keep this function unchanged
    if (!id || !lastCommentDate || !hasMoreComments) return;

    try {
      setCommentsLoading(true);
      const response = await axios.get(`/api/forum/topics/${id}/comments`, {
        params: {
          limit: 10,
          lastCreatedAt: lastCommentDate,
        },
      });

      setComments((prevComments) => [
        ...prevComments,
        ...response.data.comments,
      ]);
      setHasMoreComments(response.data.hasMore || false);

      if (response.data.comments && response.data.comments.length > 0) {
        const lastComment =
          response.data.comments[response.data.comments.length - 1];
        setLastCommentDate(lastComment.createdAt);
      }
    } catch (error) {
      console.error("Error loading more comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  // NEW: Handle like toggle (replaces handleVote)
  const handleLikeToggle = async () => {
    // Check authentication
    if (status === "unauthenticated" || !userId) {
      router.push("/api/auth/signin");
      return;
    }

    try {
      const response = await axios.post(`/api/forum/topics/${id}/vote`, {
        userId,
      });

      // Update the topic with the response data
      if (response.data.topic) {
        setTopic(response.data.topic);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      toast.error("Failed to process your like. Please try again.");
    }
  };

  // NEW: Handle share functionality
  const handleShare = async (method: string) => {
    const shareUrl = `${window.location.origin}/student/forum/${id}`;

    switch (method) {
      case "copy":
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast.success("Link copied to clipboard!");
        } catch (err) {
          console.error("Failed to copy link:", err);
          toast.error("Failed to copy link. Please try again.");
        }
        break;

      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            `Check out this post: ${shareUrl}`
          )}`,
          "_blank"
        );
        break;

      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            shareUrl
          )}`,
          "_blank"
        );
        break;

      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            `Check out this post: ${shareUrl}`
          )}`,
          "_blank"
        );
        break;
    }
  };

  const handleAddComment = async () => {
    if (status === "unauthenticated" || !userId) {
      router.push("/api/auth/signin");
      return;
    }

    try {
      const response = await axios.post(`/api/forum/topics/${id}/comments`, {
        content: newComment,
        createdBy: {
          userId,
          name: userName,
        },
      });

      // Add the new comment to the beginning of the comments array
      setComments((prev) => [response.data.comment, ...prev]);

      // Update the topic's commentsCount by incrementing it
      setTopic((prevTopic) => {
        if (!prevTopic) return null;
        return {
          ...prevTopic,
          commentsCount: (prevTopic.commentsCount || 0) + 1,
        };
      });

      // Clear the comment input
      setNewComment("");

      // Show success toast
      toast.success("Comment added successfully!");
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error("Failed to add your comment. Please try again.");
    }
  };

  // Leave all the imports and functions as they are, just replace the return section:

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/student/forum">
          <Button variant="ghost" className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to forum
          </Button>
        </Link>
      </div>

      {/* Topic card */}
      <Card className="border">
        <CardHeader className="pb-2">
          <CardTitle>{topic?.title}</CardTitle>
          <div className="flex items-center text-sm text-gray-500">
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded mr-2">
              {topic?.company}
            </span>
            <span>
              Posted by {topic?.createdBy?.name} •{" "}
              {topic?.createdAt
                ? formatDistanceToNow(new Date(topic.createdAt))
                : ""}{" "}
              ago
            </span>
          </div>
        </CardHeader>

        <CardContent>
          {/* Format the content properly with markdown styling */}
          <div className="prose dark:prose-invert max-w-none">
            {topic?.content && (
              <div className="whitespace-pre-wrap">
                {topic.content.split('\n\n').map((paragraph, idx) => {
                  // Handle headers (lines starting with #)
                  if (paragraph.startsWith('# ')) {
                    return <h1 key={idx} className="text-2xl font-bold mt-4 mb-2">{paragraph.substring(2)}</h1>;
                  } else if (paragraph.startsWith('## ')) {
                    return <h2 key={idx} className="text-xl font-bold mt-4 mb-2">{paragraph.substring(3)}</h2>;
                  } else if (paragraph.startsWith('### ')) {
                    return <h3 key={idx} className="text-lg font-bold mt-3 mb-2">{paragraph.substring(4)}</h3>;
                  }
                  
                  // Handle lists
                  else if (paragraph.includes('\n- ')) {
                    const listItems = paragraph.split('\n- ');
                    const title = listItems.shift(); // First part might be a title
                    
                    return (
                      <div key={idx}>
                        {title && title.trim() !== '' && <p className="mb-2">{title}</p>}
                        <ul className="list-disc pl-6 space-y-1 mb-4">
                          {listItems.map((item, itemIdx) => (
                            <li key={itemIdx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  
                  // Regular paragraphs
                  else {
                    return <p key={idx} className="mb-4">{paragraph}</p>;
                  }
                })}
              </div>
            )}
          </div>

          {/* Display images from the images array */}
          {topic?.images && topic.images.length > 0 && (
            <div className="mt-6 mb-4">
              <div className="flex flex-wrap gap-3">
                {topic.images.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="relative h-64 w-full sm:w-[calc(50%-6px)] lg:w-[calc(33.33%-8px)] rounded-md overflow-hidden border"
                  >
                    <Image
                      src={imageUrl}
                      alt={`Topic image ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain"
                      onError={(e) => {
                        console.error("Image failed to load:", imageUrl);
                        // Replace with a placeholder image
                        (e.target as HTMLImageElement).src =
                          "/placeholder-image.png";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            {topic?.tags?.map((tag) => (
              <Button key={tag} variant="secondary" size="sm">
                {tag}
              </Button>
            ))}
          </div>
        </CardContent>

        {/* Simplified action bar with only Like and Share at bottom left */}
        <CardFooter className="flex border-t pt-3">
          <div className="flex space-x-4">
            {/* Like button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeToggle}
              className={`flex items-center hover:bg-transparent ${
                topic?.isLiked ? "text-blue-600" : ""
              }`}
              disabled={status === "unauthenticated" || !userId}
              title={
                status === "unauthenticated" ? "Please sign in to like" : ""
              }
            >
              <ThumbsUp
                className={`h-5 w-5 mr-1.5 ${
                  topic?.isLiked ? "fill-blue-600" : ""
                }`}
              />
              <span>{topic?.likes?.count || 0}</span>
            </Button>

            {/* Share dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center hover:bg-transparent"
                >
                  <Send className="h-5 w-5 mr-1.5" />
                  <span>Share</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleShare("copy")}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("whatsapp")}>
                  Share to WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("linkedin")}>
                  Share to LinkedIn
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("twitter")}>
                  Share to Twitter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Comment count as text only */}
          <div className="text-sm text-muted-foreground flex items-center ml-auto">
            <MessageCircle className="h-4 w-4 mr-1.5" />
            <span>
              {topic?.commentsCount || 0}{" "}
              {topic?.commentsCount === 1 ? "Comment" : "Comments"}
            </span>
          </div>
        </CardFooter>
      </Card>

      {/* Comment form */}      <div className="mt-8" id="comment-form">
        <Label htmlFor="comment">Leave a comment</Label>
        <div className="relative text-input-wrapper" style={{ marginBottom: "12px", marginTop: "4px" }}>
          <Textarea
            id="comment"
            placeholder={
              status === "unauthenticated"
                ? "Please sign in to comment"
                : "Write your comment..."
            }
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-2"
            disabled={status === "unauthenticated" || !userId}
          />
        </div>
        <Button
          onClick={handleAddComment}
          disabled={
            !newComment.trim() || status === "unauthenticated" || !userId
          }
        >
          <Send className="w-4 h-4 mr-1" />
          {status === "unauthenticated" ? "Sign In to Comment" : "Post Comment"}
        </Button>

        {status === "unauthenticated" && (
          <div className="mt-2 text-sm text-gray-500">
            <Link
              href="/api/auth/signin"
              className="text-blue-600 hover:underline"
            >
              Sign in
            </Link>{" "}
            to post comments and like topics.
          </div>
        )}
      </div>

      {/* Comments section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          <MessageCircle className="inline-block w-5 h-5 mr-2" />
          Comments ({topic?.commentsCount || 0})
        </h2>

        {comments.length === 0 && !commentsLoading && (
          <div className="py-4 text-center text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        )}

        {comments.map((comment) => (
          <Card key={comment._id} className="mb-4 border">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage src="/default-avatar.png" />
                  <AvatarFallback>
                    {comment.createdBy.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{comment.createdBy.name}</p>
                      <p className="text-xs text-gray-500">
                        {comment.createdAt
                          ? formatDistanceToNow(new Date(comment.createdAt))
                          : ""}{" "}
                        ago
                      </p>
                    </div>
                  </div>
                  <p className="mt-2">{comment.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {commentsLoading && (
          <div className="py-4 text-center">
            <div className="spinner"></div>
            <p>Loading comments...</p>
          </div>
        )}

        {hasMoreComments && !commentsLoading && (
          <Button
            variant="outline"
            onClick={loadMoreComments}
            className="w-full mt-2"
          >
            Load More Comments
          </Button>
        )}
      </div>
    </div>
  );
}
