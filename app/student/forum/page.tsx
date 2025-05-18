"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Search, Plus, ThumbsUp } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// Types
interface Topic {
  _id: string;
  title: string;
  company: string;
  content: string;
  tags: string[];
  createdBy: {
    userId: string;
    name: string;
    email?: string;
  };
  likes: {
    count: number;
  };
  isLiked?: boolean;
  commentsCount: number;
  createdAt: string;
}

interface Company {
  name: string;
  count: number;
}

interface ForumPageProps {
  userId?: string;
}

// Create a client component that uses searchParams
function ForumContent() {
  // States
  const [topics, setTopics] = useState<Topic[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCreatedAt, setLastCreatedAt] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [activeCompany, setActiveCompany] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Fix the fetchTopics function to correctly update lastCreatedAt
  const fetchTopics = useCallback(
    async (refresh = false) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append("limit", "25");
        if (lastCreatedAt && !refresh) {
          params.append("lastCreatedAt", lastCreatedAt);
        }
        if (searchParams && searchParams.get("search")) {
          params.append("search", searchParams.get("search") || "");
        }
        if (activeCompany) {
          params.append("company", activeCompany);
        }

        const response = await axios.get("/api/forum", { params });
        const data = response.data;

        if (refresh) {
          setTopics(data.topics);
        } else {
          setTopics((prev) => [...prev, ...data.topics]);
        }

        // Fix 1: Get the last topic's createdAt for next pagination call
        if (data.topics && data.topics.length > 0) {
          const lastTopic = data.topics[data.topics.length - 1];
          setLastCreatedAt(lastTopic.createdAt);
          console.log("Next pagination point:", lastTopic.createdAt);
        }

        setHasMore(data.hasMore);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load topics");
        console.error("Topic loading error:", err);
      } finally {
        setLoading(false);
      }
    },
    [lastCreatedAt, searchParams, activeCompany]
  );

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      setCompaniesLoading(true);
      const response = await axios.get("/api/forum/companies");
      setCompanies(response.data.companies || []);
    } catch (err) {
      console.error("Failed to load companies:", err);
    } finally {
      setCompaniesLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchTopics(true);
  }, [fetchTopics, activeCompany]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput) {
      params.set("search", searchInput);
    }
    router.push(`/student/forum?${params.toString()}`);
  };

  // Handle company filter
  const handleCompanyClick = (companyName: string) => {
    if (activeCompany === companyName) {
      setActiveCompany(null); // Clear filter if already active
    } else {
      setActiveCompany(companyName);
    }
    setLastCreatedAt(null); // Reset pagination when changing filter
  };

  // Replace your loadMoreTopics function with this improved version:
  const loadMoreTopics = async () => {
    if (loading || loadingMore) return;
    
    try {
      setLoadingMore(true);
      console.log("Loading more topics with lastCreatedAt:", lastCreatedAt);
      
      const params = new URLSearchParams();
      params.append("limit", "10");
      
      if (lastCreatedAt) {
        params.append("lastCreatedAt", lastCreatedAt);
      }
      
      if (activeCompany) {
        params.append("company", activeCompany);
      }
      
      // Add search param if present
      if (searchParams?.get("search")) {
        params.append("search", searchParams.get("search") || "");
      }
      
      const response = await axios.get("/api/forum", { params });
      console.log("Pagination response:", response.data);
      
      // Force re-render with the new data
      if (response.data.topics && response.data.topics.length > 0) {
        // Important: Create a completely new array for React to detect changes
        const newTopics = [...topics, ...response.data.topics];
        console.log("Updated topics array length:", newTopics.length);
        
        // Set the topics first to ensure UI updates
        setTopics(newTopics);
        
        // Then update pagination state
        const lastTopic = response.data.topics[response.data.topics.length - 1];
        if (lastTopic && lastTopic.createdAt) {
          setLastCreatedAt(lastTopic.createdAt);
          console.log("Next pagination point set to:", lastTopic.createdAt);
        } else {
          console.warn("Unable to find last topic's createdAt for pagination");
        }
        
        setHasMore(!!response.data.hasMore);
        
        // Force scroll to trigger re-render if needed
        window.scrollBy(0, 1);
      } else {
        // No more topics available
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more topics:", error);
      toast.error("Failed to load more topics. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 bg-card rounded-xl p-5 shadow-md border border-secondary/10">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-primary/80 to-primary p-3 rounded-lg shadow-sm text-primary-foreground">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Forum Discussions</h1>
            <p className="text-muted-foreground">Share and discuss placement experiences with your peers</p>
          </div>
        </div>
        <Link href="/student/forum/new">
          <Button className="shadow-sm hover:shadow-md transition-all bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Start New Discussion
          </Button>
        </Link>
      </div>

      <div className="flex gap-6">
        {/* Company Sidebar */}
        <div className="w-72 shrink-0">
          <Card className="sticky top-4 shadow-sm border-secondary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-building-2"><path d="M6 22V2a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v20"/><path d="M12 13V7"/><path d="M10 13h4"/><path d="M10 7h4"/><path d="M6 22H4a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1h3"/><path d="M18 22h3a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1h-3"/></svg>
                Companies
              </CardTitle>
              <CardDescription>Filter discussions by company</CardDescription>
            </CardHeader>
            <CardContent className="px-2 pb-4 pt-0">
              {companiesLoading ? (
                <div className="space-y-2 p-2">
                  <Skeleton className="h-9 w-full rounded-md" />
                  <Skeleton className="h-9 w-full rounded-md" />
                  <Skeleton className="h-9 w-full rounded-md" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              ) : (
                <div className="space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto pr-1 custom-scrollbar">
                  {companies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mb-2"><path d="M16.5 9.4 7.55 4.24"></path><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>
                      <p className="text-sm text-muted-foreground">
                        No companies found
                      </p>
                    </div>
                  ) : (
                    <div className="px-1">
                      {/* All topics option */}
                      <Button
                        variant={activeCompany === null ? "secondary" : "ghost"}
                        className="w-full justify-between text-left rounded-md mb-1 font-medium"
                        onClick={() => setActiveCompany(null)}
                      >
                        <span className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layers"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                          All Companies
                        </span>
                        <Badge variant={activeCompany === null ? "secondary" : "outline"} className="ml-auto">
                          {companies.reduce(
                            (acc, company) => acc + company.count,
                            0
                          )}
                        </Badge>
                      </Button>

                      <Separator className="my-2" />

                      {companies.map((company) => (
                        <Button
                          key={company.name}
                          variant={
                            activeCompany === company.name
                              ? "secondary"
                              : "ghost"
                          }
                          className="w-full justify-between text-left rounded-md mb-1"
                          onClick={() => handleCompanyClick(company.name)}
                        >
                          <span className="truncate max-w-[160px]">{company.name}</span>
                          <Badge variant={activeCompany === company.name ? "secondary" : "outline"} className="ml-auto">
                            {company.count}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative forum-search-wrapper shadow-sm">
              <Input
                type="text"
                placeholder="Search forum discussions..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-4 h-11 bg-background dark:bg-background/40 border-secondary/30 focus-visible:border-primary/50"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="search-button"
                aria-label="Search topics"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {searchParams?.get("search") && (
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <span>Searching for: </span>
                <Badge variant="secondary" className="ml-2 font-normal">
                  {searchParams.get("search")}
                </Badge>
                <Button 
                  onClick={() => router.push("/student/forum")} 
                  variant="link" 
                  className="text-xs h-auto p-0 pl-2"
                  size="sm"
                >
                  Clear
                </Button>
              </div>
            )}
          </form>
          {/* Filter indicator */}
          {activeCompany && (
            <div className="mb-4 flex items-center bg-secondary/20 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 flex-1">
                <Badge variant="secondary" className="px-2 py-1">
                  {activeCompany}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Showing topics from this company
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveCompany(null)}
                className="hover:bg-secondary/30"
              >
                Clear filter
              </Button>
            </div>
          )}
          {/* Topics List */}
          {loading && topics.length === 0 ? (
            <Card>
              <CardContent className="p-8 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-t-primary border-r-transparent border-b-primary border-l-transparent animate-spin mb-4"></div>
                <p className="text-muted-foreground">Loading forum discussions...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-destructive/30">
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <p className="text-destructive font-medium mb-2">Error</p>
                <p className="text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          ) : (
            <div key={`topics-list-${new Date().getTime()}`}>
              {topics.length === 0 ? (
                <Card>
                  <CardContent className="p-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <MessageSquare className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No discussions found</h3>
                    <p className="text-muted-foreground mb-6">
                      {activeCompany
                        ? `No topics have been posted for ${activeCompany} yet.`
                        : "No topics have been posted yet in this forum."}
                    </p>
                    <Link href="/student/forum/new">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Start a discussion
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                topics.map((topic) => (
                  <Card 
                    key={topic._id} 
                    className={`mb-4 overflow-hidden border group hover:border-primary/30 hover:shadow-md transition-all duration-200
                      ${topic.likes?.count > 5 ? 'topic-card-popular' : ''}
                      ${topic.commentsCount > 10 ? 'topic-card-trending' : ''}
                    `}
                  >
                    <CardHeader className="pb-2 pt-4 px-5">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="px-2 py-1 bg-secondary/30 text-xs font-medium">
                          {topic.company}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(topic.createdAt))}{" "}
                          ago
                        </div>
                      </div>
                      <CardTitle className="mt-2 group-hover:text-primary transition-colors">
                        <Link
                          href={`/student/forum/${topic._id}`}
                          className="hover:underline text-lg"
                        >
                          {topic.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6 border">
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {topic.createdBy.name[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{topic.createdBy.name}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2 px-5">
                      <p className="line-clamp-2 text-muted-foreground">{topic.content}</p>
                      {topic.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {topic.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs px-2 py-0 h-5 bg-secondary/10 hover:bg-secondary/20 transition-colors"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between items-center py-3 px-5 bg-muted/20 border-t">
                      {/* Like count display (not clickable) */}
                      <div className="flex items-center text-muted-foreground">
                        <div className="bg-background rounded-full p-1 mr-1.5">
                          <ThumbsUp
                            className={`w-3.5 h-3.5 ${
                              topic.isLiked ? "fill-blue-600 text-blue-600" : ""
                            }`}
                          />
                        </div>
                        <span className="text-sm">
                          {topic.likes?.count || 0}{" "}
                          {topic.likes?.count === 1 ? "Like" : "Likes"}
                        </span>
                      </div>

                      {/* Comments link (remains clickable) */}
                      <Link
                        href={`/student/forum/${topic._id}`}
                        className="flex items-center text-muted-foreground hover:text-primary transition-colors group"
                      >
                        <div className="bg-background rounded-full p-1 mr-1.5 group-hover:bg-primary/10">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm">
                          {topic.commentsCount || 0}{" "}
                          {topic.commentsCount === 1 ? "Comment" : "Comments"}
                        </span>
                      </Link>
                    </CardFooter>
                  </Card>
                ))
              )}
              {hasMore && (
                <Button
                  onClick={loadMoreTopics}
                  disabled={loading || loadingMore}
                  variant="outline"
                  className="w-full mt-4 py-2"
                >
                  {loadingMore ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-t-primary border-r-transparent border-b-primary border-l-transparent animate-spin mr-2"></div>
                      <span>Loading more discussions...</span>
                    </div>
                  ) : (
                    "View More Discussions"
                  )}
                </Button>
              )}

              {/* Add this at the end of your list to show when all topics are loaded */}
              {!hasMore && topics.length > 0 && (
                <div className="text-center text-muted-foreground mt-4 py-2">
                  You've reached the end of the discussions
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Create a wrapper component for the page
export default function ForumPage({ userId = "guest" }: { userId?: string }) {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 bg-card rounded-xl p-5 shadow-md border border-secondary/10">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-primary/80 to-primary p-3 rounded-lg shadow-sm text-primary-foreground">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Forum Discussions</h1>
              <p className="text-muted-foreground">Share and discuss placement experiences with your peers</p>
            </div>
          </div>
          <div className="h-10 w-40 bg-muted animate-pulse rounded-md"></div>
        </div>
        <div className="w-full h-[500px] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-4 border-t-primary border-r-transparent border-b-primary border-l-transparent animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading forum...</p>
          </div>
        </div>
      </div>
    }>
      <ForumContent />
    </Suspense>
  );
}
