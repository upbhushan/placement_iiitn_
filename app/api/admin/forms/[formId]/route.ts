import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { FormTemplate } from '@/lib/db/models/formTemplate';
import mongoose, { Types } from 'mongoose';

interface RouteContext {
    params: {
        formId: string;
    };
}

// GET a specific form by ID
export async function GET(request: NextRequest, { params }: RouteContext) {
    const { formId } = await params;
    const session = await getServerAuthSession();

    if (!session?.user?.id || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    if (!Types.ObjectId.isValid(formId)) {
        return NextResponse.json({ error: 'Invalid Form ID format' }, { status: 400 });
    }

    try {
        await connectToDatabase();

        const form = await FormTemplate.findOne({
            _id: new Types.ObjectId(formId),
            adminId: new Types.ObjectId(session.user.id)
        }).lean();

        if (!form) {
            return NextResponse.json({ error: 'Form not found or you do not have permission to access it' }, { status: 404 });
        }

        return NextResponse.json({ form }, { status: 200 });

    } catch (error) {
        console.error(`Error fetching form ${formId}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: 'Failed to fetch form', details: errorMessage }, { status: 500 });
    }
}

// DELETE a form by ID
export async function DELETE(request: NextRequest, { params }: RouteContext) {
    const { formId } = await params;
    const session = await getServerAuthSession();

    if (!session?.user?.id || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    if (!Types.ObjectId.isValid(formId)) {
        return NextResponse.json({ error: 'Invalid Form ID format' }, { status: 400 });
    }

    try {
        await connectToDatabase();

        // First verify the form belongs to this admin
        const form = await FormTemplate.findOne({
            _id: new Types.ObjectId(formId),
            adminId: new Types.ObjectId(session.user.id)
        });

        if (!form) {
            return NextResponse.json({ error: 'Form not found or you do not have permission to delete it' }, { status: 404 });
        }

        // Delete the form
        await FormTemplate.deleteOne({ _id: new Types.ObjectId(formId) });

        // TODO: Consider also deleting any responses associated with this form

        return NextResponse.json({ message: 'Form deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error(`Error deleting form ${formId}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: 'Failed to delete form', details: errorMessage }, { status: 500 });
    }
}

// PUT (update) a form by ID
export async function PUT(request: NextRequest, { params }: RouteContext) {
    const { formId } = await params;
    const session = await getServerAuthSession();

    if (!session?.user?.id || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    if (!Types.ObjectId.isValid(formId)) {
        return NextResponse.json({ error: 'Invalid Form ID format' }, { status: 400 });
    }

    try {
        await connectToDatabase();
        const body = await request.json();

        // Process and validate the update data
        // This would use your validation schema similar to form creation

        // First verify the form belongs to this admin
        const existingForm = await FormTemplate.findOne({
            _id: new Types.ObjectId(formId),
            adminId: new Types.ObjectId(session.user.id)
        });

        if (!existingForm) {
            return NextResponse.json({ error: 'Form not found or you do not have permission to update it' }, { status: 404 });
        }

        // Update the form
        // Process fields similar to creation to handle ObjectIds correctly
        if (body.fields) {
            body.fields = body.fields.map((field: { _id?: string | Types.ObjectId; options?: Array<Record<string, any>>;[key: string]: any; }) => ({
                ...field,
                _id: field._id ? new Types.ObjectId(field._id) : new Types.ObjectId(),
                options: field.options?.map(opt => ({ ...opt }))
            }));
        }

        const updatedForm = await FormTemplate.findByIdAndUpdate(
            formId,
            { $set: body },
            { new: true, runValidators: true }
        );

        return NextResponse.json({ message: 'Form updated successfully', form: updatedForm }, { status: 200 });

    } catch (error) {
        console.error(`Error updating form ${formId}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: 'Failed to update form', details: errorMessage }, { status: 500 });
    }
}