"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
// import {
//     Button,
//     Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter,
//     Separator,
//     Badge
// } from '@/components/ui'; // This line will be replaced by the imports below

// Corrected imports for individual shadcn/ui components:
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import {
    ArrowLeft,
    CalendarClock,
    ClipboardCheck,
    FileText,
    User,
    Mail,
    Hash,
    Clock,
    CheckCircle2
} from 'lucide-react';
import { FormField } from '@/lib/db/models/formTemplate';

interface FormSubmission {
    _id: string;
    formId: string;
    formName: string;
    formDescription?: string;
    submittedAt: string;
    fields: {
        fieldId: string;
        label: string;
        fieldType: FormField['fieldType'];
        value: any;
    }[];
}

export default function StudentFormSubmissionPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const formId = params.formId as string;

    const [submission, setSubmission] = useState<FormSubmission | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubmission = useCallback(async () => {
        if (!formId || status !== 'authenticated' || session?.user?.role !== 'student') {
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`/api/student/forms/${formId}/submission`);

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to fetch submission');
            }

            const data = await response.json();
            setSubmission({
                ...data.submission,
                submittedAt: new Date(data.submission.submittedAt).toLocaleString(),
            });
        } catch (err: any) {
            setError(err.message);
            toast.error("Error", { description: err.message });
        } finally {
            setIsLoading(false);
        }
    }, [formId, session, status]);

    useEffect(() => {
        fetchSubmission();
    }, [fetchSubmission]);

    // Authentication handling
    if (status === 'loading' || isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-600 border-r-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-lg font-medium text-gray-700">Loading your submission...</p>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        router.replace('/auth/signin?callbackUrl=' + encodeURIComponent(`/student/forms/${formId}/submission`));
        return null;
    }

    if (session?.user?.role !== 'student') {
        router.replace('/');
        return null;
    }

    if (error) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                <Button variant="outline" onClick={() => router.push('/student/dashboard')} className="mb-6">
                    <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
                </Button>
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Error Loading Submission
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" onClick={() => fetchSubmission()}>Try Again</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (!submission) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                <Button variant="outline" onClick={() => router.push('/student/dashboard')} className="mb-6">
                    <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <FileText size={24} className="mr-3 text-gray-500" />
                            Submission Not Found
                        </CardTitle>
                        <CardDescription>
                            We couldn't find your submission for this form. If you believe this is an error, please contact support.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center py-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14h.01M12 20h.01M18 10h.01M6 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-600">No submission data available</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <Button variant="outline" onClick={() => router.push('/student/dashboard')} className="mb-6">
                <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
            </Button>

            <Card className="mb-6 overflow-hidden border-t-4 border-t-blue-600">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold flex items-center">
                                <ClipboardCheck size={28} className="mr-3 text-blue-600" />
                                {submission.formName}
                            </CardTitle>
                            {submission.formDescription && (
                                <CardDescription className="mt-2 text-gray-600">
                                    {submission.formDescription}
                                </CardDescription>
                            )}
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center px-3 py-1 text-sm">
                            <CheckCircle2 size={16} className="mr-1" /> Submitted
                        </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                        <CalendarClock className="mr-2 h-4 w-4 text-blue-600" />
                        <span>Submitted on {submission.submittedAt}</span>
                    </div>
                </CardHeader>
            </Card>

            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 flex items-center mb-2">
                    <FileText size={20} className="mr-2 text-blue-600" />
                    Your Responses
                </h3>

                <div className="grid gap-4">
                    {submission.fields.map((field) => (
                        <Card key={field.fieldId} className="overflow-hidden hover:shadow-md transition-shadow border-l-4 border-l-blue-600">
                            <CardHeader className="py-3 bg-gradient-to-r from-blue-50 to-white">
                                <CardTitle className="text-sm font-medium text-gray-700">{field.label}</CardTitle>
                            </CardHeader>
                            <CardContent className="py-4 bg-white">
                                {renderFieldValue(field)}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Helper function to render different field types appropriately
function renderFieldValue(field: { fieldType: string, value: any }) {
    // Handle empty values
    if (field.value === null || field.value === undefined || field.value === '') {
        return <p className="text-gray-400 italic">No answer provided</p>;
    }

    // File rendering
    if (field.fieldType === 'file' && field.value) {
        const fileName = typeof field.value === 'string'
            ? field.value.substring(field.value.lastIndexOf('/') + 1)
            : 'Attached File';

        return (
            <a
                href={field.value}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-3 border border-blue-100 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium">{fileName}</span>
            </a>
        );
    }

    // Array values (e.g., multiple select)
    if (Array.isArray(field.value)) {
        return (
            <div className="flex flex-wrap gap-2">
                {field.value.map((item, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                        {item}
                    </Badge>
                ))}
            </div>
        );
    }

    // Boolean values (yes/no)
    if (typeof field.value === 'boolean') {
        return (
            <div className={`flex items-center ${field.value ? 'text-green-600' : 'text-red-600'}`}>
                {field.value ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Yes</span>
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>No</span>
                    </>
                )}
            </div>
        );
    }

    // Number values with special formatting
    if (field.fieldType === 'number' && !isNaN(Number(field.value))) {
        return (
            <div className="font-mono text-lg">{field.value}</div>
        );
    }

    // Default text rendering
    return <p className="text-gray-800">{String(field.value)}</p>;
}