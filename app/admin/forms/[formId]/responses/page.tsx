"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileDown, UserCircle, Mail, ListChecks } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormTemplateInterface, FormField as FormFieldType } from '@/lib/db/models/formTemplate'; // For form structure
import { UserResponseInterface, FieldResponse as SubmittedFieldResponse } from '@/lib/db/models/userResponse'; // For response structure

interface PopulatedStudentDetails {
    _id: string;
    name?: string;
    email?: string;
    rollNumber?: string;
    branch?: string;
}

interface PopulatedUserResponse extends Omit<UserResponseInterface, 'studentId' | 'formId' | 'responses' | '_id' | 'submittedAt'> {
    _id: string;
    formId: string;
    studentId: PopulatedStudentDetails | null;
    responses: SubmittedFieldResponse[]; // Ensure this matches the structure from API
    submittedAt: string; // Date as string
}

export default function ViewFormResponsesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const formId = params.formId as string;

    const [formName, setFormName] = useState<string>('');
    const [formFields, setFormFields] = useState<FormFieldType[]>([]); // To get field labels for table headers
    const [responses, setResponses] = useState<PopulatedUserResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFormDetailsAndResponses = useCallback(async () => {
        if (!formId || status !== 'authenticated' || session?.user?.role !== 'admin') {
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // Fetch form template details (for field labels)
            const formDetailsRes = await fetch(`/api/admin/forms/${formId}`);
            if (!formDetailsRes.ok) {
                const errData = await formDetailsRes.json();
                throw new Error(errData.error || 'Failed to fetch form details.');
            }
            const formDetailsData = await formDetailsRes.json();
            const fetchedFormTemplate: FormTemplateInterface = formDetailsData.form;
            setFormName(fetchedFormTemplate.name);
            setFormFields(fetchedFormTemplate.fields);

            // Fetch responses
            const responsesRes = await fetch(`/api/admin/forms/${formId}/responses`);
            if (!responsesRes.ok) {
                const errData = await responsesRes.json();
                throw new Error(errData.error || 'Failed to fetch responses.');
            }
            const responsesData = await responsesRes.json();
            // Ensure studentId is an object and dates are formatted if needed
            setResponses(responsesData.responses.map((r: any) => ({
                ...r,
                _id: r._id.toString(),
                formId: r.formId.toString(),
                studentId: r.studentId ? {
                    ...r.studentId,
                    _id: r.studentId._id.toString(),
                } : null,
                submittedAt: new Date(r.submittedAt).toLocaleString(),
                responses: r.responses.map((sr: any) => ({
                    ...sr,
                    fieldId: sr.fieldId.toString(),
                }))
            })));

        } catch (err: any) {
            setError(err.message);
            toast.error("Error loading data", { description: err.message });
        } finally {
            setIsLoading(false);
        }
    }, [formId, session, status]);

    useEffect(() => {
        fetchFormDetailsAndResponses();
    }, [fetchFormDetailsAndResponses]);

    const handleExportResponses = async () => {
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

    if (status === 'loading' || isLoading) {
        return <div className="flex justify-center items-center min-h-screen">Loading responses...</div>;
    }
    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
        router.replace('/auth/signin');
        return null;
    }
    if (error) {
        return <div className="text-red-500 text-center py-10">Error: {error}</div>;
    }

    // Create a map of fieldId to fieldLabel for quick lookup
    const fieldLabelMap = new Map<string, string>();
    formFields.forEach(field => fieldLabelMap.set(field._id.toString(), field.label));

    return (
        <div className="container mx-auto py-8 px-4">
            <Button variant="outline" onClick={() => router.push('/admin/forms')} className="mb-6">
                <ArrowLeft size={18} className="mr-2" /> Back to Forms List
            </Button>

            <Card>
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl flex items-center">
                            <ListChecks size={28} className="mr-3 text-blue-600" /> Responses for: {formName || 'Loading...'}
                        </CardTitle>
                        <CardDescription>
                            {responses.length} response(s) submitted.
                        </CardDescription>
                    </div>
                    <Button onClick={handleExportResponses} disabled={responses.length === 0}>
                        <FileDown size={18} className="mr-2" /> Export to Excel
                    </Button>
                </CardHeader>
                <CardContent>
                    {responses.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No responses submitted for this form yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[180px]">Student Name</TableHead>
                                        <TableHead className="w-[200px]">Email</TableHead>
                                        <TableHead className="w-[120px]">Roll No.</TableHead>
                                        <TableHead>Submitted At</TableHead>
                                        {formFields.map(field => (
                                            <TableHead key={field._id.toString()}>{field.label}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {responses.map((response) => (
                                        <TableRow key={response._id}>
                                            <TableCell className="font-medium">
                                                {response.studentId?.name || <Badge variant="outline">N/A</Badge>}
                                            </TableCell>
                                            <TableCell>{response.studentId?.email || <Badge variant="outline">N/A</Badge>}</TableCell>
                                            <TableCell>{response.studentId?.rollNumber || <Badge variant="outline">N/A</Badge>}</TableCell>
                                            <TableCell>{response.submittedAt}</TableCell>
                                            {formFields.map(formField => {
                                                const submittedField = response.responses.find(
                                                    sr => sr.fieldId.toString() === formField._id.toString()
                                                );
                                                let displayValue: React.ReactNode = <Badge variant="secondary">Not Answered</Badge>;
                                                if (submittedField) {
                                                    // Check if fieldType is available (it should be from the API)
                                                    const fieldType = (submittedField as any).fieldType || formField.fieldType;

                                                    if (fieldType === 'file' && submittedField.value) {
                                                        // Assuming value is a URL or a path like /uploads/filename.ext
                                                        const fileName = typeof submittedField.value === 'string'
                                                            ? submittedField.value.substring(submittedField.value.lastIndexOf('/') + 1)
                                                            : 'Download File';
                                                        displayValue = (
                                                            <a
                                                                href={typeof submittedField.value === 'string' ? submittedField.value : '#'}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline"
                                                                download={fileName} // Suggests a filename if it's a direct link to a file
                                                            >
                                                                {fileName}
                                                            </a>
                                                        );
                                                    } else if (Array.isArray(submittedField.value)) {
                                                        displayValue = submittedField.value.join(', ');
                                                    } else if (typeof submittedField.value === 'boolean') {
                                                        displayValue = submittedField.value ? 'Yes' : 'No';
                                                    } else if (submittedField.value === null || submittedField.value === undefined || submittedField.value === '') {
                                                        displayValue = <Badge variant="secondary">Empty</Badge>;
                                                    }
                                                    else {
                                                        displayValue = String(submittedField.value);
                                                    }
                                                }
                                                return <TableCell key={`${response._id}-${formField._id}`}>{displayValue}</TableCell>;
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}