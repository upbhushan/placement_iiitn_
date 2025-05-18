"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField as FormFieldType, FormTemplateInterface } from '@/lib/db/models/formTemplate'; // Server field type
import { generateClientZodSchema } from '@/lib/utils/generateClientZodSchema';
import { FieldResponseInput } from '@/lib/validators/formValidation'; // For submission payload

// Interface for the form data fetched from /api/forms/[formId]
// This includes fields that might have 'value' and 'isReadOnly' from auto-fill
interface ClientRenderFormField extends Omit<FormFieldType, '_id' | 'fieldType'> {
    _id: string; // Ensure _id is string for client
    fieldType: FormFieldType['fieldType'] | 'textarea'; // Allow 'textarea'
    value?: any; // Pre-filled value from auto-fill
    isReadOnly?: boolean; // If the field is auto-filled and read-only
}
interface ClientRenderFormTemplate extends Omit<FormTemplateInterface, 'fields' | '_id' | 'adminId' | 'sharedWith' | 'createdAt' | 'updatedAt' | 'published'> {
    _id: string;
    name: string;
    description?: string;
    fields: ClientRenderFormField[];
    colorScheme: {
        primaryColor: string;
        backgroundColor: string;
        textColor: string;
    };
}

type FormData = Record<string, any>; // Dynamic form data type

export default function StudentFillFormPage() {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const params = useParams();
    const formId = params.formId as string;

    const [formDefinition, setFormDefinition] = useState<ClientRenderFormTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [submissionId, setSubmissionId] = useState<string | null>(null);

    // Dynamically generate Zod schema based on formDefinition
    const validationSchema = useMemo(() => {
        if (!formDefinition) return z.object({}); // Default empty schema
        return generateClientZodSchema(formDefinition.fields);
    }, [formDefinition]);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
        setValue, // To set initial/auto-filled values
    } = useForm<FormData>({
        resolver: zodResolver(validationSchema),
        defaultValues: {},
    });

    useEffect(() => {
        if (formId) {
            setIsLoading(true);
            fetch(`/api/forms/${formId}`) // Student-facing API endpoint
                .then(res => {
                    if (!res.ok) {
                        return res.json().then(err => { throw new Error(err.error || 'Failed to fetch form.'); });
                    }
                    return res.json();
                })
                .then(data => {
                    const fetchedForm: ClientRenderFormTemplate = {
                        ...data.form,
                        _id: data.form._id.toString(),
                        fields: data.form.fields.map((f: any) => ({ ...f, _id: f._id.toString() }))
                    };
                    setFormDefinition(fetchedForm);

                    // Set submission status
                    setHasSubmitted(data.hasSubmitted || false);
                    setSubmissionId(data.submissionId || null);

                    // Set initial/default values for react-hook-form, including auto-filled ones
                    const initialValues: FormData = {};
                    fetchedForm.fields.forEach(field => {
                        initialValues[field._id] = field.value !== undefined ? field.value : '';
                    });
                    reset(initialValues); // Reset form with new default values
                    setError(null);
                })
                .catch(err => {
                    setError(err.message);
                    toast.error("Error", { description: err.message });
                })
                .finally(() => setIsLoading(false));
        }
    }, [formId, reset]);

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        if (sessionStatus !== 'authenticated' || session?.user?.role !== 'student') {
            toast.error("Submission failed", { description: "You must be logged in as a student to submit this form." });
            return;
        }
        if (!formDefinition) return;
        setIsSubmitting(true);

        try {
            const responsesPayload: FieldResponseInput[] = [];

            for (const field of formDefinition.fields) {
                let value = data[field._id];

                if (field.fieldType === 'file' && value instanceof FileList && value.length > 0) {
                    const file = value[0];
                    const formData = new FormData();
                    formData.append('file', file);

                    // Upload the file
                    const uploadResponse = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!uploadResponse.ok) {
                        const uploadResult = await uploadResponse.json();
                        toast.error(`File upload failed for ${field.label}: ${uploadResult.error || 'Unknown error'}`);
                        throw new Error(`File upload failed for ${field.label}`);
                    }
                    const uploadResult = await uploadResponse.json();
                    value = uploadResult.fileUrl; // Use the returned file URL
                } else if (field.fieldType === 'file' && (!value || value.length === 0)) {
                    // Handle case where file input is optional and no file is selected
                    value = ''; // Or undefined, depending on how backend handles optional files
                }


                responsesPayload.push({
                    fieldId: field._id,
                    fieldLabel: field.label,
                    value: value,
                });
            }

            const response = await fetch(`/api/forms/${formId}/responses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ responses: responsesPayload }),
            });
            const result = await response.json();

            if (!response.ok) {
                toast.error(`Submission failed: ${result.error || 'Unknown error'}`, {
                    description: result.details ? (Array.isArray(result.details) ? result.details.map((d: any) => `${d.fieldLabel || d.fieldId}: ${d.error}`).join(', ') : JSON.stringify(result.details)) : undefined
                });
                throw new Error(result.error || 'Failed to submit form');
            }
            toast.success('Form submitted successfully!');
            router.push('/student/dashboard'); // Redirect to student dashboard
            // No need to reset the form since we're navigating away
        } catch (err) {
            // Error already toasted
        } finally {
            setIsSubmitting(false);
        }
    };

    // If user has already submitted this form, show a message instead
    if (hasSubmitted && sessionStatus === 'authenticated' && session?.user?.role === 'student') {
        return (
            <div style={{ backgroundColor: formDefinition?.colorScheme.backgroundColor || '#ffffff' }} className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <Card className="w-full max-w-md shadow-xl text-center">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold" style={{ color: formDefinition?.colorScheme.primaryColor }}>
                            Form Already Submitted
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-center">
                            <div className="rounded-full bg-green-100 p-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <p>You have already submitted this form. You cannot submit it again.</p>
                        <div className="space-y-2">
                            <Button
                                className="w-full"
                                onClick={() => router.push(`/student/forms/${formId}/submission`)}
                                style={{
                                    backgroundColor: formDefinition?.colorScheme.primaryColor || '#007bff',
                                    color: '#fff',
                                }}
                            >
                                View Your Submission
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push('/student/dashboard')}
                            >
                                Back to Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">Loading form...</div>;
    }
    if (error) {
        return <div className="text-red-500 text-center py-10 bg-background min-h-screen flex flex-col items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Error Loading Form</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                    <Button onClick={() => router.push('/')} className="mt-4">Go to Homepage</Button>
                </CardContent>
            </Card>
        </div>;
    }
    if (!formDefinition) {
        return <div className="flex justify-center items-center min-h-screen">Form not found.</div>;
    }

    // Update your form styles to be more dark-mode friendly
    const getFormStyles = (colorScheme: any) => {
        const isDarkTheme = colorScheme.backgroundColor.toLowerCase().match(/(#1|#0|#2|rgb\(\s*([01]?\d|2[0-4]\d|25[0-5])\s*,\s*([01]?\d|2[0-4]\d|25[0-5])\s*,\s*([01]?\d|2[0-4]\d|25[0-5])\s*\))/);

        return {
            container: {
                backgroundColor: colorScheme.backgroundColor || '#ffffff',
                color: colorScheme.textColor || '#333333',
                minHeight: '100vh',
                transition: 'background-color 0.3s ease, color 0.3s ease'
            },
            card: {
                boxShadow: isDarkTheme
                    ? '0 4px 30px rgba(0, 0, 0, 0.5)'
                    : '0 4px 20px rgba(0, 0, 0, 0.1)',
                backgroundColor: isDarkTheme
                    ? colorScheme.backgroundColor
                    : '#ffffff',
                borderColor: isDarkTheme ? '#333' : '#e2e8f0',
                transition: 'all 0.3s ease'
            },
            heading: {
                color: colorScheme.primaryColor
            },
            primaryColor: colorScheme.primaryColor || '#007bff',
            button: {
                backgroundColor: colorScheme.primaryColor || '#007bff',
                color: isDarkTheme ? '#ffffff' : '#ffffff'
            },
            inputStyle: {
                backgroundColor: isDarkTheme ? `${colorScheme.backgroundColor}dd` : colorScheme.backgroundColor,
                color: colorScheme.textColor,
                borderColor: `${colorScheme.primaryColor}33`,
                boxShadow: isDarkTheme ? 'inset 0 1px 2px rgba(0, 0, 0, 0.2)' : 'none',
                transition: 'all 0.2s ease'
            }
        };
    };

    const formStyles = getFormStyles(formDefinition.colorScheme);

    return (
        <div style={formStyles.container} className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <style jsx global>{`
        :root {
          --primary-color: ${formDefinition.colorScheme.primaryColor || '#007bff'};
        }
        .custom-primary-border {
          border-color: var(--primary-color);
        }
        .form-input:focus {
          border-color: var(--primary-color) !important;
          box-shadow: 0 0 0 2px var(--primary-color) !important;
        }
        .form-select-trigger[data-state="open"], .form-select-trigger:focus {
            border-color: var(--primary-color) !important;
            box-shadow: 0 0 0 2px var(--primary-color) !important;
        }
      `}</style>
            <Card className="w-full max-w-2xl shadow-xl custom-primary-border" style={formStyles.card}>
                <CardHeader>
                    <CardTitle className="text-3xl font-extrabold" style={{ color: formDefinition.colorScheme.primaryColor }}>
                        {formDefinition.name}
                    </CardTitle>
                    {formDefinition.description && (
                        <CardDescription className="mt-2 text-md" style={{ color: formDefinition.colorScheme.textColor }}>
                            {formDefinition.description}
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {formDefinition.fields.map((field) => (
                            <div key={field._id}>
                                <Label htmlFor={field._id} className="block text-sm font-medium mb-1" style={{ color: formDefinition.colorScheme.textColor }}>
                                    {field.label}
                                    {field.required && <span style={{ color: formDefinition.colorScheme.primaryColor || 'red' }}>*</span>}
                                </Label>
                                <Controller
                                    name={field._id}
                                    control={control}
                                    render={({ field: controllerField }) => {
                                        const commonProps = {
                                            ...controllerField,
                                            id: field._id,
                                            placeholder: field.placeholder || '',
                                            readOnly: field.isReadOnly,
                                            disabled: field.isReadOnly || isSubmitting,
                                            className: `mt-1 block w-full shadow-sm sm:text-sm rounded-md form-input ${errors[field._id] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`,
                                            style: {
                                                backgroundColor: field.isReadOnly ? '#e9ecef' : formDefinition.colorScheme.backgroundColor, // Slightly different bg for readonly
                                                color: formDefinition.colorScheme.textColor,
                                                borderColor: errors[field._id] ? 'red' : (formDefinition.colorScheme.primaryColor || '#ced4da') // Use primary for border too
                                            }
                                        };

                                        if (field.fieldType === 'textarea') {
                                            return <Textarea {...commonProps} />;
                                        }
                                        if (field.fieldType === 'select' && field.options) {
                                            return (
                                                <Select
                                                    onValueChange={controllerField.onChange}
                                                    value={controllerField.value}
                                                    disabled={field.isReadOnly || isSubmitting}
                                                >
                                                    <SelectTrigger id={field._id} className={`form-select-trigger ${errors[field._id] ? 'border-red-500' : ''}`} style={{ backgroundColor: field.isReadOnly ? '#e9ecef' : formDefinition.colorScheme.backgroundColor, color: formDefinition.colorScheme.textColor, borderColor: errors[field._id] ? 'red' : (formDefinition.colorScheme.primaryColor || '#ced4da') }}>
                                                        <SelectValue placeholder={field.placeholder || "Select an option"} />
                                                    </SelectTrigger>
                                                    <SelectContent style={{ backgroundColor: formDefinition.colorScheme.backgroundColor, color: formDefinition.colorScheme.textColor }}>
                                                        {field.options.map(option => (
                                                            <SelectItem key={option.value} value={option.value} style={{ color: formDefinition.colorScheme.textColor }}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            );
                                        }
                                        if (field.fieldType === 'file') {
                                            // For file inputs, react-hook-form handles them differently.
                                            // We need to register them slightly differently if we want to use Controller.
                                            // Or, handle them with a separate ref and update form state.
                                            // For simplicity with Controller, we adapt `onChange`.
                                            return (
                                                <Input
                                                    type="file"
                                                    id={field._id}
                                                    name={controllerField.name}
                                                    ref={controllerField.ref}
                                                    onBlur={controllerField.onBlur}
                                                    onChange={(e) => controllerField.onChange(e.target.files)} // Pass FileList to RHF
                                                    disabled={field.isReadOnly || isSubmitting}
                                                    className={commonProps.className}
                                                    style={{ ...commonProps.style, paddingTop: '0.5rem', paddingBottom: '0.5rem' }} // Adjust padding for file input
                                                />
                                            );
                                        }
                                        // Default to text input, also handles email, number, date
                                        return <Input type={field.fieldType} {...commonProps} />;
                                    }}
                                />
                                {errors[field._id] && (
                                    <p className="mt-1 text-xs text-red-500">{(errors[field._id] as any)?.message}</p>
                                )}
                            </div>
                        ))}
                        <Button type="submit" className="w-full text-lg py-3" style={formStyles.button} disabled={isSubmitting || (sessionStatus === 'authenticated' && session?.user?.role !== 'student')}>
                            {isSubmitting ? 'Submitting...' : 'Submit Response'}
                        </Button>
                        {sessionStatus === 'authenticated' && session?.user?.role !== 'student' && (
                            <p className="text-xs text-center text-red-500 mt-2">Only students can submit responses.</p>
                        )}
                        {sessionStatus !== 'authenticated' && (
                            <p className="text-xs text-center text-yellow-600 mt-2">
                                You are not logged in. Your submission might be anonymous or rejected if login is required.
                                <Button variant="link" onClick={() => router.push(`/auth/signin?callbackUrl=/forms/${formId}`)} className="p-0 h-auto ml-1" style={{ color: formDefinition.colorScheme.primaryColor }}>Login as Student</Button>
                            </p>
                        )}
                    </form>
                </CardContent>
            </Card>
            <footer className="text-center mt-8 text-sm" style={{ color: formDefinition.colorScheme.textColor || '#666' }}>
                Powered by Your Platform Name
            </footer>
        </div>
    );
}