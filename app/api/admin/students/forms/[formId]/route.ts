import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { FormTemplate, FormTemplateInterface, FormField } from '@/lib/db/models/formTemplate';
import { updateFormTemplateSchema, UpdateFormTemplateInput } from '@/lib/validators/formValidation'; // Ensure correct path
import mongoose, { Types } from 'mongoose';

interface RouteContext {
    params: {
        formId: string;
    };
}

// GET a single form template
export async function GET(request: NextRequest, { params }: RouteContext) {
    const session = await getServerAuthSession();
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { formId } = await params;
    if (!Types.ObjectId.isValid(formId)) {
        return NextResponse.json({ error: 'Invalid Form ID format' }, { status: 400 });
    }

    try {
        await connectToDatabase();
        const form = await FormTemplate.findOne({
            _id: new Types.ObjectId(formId),
            adminId: new Types.ObjectId(session.user.id), // Ensure admin owns this form
        }).lean();

        if (!form) {
            return NextResponse.json({ error: 'Form template not found or access denied' }, { status: 404 });
        }

        return NextResponse.json({ form }, { status: 200 });
    } catch (error) {
        console.error(`Error fetching form template ${formId}:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT (Update) a form template
export async function PUT(request: NextRequest, { params }: RouteContext) {
    const session = await getServerAuthSession();
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { formId } = await params;
    if (!Types.ObjectId.isValid(formId)) {
        return NextResponse.json({ error: 'Invalid Form ID format' }, { status: 400 });
    }

    try {
        await connectToDatabase();
        const body = await request.json();

        const validationResult = updateFormTemplateSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({ error: 'Invalid input', details: validationResult.error.flatten() }, { status: 400 });
        }

        const updateData = validationResult.data;

        // If fields are being updated, ensure their _ids are handled correctly
        if (updateData.fields) {
            // @ts-ignore - updateData.fields expects _id as string from validation schema, but we are converting to ObjectId for database.
            updateData.fields = updateData.fields.map(field => ({
                ...field,
                _id: field._id && Types.ObjectId.isValid(field._id) ? new Types.ObjectId(field._id) : new Types.ObjectId(),
                options: field.options?.map(opt => ({ ...opt }))
            })) as FormField[]; // Cast to FormField[]
        }

        if (updateData.sharedWith) {
            // Converting to ObjectId for database operations but keeping as string for TypeScript compatibility
            const objectIdArray = updateData.sharedWith.map(id => new Types.ObjectId(id));
            // @ts-ignore - We're handling the type conversion here
            updateData.sharedWith = objectIdArray;
        }


        const updatedForm = await FormTemplate.findOneAndUpdate(
            {
                _id: new Types.ObjectId(formId),
                adminId: new Types.ObjectId(session.user.id), // Ensure admin owns this form
            },
            { $set: updateData },
            { new: true, runValidators: true } // Return the updated document and run schema validators
        );

        if (!updatedForm) {
            return NextResponse.json({ error: 'Form template not found or access denied' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Form template updated successfully', form: updatedForm }, { status: 200 });

    } catch (error) {
        console.error(`Error updating form template ${formId}:`, error);
        if (error instanceof mongoose.Error.ValidationError) {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE a form template
export async function DELETE(request: NextRequest, { params }: RouteContext) {
    const session = await getServerAuthSession();
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { formId } = await params;
    if (!Types.ObjectId.isValid(formId)) {
        return NextResponse.json({ error: 'Invalid Form ID format' }, { status: 400 });
    }

    try {
        await connectToDatabase();

        const result = await FormTemplate.deleteOne({
            _id: new Types.ObjectId(formId),
            adminId: new Types.ObjectId(session.user.id), // Ensure admin owns this form
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Form template not found or access denied' }, { status: 404 });
        }

        // Optionally, also delete all UserResponse documents associated with this formId
        // await UserResponse.deleteMany({ formId: new Types.ObjectId(formId) });

        return NextResponse.json({ message: 'Form template deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error(`Error deleting form template ${formId}:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}