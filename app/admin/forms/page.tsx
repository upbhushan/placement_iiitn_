"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PlusCircle, Eye, Edit3, Trash2, Share2, FileDown } from 'lucide-react';
import { FormTemplateInterface } from '@/lib/db/models/formTemplate'; // Assuming this is the correct interface
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Define a type for the forms fetched from the API, including string _id
interface FetchedForm extends Omit<FormTemplateInterface, '_id' | 'adminId' | 'fields' | 'colorScheme' | 'sharedWith' | 'createdAt' | 'updatedAt'> {
  _id: string;
  name: string;
  description?: string;
  published: boolean;
  createdAt: string; // Dates will likely be strings from JSON
  updatedAt: string;
  fieldCount: number; // Add a count of fields
}

export default function AdminFormsListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [forms, setForms] = useState<FetchedForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null); // Stores ID of form to delete

  const fetchForms = useCallback(async () => {
    if (session?.user?.role === 'admin') {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/forms');
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to fetch forms');
        }
        const data = await response.json();
        setForms(data.forms.map((form: FormTemplateInterface) => ({
            ...form,
            _id: form._id.toString(), // Ensure _id is a string
            fieldCount: form.fields.length,
            createdAt: new Date(form.createdAt).toLocaleDateString(),
            updatedAt: new Date(form.updatedAt).toLocaleDateString(),
        })));
      } catch (err: any) {
        setError(err.message);
        toast.error("Error fetching forms", { description: err.message });
      } finally {
        setLoading(false);
      }
    }
  }, [session]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchForms();
    } else if (status === 'unauthenticated') {
      router.replace('/auth/signin'); // Or your admin login page
    }
  }, [status, session, router, fetchForms]);

  const handleDeleteForm = async (formId: string) => {
    try {
      const response = await fetch(`/api/admin/forms/${formId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete form');
      }
      toast.success('Form deleted successfully!');
      fetchForms(); // Refresh the list
    } catch (err: any) {
      toast.error('Failed to delete form', { description: err.message });
    }
    setShowDeleteConfirm(null); // Close confirmation dialog
  };

  const handleShareLink = (formId: string) => {
    const shareUrl = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => toast.success('Share link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy link.'));
  };
  
  const handleExportResponses = async (formId: string, formName: string) => {
    try {
        const response = await fetch(`/api/admin/forms/${formId}/export`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Unknown error during export." }));
            toast.error("Export failed", { description: errorData.message || errorData.error || "Could not retrieve file." });
            return;
        }
        const blob = await response.blob();
        const safeFormName = formName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${safeFormName}_responses_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);

        toast.success("Responses exported successfully!");

    } catch (err: any) {
        toast.error("Export failed", { description: err.message || "An unexpected error occurred." });
    }
  };


  if (status === 'loading' || (status === 'authenticated' && loading && session?.user?.role === 'admin')) {
    return <div className="flex justify-center items-center min-h-screen">Loading forms...</div>;
  }
  if (error && session?.user?.role === 'admin') {
    return <div className="text-red-500 text-center py-10">Error loading forms: {error}</div>;
  }
  if (status !== 'authenticated' || session?.user?.role !== 'admin') {
     // Router replace handles redirection, this is a fallback or for initial render before redirect
    return <div className="flex justify-center items-center min-h-screen">Redirecting...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manage Forms</h1>
        <Link href="/admin/forms/new">
          <Button>
            <PlusCircle size={20} className="mr-2" /> Create New Form
          </Button>
        </Link>
      </div>

      {forms.length === 0 && !loading && (
        <Card className="text-center py-10">
            <CardHeader>
                <CardTitle>No Forms Yet</CardTitle>
                <CardDescription>You haven't created any forms. Click "Create New Form" to get started.</CardDescription>
            </CardHeader>
        </Card>
      )}

      {forms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Forms</CardTitle>
            <CardDescription>A list of all forms you have created.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fields</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forms.map((form) => (
                  <TableRow key={form._id}>
                    <TableCell className="font-medium">{form.name}</TableCell>
                    <TableCell>
                      <Badge variant={form.published ? 'default' : 'outline'} 
                             className={form.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                        {form.published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>{form.fieldCount}</TableCell>
                    <TableCell>{form.createdAt}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" title="View Responses" onClick={() => router.push(`/admin/forms/${form._id}/responses`)}>
                        <Eye size={18} />
                      </Button>
                       <Button variant="ghost" size="icon" title="Share Link" onClick={() => handleShareLink(form._id)}>
                        <Share2 size={18} />
                      </Button>
                      <Button variant="ghost" size="icon" title="Export Responses" onClick={() => handleExportResponses(form._id, form.name)}>
                        <FileDown size={18} />
                      </Button>
                      <Button variant="ghost" size="icon" title="Edit Form" onClick={() => router.push(`/admin/forms/edit/${form._id}`)}> {/* We'll create this edit page next */}
                        <Edit3 size={18} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Delete Form" className="text-red-500 hover:text-red-700">
                            <Trash2 size={18} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the form
                              <strong>"{form.name}"</strong> and all its associated responses.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteForm(form._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}