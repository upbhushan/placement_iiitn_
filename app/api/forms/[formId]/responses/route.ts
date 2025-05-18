import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { FormTemplate, FormTemplateInterface } from '@/lib/db/models/formTemplate';
import { Student } from '@/lib/db/models/student'; // For fetching student details for auto-fill
import { getServerAuthSession } from '@/lib/auth'; // To get logged-in student
import mongoose, { Types } from 'mongoose';
import { UserResponse } from '@/lib/db/models/userResponse';
import { submitUserResponseSchema, SubmitUserResponseInput } from '@/lib/validators/formValidation';

interface RouteContext {
    params: {
        formId: string;
    };
}

// GET a single published form template (for students to fill)
export async function GET(request: NextRequest, { params }: RouteContext) {
    const { formId } = await params;

    if (!Types.ObjectId.isValid(formId)) {
        return NextResponse.json({ error: 'Invalid Form ID format' }, { status: 400 });
    }

    const session = await getServerAuthSession(); // Get current session (could be student or anonymous)

    try {
        await connectToDatabase();

        const formTemplate = await FormTemplate.findOne({
            _id: new Types.ObjectId(formId),
            published: true, // Only fetch published forms
        })
            // Select only necessary fields to send to the client for rendering the form
            // Exclude adminId, sharedWith (unless you implement specific student sharing checks here)
            .select('name description fields colorScheme uniqueFeatures')
            .lean() as Omit<FormTemplateInterface, 'adminId' | 'sharedWith' | 'createdAt' | 'updatedAt' | 'published'> | null;

        if (!formTemplate) {
            return NextResponse.json({ error: 'Form not found or not published' }, { status: 404 });
        }

        // --- Auto-fill Logic ---
        let studentDetails = null;
        if (session?.user?.id && session.user.role === 'student') { // Check if a student is logged in
            // Assuming session.user.id is the student's MongoDB ObjectId
            // And your Student model has fields like 'name', 'email', 'rollNumber', 'cgpa', etc.
            studentDetails = await Student.findById(new Types.ObjectId(session.user.id))
    .select('name email branch phoneNumber cgpa activeBacklogs gender hometown dob education placement')
    .lean();
        }

        // Prepare the form with auto-filled data if applicable
        const formWithAutoFill = {
            ...formTemplate,
            fields: formTemplate.fields.map(field => {
                let autoFilledValue: any = undefined;
                if (field.autoFillKey && studentDetails) {
                    // Handle nested keys like 'education.tenthMarks'
                    const keys = field.autoFillKey.split('.');
                    let currentValue: any = studentDetails;
                    for (const key of keys) {
                        if (currentValue && typeof currentValue === 'object' && key in currentValue) {
                            currentValue = currentValue[key];
                        } else {
                            currentValue = undefined;
                            break;
                        }
                    }
                    autoFilledValue = currentValue;

                    // Format date if it's a date field and value is a Date object
                    if (field.fieldType === 'date' && autoFilledValue instanceof Date) {
                        autoFilledValue = autoFilledValue.toISOString().split('T')[0]; // YYYY-MM-DD
                    }
                }
                return {
                    ...field,
                    // Client will use this to pre-fill and make read-only
                    ...(autoFilledValue !== undefined && { value: autoFilledValue, isReadOnly: true }),
                };
            }),
        };

        return NextResponse.json({ form: formWithAutoFill }, { status: 200 });

    } catch (error) {
        console.error(`Error fetching form ${formId} for student:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST a new user response to a form
export async function POST(request: NextRequest, { params }: RouteContext) {
    const { formId } = await params;
    const session = await getServerAuthSession();

    if (!session?.user?.id || session.user.role !== 'student') {
        return NextResponse.json({ error: 'Unauthorized. Only students can submit responses.' }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(formId)) {
        return NextResponse.json({ error: 'Invalid Form ID format' }, { status: 400 });
    }

    try {
        await connectToDatabase();

        const body = await request.json();
        const parsedBody = submitUserResponseSchema.safeParse(body);

        if (!parsedBody.success) {
            return NextResponse.json({ error: 'Invalid request body', details: parsedBody.error.flatten() }, { status: 400 });
        }

        const { responses } = parsedBody.data as SubmitUserResponseInput;
        const studentId = new mongoose.Types.ObjectId(session.user.id);

        // Fetch the form template to validate responses against
        const formTemplate = await FormTemplate.findById(new mongoose.Types.ObjectId(formId))
            .lean() as FormTemplateInterface | null;

        if (!formTemplate) {
            return NextResponse.json({ error: 'Form not found or not published' }, { status: 404 });
        }
        if (!formTemplate.published) {
            return NextResponse.json({ error: 'This form is not currently accepting responses.' }, { status: 403 });
        }

        // Optional: Server-side validation of responses against formTemplate.fields
        // This can include checking required fields, matching field types (though file is now a URL string), etc.
        // For example, ensure all required fields are present in the submission.
        const validationErrors: Array<{ fieldId: string, fieldLabel: string, error: string }> = [];
        for (const field of formTemplate.fields) {
            const response = responses.find(r => r.fieldId === field._id.toString());
            if (field.required && (!response || response.value === '' || response.value === null || response.value === undefined)) {
                validationErrors.push({
                    fieldId: field._id.toString(),
                    fieldLabel: field.label,
                    error: `Field '${field.label}' is required.`,
                });
            }
            // Add more specific validations if needed, e.g., for file URLs, ensure they look like URLs
            if (field.fieldType === 'file' && response?.value && typeof response.value === 'string' && response.value.length > 0) {
                try {
                    new URL(response.value); // Check if it's a valid absolute URL or a path
                } catch (e) {
                    // If it's a relative path like /uploads/filename.ext, URL constructor will fail.
                    // We can accept relative paths starting with /
                    if (!response.value.startsWith('/')) {
                        validationErrors.push({
                            fieldId: field._id.toString(),
                            fieldLabel: field.label,
                            error: `Field '${field.label}' has an invalid file URL.`,
                        });
                    }
                }
            }
        }

        if (validationErrors.length > 0) {
            return NextResponse.json({ error: 'Validation failed', details: validationErrors }, { status: 400 });
        }

        // Check if this student has already submitted this form (if one submission per student is enforced)
        // This depends on your application's rules. For now, we allow multiple submissions.
        // const existingResponse = await UserResponse.findOne({ formId: new mongoose.Types.ObjectId(formId), studentId });
        // if (existingResponse) {
        //   return NextResponse.json({ error: 'You have already submitted this form.' }, { status: 409 });
        // }

        const newUserResponse = new UserResponse({
            formId: new mongoose.Types.ObjectId(formId),
            studentId,
            responses: responses.map(r => ({
                fieldId: new mongoose.Types.ObjectId(r.fieldId),
                fieldLabel: r.fieldLabel,
                value: r.value, // This will now correctly store the file URL string for file fields
            })),
            submittedAt: new Date(),
        });

        await newUserResponse.save();

        return NextResponse.json({ message: 'Response submitted successfully', responseId: newUserResponse._id }, { status: 201 });

    } catch (error) {
        console.error(`Error submitting response for form ${formId}:`, error);
        if (error instanceof mongoose.Error.ValidationError) {
            return NextResponse.json({ error: 'Validation Error', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}