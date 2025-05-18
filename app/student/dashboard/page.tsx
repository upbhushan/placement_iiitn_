"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ListChecks, Edit, CheckCircle2, FileText } from 'lucide-react';

interface StudentFormListItem {
    _id: string;
    name: string;
    description?: string;
    hasSubmitted: boolean;
    publishedAt: string;
}

export default function StudentDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [forms, setForms] = useState<StudentFormListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStudentForms = useCallback(async () => {
        if (session?.user?.role === 'student') {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/student/forms'); // Our new API endpoint
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Failed to fetch forms');
                }
                const data = await response.json();
                setForms(data.forms.map((form: StudentFormListItem) => ({
                    ...form,
                    publishedAt: new Date(form.publishedAt).toLocaleDateString(),
                })));
            } catch (err: any) {
                setError(err.message);
                toast.error("Error fetching your forms", { description: err.message });
            } finally {
                setIsLoading(false);
            }
        }
    }, [session]);

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'student') {
            fetchStudentForms();
        } else if (status === 'unauthenticated') {
            router.replace('/auth/signin?callbackUrl=/student/dashboard');
        }
        // Add other role checks if necessary, e.g., redirect admin to admin dashboard
        else if (status === 'authenticated' && session?.user?.role !== 'student') {
            router.replace('/'); // Or admin dashboard
        }

    }, [status, session, router, fetchStudentForms]);

    if (status === 'loading' || (isLoading && status === 'authenticated')) {
        return <div className="flex justify-center items-center min-h-screen">Loading dashboard...</div>;
    }
    if (error) {
        return <div className="text-red-500 text-center py-10">Error: {error}</div>;
    }
    if (status !== 'authenticated' || session?.user?.role !== 'student') {
        return <div className="flex justify-center items-center min-h-screen">Redirecting...</div>; // Should be handled by useEffect redirect
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <ListChecks size={32} className="mr-3 text-blue-600" /> Student Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Welcome, {session.user.name || 'Student'}! Here are the available forms.</p>
            </div>

            {forms.length === 0 && !isLoading && (
                <Card className="text-center py-10">
                    <CardHeader>
                        <CardTitle>No Forms Available</CardTitle>
                        <CardDescription>There are currently no forms assigned or published for you to fill out.</CardDescription>
                    </CardHeader>
                </Card>
            )}

            {forms.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map((form) => (
                        <Card key={form._id} className="flex flex-col justify-between hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl">{form.name}</CardTitle>
                                    {form.hasSubmitted && (
                                        <Badge variant="default" className="bg-green-100 text-green-700 flex items-center">
                                            <CheckCircle2 size={14} className="mr-1" /> Submitted
                                        </Badge>
                                    )}
                                </div>
                                {form.description && (
                                    <CardDescription className="mt-1 text-sm">{form.description.substring(0, 100)}{form.description.length > 100 ? '...' : ''}</CardDescription>
                                )}
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-gray-500">Published: {form.publishedAt}</p>
                            </CardContent>
                            <CardFooter>
                                <Link
                                    href={form.hasSubmitted ? `/student/forms/${form._id}/submission` : `/forms/${form._id}`}
                                    className="w-full"
                                >
                                    <Button className="w-full" variant={form.hasSubmitted ? "outline" : "default"}> {/* Changed submitted to outline */}
                                        {form.hasSubmitted ? <><FileText size={18} className="mr-2" /> View Submission</> : <><Edit size={18} className="mr-2" /> Fill Form</>}
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}