import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { FormTemplate } from '@/lib/db/models/formTemplate';
import { Student } from '@/lib/db/models/student';
import { UserResponse } from '@/lib/db/models/userResponse';
import mongoose, { Types } from 'mongoose';

interface RouteContext {
    params: {
        formId: string;
    };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
    const { formId } = await params;
    const session = await getServerAuthSession();

    if (!Types.ObjectId.isValid(formId)) {
        return NextResponse.json({ error: 'Invalid form ID format' }, { status: 400 });
    }

    try {
        await connectToDatabase();

        // Fetch the form template
        const form = await FormTemplate.findOne({
            _id: new Types.ObjectId(formId),
            published: true // Only return published forms
        }).lean();

        if (!form) {
            return NextResponse.json({ error: 'Form not found or not published' }, { status: 404 });
        }

        // Prepare the form data for the client
        const formForClient = JSON.parse(JSON.stringify(form));

        // Add a flag to track submission status
        let hasSubmitted = false;
        let submissionId = null;

        // If user is authenticated as a student, check if they've already submitted
        if (session?.user?.id && session.user.role === 'student') {
            // Check if student has already submitted this form
            const existingSubmission = await UserResponse.findOne({
                formId: new Types.ObjectId(formId),
                studentId: new Types.ObjectId(session.user.id)
            }).lean() as { _id: Types.ObjectId; [key: string]: any; } | null;

            if (existingSubmission) {
                // Add submission status to the response
                hasSubmitted = true;
                submissionId = existingSubmission._id.toString();
            }

            // Fetch student profile for auto-fill (keep your existing auto-fill code)
            const studentProfile = await Student.findById(new Types.ObjectId(session.user.id)).lean() as Record<string, any> | null;

            if (studentProfile) {
                // Auto-fill fields based on autoFillKey if present
                formForClient.fields = formForClient.fields.map((field: any) => {
                    // If the field has an autoFillKey and that key exists in the student profile
                    if (field.autoFillKey && studentProfile[field.autoFillKey] !== undefined) {
                        return {
                            ...field,
                            value: studentProfile[field.autoFillKey],
                            isReadOnly: true // Make auto-filled fields read-only
                        };
                    }
                    return field;
                });
            }
        }

        return NextResponse.json({
            form: formForClient,
            hasSubmitted,
            submissionId
        }, { status: 200 });

    } catch (error) {
        console.error(`Error fetching form ${formId}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: 'Failed to fetch form', details: errorMessage }, { status: 500 });
    }
}