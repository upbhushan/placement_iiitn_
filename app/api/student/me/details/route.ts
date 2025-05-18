import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { FormTemplate, FormTemplateInterface, FormField as FormFieldType } from '@/lib/db/models/formTemplate'; // Renamed FormField to FormFieldType to avoid conflict
import { UserResponse, FieldResponse } from '@/lib/db/models/userResponse';
import { Student } from '@/lib/db/models/student';
import { submitUserResponseSchema, SubmitUserResponseInput } from '@/lib/validators/formValidation';
import mongoose, { Types } from 'mongoose';

interface RouteContext {
    params: {
        formId: string;
    };
}

export async function POST(request: NextRequest, { params }: RouteContext) {
    const session = await getServerAuthSession();
    if (!session?.user?.id || session.user.role !== 'student') { // Ensure a student is logged in
        return NextResponse.json({ error: 'Unauthorized: Student session required.' }, { status: 401 });
    }

    const { formId } = await params;
    if (!Types.ObjectId.isValid(formId)) {
        return NextResponse.json({ error: 'Invalid Form ID format' }, { status: 400 });
    }

    try {
        await connectToDatabase();
        const body = await request.json();

        const validationResult = submitUserResponseSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({ error: 'Invalid input', details: validationResult.error.flatten() }, { status: 400 });
        }

        const { responses: submittedResponses } = validationResult.data;

        // Fetch the form template to validate responses against its structure
        const formTemplate = await FormTemplate.findById(new Types.ObjectId(formId))
            .select('+fields.autoFillKey') // Ensure autoFillKey is selected for validation
            .lean() as FormTemplateInterface | null;

        if (!formTemplate || !formTemplate.published) {
            return NextResponse.json({ error: 'Form not found or not published' }, { status: 404 });
        }

        // Optional: Check if student has already submitted this form (if not allowed multiple submissions)
        // const existingResponse = await UserResponse.findOne({ formId: formTemplate._id, studentId: new Types.ObjectId(session.user.id) });
        // if (existingResponse) {
        //   return NextResponse.json({ error: 'You have already submitted this form.' }, { status: 409 });
        // }

        // Fetch student details for validating auto-filled fields
        const studentDetails = await Student.findById(new Types.ObjectId(session.user.id)).lean();
        if (!studentDetails) {
            return NextResponse.json({ error: 'Student details not found.' }, { status: 404 });
        }

        const processedResponses: FieldResponse[] = [];
        const validationErrors: { fieldId: string, fieldLabel: string, error: string }[] = [];

        for (const submittedField of submittedResponses) {
            const formFieldDefinition = formTemplate.fields.find(f => f._id.toString() === submittedField.fieldId);

            if (!formFieldDefinition) {
                validationErrors.push({ fieldId: submittedField.fieldId, fieldLabel: submittedField.fieldLabel, error: 'Field definition not found in form template.' });
                continue;
            }

            // 1. Validate "required" fields
            if (formFieldDefinition.required && (submittedField.value === undefined || submittedField.value === null || submittedField.value === '')) {
                // Exception for boolean false, which is a valid value
                if (formFieldDefinition.fieldType !== 'select' && typeof submittedField.value !== 'boolean') { // Assuming 'select' might have empty string as a valid non-selection if not required
                    validationErrors.push({ fieldId: submittedField.fieldId, fieldLabel: formFieldDefinition.label, error: 'This field is required.' });
                    continue;
                }
            }

            // 2. Validate auto-filled fields (tamper-check)
            if (formFieldDefinition.autoFillKey) {
                let expectedValue: any;
                const keys = formFieldDefinition.autoFillKey.split('.');
                let currentValue: any = studentDetails;
                for (const key of keys) {
                    if (currentValue && typeof currentValue === 'object' && key in currentValue) {
                        currentValue = currentValue[key];
                    } else {
                        currentValue = undefined;
                        break;
                    }
                }
                expectedValue = currentValue;

                // Format date for comparison if it's a date field
                if (formFieldDefinition.fieldType === 'date' && expectedValue instanceof Date) {
                    expectedValue = expectedValue.toISOString().split('T')[0];
                }
                // Convert expectedValue to string for comparison if submitted value is string, to handle type differences (e.g. number vs string)
                if (typeof submittedField.value === 'string' && expectedValue !== undefined && expectedValue !== null) {
                    expectedValue = String(expectedValue);
                }


                if (expectedValue !== undefined && submittedField.value !== expectedValue) {
                    validationErrors.push({ fieldId: submittedField.fieldId, fieldLabel: formFieldDefinition.label, error: `Auto-filled value mismatch. Expected '${expectedValue}', received '${submittedField.value}'.` });
                    continue;
                }
            }

            // 3. Add more specific type validations based on formFieldDefinition.fieldType if needed (e.g., email format, number range)
            // For now, Zod on the client should handle most of this before submission. This is a server-side double-check.
            // Example for email:
            // if (formFieldDefinition.fieldType === 'email' && submittedField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(submittedField.value))) {
            //   validationErrors.push({ fieldId: submittedField.fieldId, fieldLabel: formFieldDefinition.label, error: 'Invalid email format.' });
            //   continue;
            // }

            processedResponses.push({
                fieldId: new Types.ObjectId(submittedField.fieldId),
                fieldLabel: formFieldDefinition.label, // Use label from template for consistency
                value: submittedField.value,
            });
        }

        if (validationErrors.length > 0) {
            return NextResponse.json({ error: 'Validation failed', details: validationErrors }, { status: 400 });
        }

        // Save the valid response
        const newUserResponse = new UserResponse({
            formId: formTemplate._id,
            studentId: new Types.ObjectId(session.user.id),
            responses: processedResponses,
        });

        await newUserResponse.save();

        return NextResponse.json({ message: 'Form submitted successfully', responseId: newUserResponse._id }, { status: 201 });

    } catch (error) {
        console.error(`Error submitting response for form ${formId}:`, error);
        if (error instanceof mongoose.Error.ValidationError) {
            return NextResponse.json({ error: 'Database validation failed', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}