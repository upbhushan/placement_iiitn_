import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth'; // Your NextAuth session utility
import { connectToDatabase } from '@/lib/db/mongodb';
import { FormTemplate, FormTemplateInterface, FormField } from '@/lib/db/models/formTemplate';
import { createFormTemplateSchema, CreateFormTemplateInput } from '@/lib/validators/formValidation';
import mongoose, { Types } from 'mongoose';

export async function POST(request: NextRequest) {
    const session = await getServerAuthSession();
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectToDatabase();
        const body = await request.json();

        const validationResult = createFormTemplateSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({ error: 'Invalid input', details: validationResult.error.flatten() }, { status: 400 });
        }

        const { name, description, fields, colorScheme, uniqueFeatures, published, sharedWith } = validationResult.data;

        // Ensure field _ids are generated if not provided (Mongoose does this by default for subdocuments if _id: true)
        const processedFields = fields.map(field => ({
            ...field,
            _id: field._id ? new Types.ObjectId(field._id) : new Types.ObjectId(), // Generate new ObjectId for each field
            options: field.options?.map(opt => ({ ...opt })) // Ensure options are plain objects
        })) as FormField[];


        const newFormTemplate = new FormTemplate({
            adminId: new Types.ObjectId(session.user.id), // Assuming session.user.id is the admin's MongoDB ObjectId
            name,
            description,
            fields: processedFields,
            colorScheme: colorScheme || { // Provide default if not in input
                primaryColor: "#007bff",
                backgroundColor: "#ffffff",
                textColor: "#333333",
            },
            uniqueFeatures,
            published,
            sharedWith: sharedWith ? sharedWith.map(id => new Types.ObjectId(id)) : [],
        });

        await newFormTemplate.save();

        return NextResponse.json({ message: 'Form template created successfully', form: newFormTemplate }, { status: 201 });

    } catch (error) {
        console.error('Error creating form template:', error);
        if (error instanceof mongoose.Error.ValidationError) {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const session = await getServerAuthSession();
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectToDatabase();

        // You might want to add pagination later
        const forms = await FormTemplate.find({ adminId: new Types.ObjectId(session.user.id) })
            .sort({ createdAt: -1 }) // Sort by newest first
            .lean(); // Use .lean() for performance if you don't need Mongoose document methods

        return NextResponse.json({ forms }, { status: 200 });

    } catch (error) {
        console.error('Error fetching form templates:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}