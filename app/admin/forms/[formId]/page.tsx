"use client";

import React, { useEffect, useState } from 'react';
import { FormBuilder } from '@/components/admin/forms/FormBuilder';
import { useFormBuilderStore, ClientFormField } from '@/lib/store/formBuilderStore';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { FormTemplateInterface, FormField as ServerFormField } from '@/lib/db/models/formTemplate'; // ServerFormField has ObjectId _id

// Type for the form data fetched from API for editing
interface FormToEdit extends Omit<FormTemplateInterface, '_id' | 'fields' | 'adminId' | 'sharedWith' | 'createdAt' | 'updatedAt'> {
  _id: string; // Form's _id as string
  name: string;
  description?: string;
  fields: ServerFormField[]; // Fields from server still have ObjectId _id
  colorScheme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
  published: boolean;
}


export default function EditFormPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const formId = params.formId as string;

  const {
    formName,
    formDescription,
    fields,
    colorScheme,
    published,
    loadFormForEditing,
    resetFormBuilder,
    formId: storeFormId, // Get formId from store to differentiate create/update
  } = useFormBuilderStore();

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Reset store when component unmounts or formId changes, to avoid stale data
    return () => {
      resetFormBuilder();
    };
  }, [resetFormBuilder]);

  useEffect(() => {
    if (formId && session?.user?.role === 'admin') {
      setIsLoadingPage(true);
      fetch(`/api/admin/forms/${formId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch form details for editing.');
          }
          return res.json();
        })
        .then(data => {
          const formToLoad: FormToEdit = data.form;
          loadFormForEditing({
            _id: formToLoad._id,
            name: formToLoad.name,
            description: formToLoad.description || '',
            // Convert server fields (ObjectId _id) to client fields (string _id)
            fields: formToLoad.fields.map(field => ({
              ...field,
              _id: field._id.toString(), // Convert ObjectId to string
              options: field.options?.map(opt => ({ ...opt })) // Ensure options are plain objects
            })) as ClientFormField[],
            colorScheme: formToLoad.colorScheme,
            published: formToLoad.published,
          });
          setIsLoadingPage(false);
        })
        .catch(error => {
          toast.error(error.message || 'Could not load form data.');
          router.push('/admin/forms'); // Redirect if form loading fails
          setIsLoadingPage(false);
        });
    }
  }, [formId, session, loadFormForEditing, router]);


  if (status === 'loading' || isLoadingPage) {
    return <div className="flex justify-center items-center min-h-screen">Loading form editor...</div>;
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    router.replace('/auth/signin'); // Or your admin login page
    return null;
  }

  const handleUpdateForm = async () => {
    if (!formName.trim()) {
      toast.error("Form name is required.");
      return;
    }
    if (fields.length === 0) {
      toast.error("Form must have at least one field.");
      return;
    }
    if (!storeFormId) { // Should always be set in edit mode
        toast.error("Form ID is missing. Cannot update.");
        return;
    }

    setIsSubmitting(true);

    // For fields being sent to the backend for an update:
    // - Existing fields should retain their original _id (as string, backend will convert to ObjectId).
    // - New fields added on the client will have a client-generated string _id.
    //   The backend PUT /api/admin/forms/[formId] route handles generating new ObjectIds for new subdocuments.
    const formPayload = {
      name: formName,
      description: formDescription,
      fields: fields.map(field => ({
        ...field,
        // If field._id was generated on client (new field), it's fine.
        // If it's an existing field, its _id is already the string version of ObjectId.
        // The backend API for PUT handles subdocument updates.
      })),
      colorScheme,
      published,
    };

    try {
      const response = await fetch(`/api/admin/forms/${storeFormId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(`Error: ${result.error || 'Failed to update form.'}`, {
          description: result.details ? JSON.stringify(result.details) : undefined
        });
        throw new Error(result.error || 'Failed to update form');
      }

      toast.success('Form updated successfully!');
      // Optionally, resetFormBuilder() if navigating away, or keep state if user might make more edits.
      router.push('/admin/forms'); // Navigate to the form list page
    } catch (error) {
      console.error('Failed to update form:', error);
      // Toast error is already handled above for response.ok false
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Edit Form</h1>
        <Button onClick={handleUpdateForm} size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Form'}
        </Button>
      </div>
      <FormBuilder />
    </div>
  );
}