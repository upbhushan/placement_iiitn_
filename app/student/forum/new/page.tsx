"use client";

import React, { useState } from 'react';
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
import useStudentStore from '@/lib/store/userStore';
// Remove the import for uploadToCloudinary - we'll handle upload directly

const NewTopicPage = () => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { student } = useStudentStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!student || !student.id || !student.name) {
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
      
      // Add the creator info
      formData.append('createdBy', JSON.stringify({
        userId: student.id,
        name: student.name,
      }));
      
      // Only append image if one was selected
      if (image) {
        formData.append('image', image);
      }

      // Send form data to your backend API
      await axios.post('/api/forum', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      router.push('/student/forum');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create topic');
      console.error("Error creating topic:", err);
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
                disabled={loading || !student}
                className="mt-2"
              >
                {loading ? 'Creating...' : 'Create Topic'}
              </Button>
              
              {error && <p className="text-red-500 mt-2">{error}</p>}
              {!student && <p className="text-yellow-600 mt-2">Loading user details or not logged in...</p>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewTopicPage;