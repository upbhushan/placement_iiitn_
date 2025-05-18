"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CalendarDays, CheckSquare, Type, Hash, Mail, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FormField } from '@/lib/db/models/formTemplate'; // For fieldType enum

interface SubmittedFieldData {
  fieldId: string;
  label: string;
  value: any;
  fieldType: FormField['fieldType'];
}
interface StudentSubmissionData {
  formName: string;
  formDescription?: string;
  submittedAt: string;
  fields: SubmittedFieldData[];
}

export default function ViewMySubmissionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const formId = params.formId as string;

  const [submissionData, setSubmissionData] = useState<StudentSubmissionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmission = useCallback(async () => {
    if (formId && session?.user?.role === 'student') {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/student/forms/${formId}/submission`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to fetch submission details.');
        }
        const data = await response.json();
        setSubmissionData({
          ...data.submission,
          submittedAt: new Date(data.submission.submittedAt).toLocaleString(),
        });
      } catch (err: any) {
        setError(err.message);
        toast.error("Error loading submission", { description: err.message });
      } finally {
        setIsLoading(false);
      }
    }
  }, [formId, session]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'student') {
      fetchSubmission();
    } else if (status === 'unauthenticated') {
      router.replace(`/auth/signin?callbackUrl=/student/forms/${formId}/submission`);
    } else if (status === 'authenticated' && session?.user?.role !== 'student') {
      router.replace('/student/dashboard'); // Or home
    }
  }, [status, session, router, fetchSubmission, formId]);

  const renderFieldValue = (field: SubmittedFieldData) => {
    if (field.value === undefined || field.value === null || field.value === '') {
      return <Badge variant="outline">Not Answered</Badge>;
    }
    if (Array.isArray(field.value)) {
      return field.value.join(', ');
    }
    if (typeof field.value === 'boolean') {
      return field.value ? 'Yes' : 'No';
    }
    if (field.fieldType === 'file' && field.value) {
      // Assuming value is a URL or a path like /uploads/filename.ext
      const fileName = typeof field.value === 'string'
        ? field.value.substring(field.value.lastIndexOf('/') + 1)
        : 'Download File';
      return (
        <a
          href={typeof field.value === 'string' ? field.value : '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
          download={fileName} // Suggests a filename if it's a direct link to a file
        >
          {fileName}
        </a>
      );
    }
    return String(field.value);
  };

  const getFieldIcon = (fieldType: FormField['fieldType']) => {
    switch (fieldType) {
      case 'text': return <Type size={18} className="mr-2 text-gray-500" />;
      case 'email': return <Mail size={18} className="mr-2 text-gray-500" />;
      case 'number': return <Hash size={18} className="mr-2 text-gray-500" />;
      case 'date': return <CalendarDays size={18} className="mr-2 text-gray-500" />;
      case 'select': return <CheckSquare size={18} className="mr-2 text-gray-500" />;
      case 'file': return <FileText size={18} className="mr-2 text-gray-500" />;
      default: return <Type size={18} className="mr-2 text-gray-500" />;
    }
  }

  if (status === 'loading' || (isLoading && status === 'authenticated')) {
    return <div className="flex justify-center items-center min-h-screen">Loading your submission...</div>;
  }
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-semibold mb-4 text-red-600">Error Loading Submission</h1>
        <p className="text-gray-700 mb-6">{error}</p>
        <Button onClick={() => router.push('/student/dashboard')}>
          <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
        </Button>
      </div>
    );
  }
  if (!submissionData) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-semibold mb-4">Submission Not Found</h1>
        <p className="text-gray-700 mb-6">We couldn't find your submission for this form.</p>
        <Button onClick={() => router.push('/student/dashboard')}>
          <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
        </Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" onClick={() => router.push('/student/dashboard')} className="mb-6 print:hidden">
        <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-800">{submissionData.formName}</CardTitle>
          {submissionData.formDescription && (
            <CardDescription className="text-gray-600 mt-1">{submissionData.formDescription}</CardDescription>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Submitted on: <span className="font-medium">{submissionData.submittedAt}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {submissionData.fields.map((field) => (
            <div key={field.fieldId} className="p-4 border rounded-lg bg-gray-50/50">
              <h3 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                {getFieldIcon(field.fieldType)}
                {field.label}
              </h3>
              <div className="text-gray-800 pl-7 text-sm">
                {renderFieldValue(field)}
              </div>
            </div>
          ))}
          <div className="mt-8 text-center print:hidden">
            <Button onClick={() => window.print()}>
              Print Submission
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}