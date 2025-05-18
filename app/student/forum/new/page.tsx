"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast'; // Add toast if you haven't already

const NewTopicPage = () => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Debug session data
  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);
  }, [session, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication first
    if (status === "unauthenticated") {
      toast.error("Please sign in to create a post");
      router.push('/api/auth/signin');
      return;
    }
    
    if (status === "loading") {
      toast.error("Session is still loading, please try again");
      return;
    }
    
    setLoading(true);
    setError(null);

    if (!session?.user?.id || !session?.user?.name) {
      setError("User details not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      // Create FormData to handle the file upload
      const formData = new FormData();
      formData.append('title', title);
      formData.append('company', company);
      formData.append('content', content);
      
      // Add the creator info using NextAuth session data
      formData.append('createdBy', JSON.stringify({
        userId: session.user.id,
        name: session.user.name,
      }));
      
      // Only append image if one was selected
      if (image) {
        formData.append('image', image);
      }

      // Show loading toast
      const loadingToast = toast.loading("Creating your topic...");

      // Send form data to your backend API
      await axios.post('/api/forum', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("Topic created successfully!");
      
      router.push('/student/forum');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to create topic';
      setError(errorMessage);
      console.error("Error creating topic:", err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle image selection
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImage(null);
      setImagePreview(null);
      return;
    }

    // Set the file for later upload
    setImage(file);

    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // Remove image handler
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/student/forum">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Forum
        </Button>
      </Link>
      
      {/* Display Auth Status */}
      {status === "loading" && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded">
          <p>Loading authentication status...</p>
        </div>
      )}
      
      {status === "unauthenticated" && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded">
          <p className="font-medium">You need to be logged in to create a topic</p>
          <Button 
            onClick={() => router.push('/api/auth/signin')}
            variant="outline" 
            className="mt-2"
          >
            Sign In
          </Button>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Create a New Topic</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">              <div>
                <Label htmlFor="title">Title</Label>
                <div className="relative text-input-wrapper" style={{ marginTop: "4px", marginBottom: "4px" }}>
                  <Input
                    id="title"
                    placeholder="Enter topic title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
              </div>              <div>
                <Label htmlFor="company">Company</Label>
                <div className="relative text-input-wrapper" style={{ marginTop: "4px", marginBottom: "4px" }}>
                  <Input
                    id="company"
                    placeholder="Enter company name"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                  />
                </div>
              </div>              <div>
                <Label htmlFor="content">Content</Label>
                <div className="relative text-input-wrapper" style={{ marginTop: "4px", marginBottom: "4px" }}>
                  <Textarea
                    id="content"
                    placeholder="Write your topic content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              {/* Image Upload UI */}
              <div>
                <Label htmlFor="image" className="mb-2 block">Image (optional)</Label>
                {!imagePreview ? (
                  <div className="mt-1 flex items-center">
                    <label htmlFor="image" className="cursor-pointer flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-md p-4 w-full hover:border-blue-500 transition-colors">
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                      <span className="text-sm text-gray-500">Click to upload an image</span>
                      <Input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="mt-2 relative">
                    <div className="relative h-48 w-full rounded-md overflow-hidden">
                      <Image 
                        src={imagePreview}
                        alt="Preview"
                        fill 
                        style={{ objectFit: 'contain' }}
                        className="rounded-md"
                      />
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <p className="text-sm text-gray-500">
                        {image ? 'Image selected' : 'Preview only'}
                      </p>
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm" 
                        onClick={handleRemoveImage}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={loading || status !== "authenticated"}
                className="mt-2"
              >
                {loading ? 'Creating...' : 'Create Topic'}
              </Button>
              
              {error && <p className="text-red-500 mt-2">{error}</p>}
              
              {/* Show user info for debugging */}
              {status === "authenticated" && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm">
                  <p>Logged in as: {session?.user?.name}</p>
                  <p className="text-xs text-gray-500">User ID: {session?.user?.id}</p>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Debug info for development */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-gray-100 rounded-md text-sm">
          <details>
            <summary className="cursor-pointer font-medium">Debug Information</summary>
            <div className="mt-2">
              <p><strong>NextAuth Status:</strong> {status}</p>
              <p><strong>User ID:</strong> {session?.user?.id || "Not available"}</p>
              <p><strong>User Name:</strong> {session?.user?.name || "Not available"}</p>
              <pre className="mt-2 bg-gray-800 text-white p-3 rounded overflow-auto text-xs">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default NewTopicPage;