"use client";

import React, { useEffect } from 'react';
import { FormBuilder } from '@/components/admin/forms/FormBuilder';
import { useFormBuilderStore } from '@/lib/store/formBuilderStore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function NewFormPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { theme } = useTheme();
    const [isSaving, setIsSaving] = React.useState(false);

    // Zustand store values
    const {
        formName, formDescription, fields, colorScheme,
        published, currentTheme, resetFormBuilder, setTheme
    } = useFormBuilderStore();

    useEffect(() => {
        // Reset store when component mounts to ensure a fresh state for a new form
        resetFormBuilder();

        // Detect system theme and set initial form theme accordingly
        if (theme === 'dark') {
            setTheme('dark');
        }
    }, [resetFormBuilder, theme]);

    if (status === 'loading') {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
        router.replace('/auth/signin');
        return null;
    }

    const handleSaveForm = async () => {
        if (!formName.trim()) {
            toast.error("Form name is required.");
            return;
        }
        if (fields.length === 0) {
            toast.error("Form must have at least one field.");
            return;
        }

        setIsSaving(true);

        const formPayload = {
            name: formName,
            description: formDescription,
            fields: fields.map(({ _id, ...field }) => ({ ...field, _id: undefined })),
            colorScheme,
            published,
            currentTheme,
        };

        try {
            const response = await fetch('/api/admin/forms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formPayload),
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(`Error: ${result.error || 'Failed to save form.'}`, {
                    description: result.details ? JSON.stringify(result.details) : undefined
                });
                throw new Error(result.error || 'Failed to save form');
            }

            toast.success('Form created successfully!');
            resetFormBuilder();
            router.push('/admin/forms');
        } catch (error) {
            console.error('Failed to save form:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full max-w-[95%] mx-auto py-8 px-4 transition-colors duration-300">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">Create New Form</h1>
                <Button
                    onClick={handleSaveForm}
                    size="lg"
                    className="flex items-center gap-2"
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            Save Form
                        </>
                    )}
                </Button>
            </div>
            <FormBuilder />
        </div>
    );
}