import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { FormTemplate, FormField } from '@/lib/db/models/formTemplate';
import { createFormTemplateSchema } from '@/lib/validators/formValidation';
import mongoose, { Types } from 'mongoose';

export async function POST(request: NextRequest) {
  const session = await getServerAuthSession();
  
  // Check if user is authenticated and is an admin
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const body = await request.json();

    const validationResult = createFormTemplateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.flatten() }, { status: 400 });
    }

    const { name, description, fields, colorScheme, uniqueFeatures, published, sharedWith } = validationResult.data;

    // Ensure field _ids are generated if not provided
    const processedFields = fields.map(field => ({
      ...field,
      _id: field._id ? new Types.ObjectId(field._id) : new Types.ObjectId(),
      options: field.options?.map(opt => ({ ...opt })) // Ensure options are plain objects
    })) as FormField[];

    const newFormTemplate = new FormTemplate({
      adminId: new Types.ObjectId(session.user.id),
      name,
      description,
      fields: processedFields,
      colorScheme: colorScheme || {
        primaryColor: "#007bff",
        backgroundColor: "#ffffff",
        textColor: "#333333",
      },
      uniqueFeatures,
      published: published || false,
      sharedWith: sharedWith ? sharedWith.map(id => new Types.ObjectId(id)) : [],
    });

    await newFormTemplate.save();

    return NextResponse.json({
      message: 'Form template created successfully',
      formId: newFormTemplate._id
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating form template:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ 
      error: 'Failed to create form template', 
      details: errorMessage 
    }, { status: 500 });
  }
}

// Implement GET method to fetch all forms created by the admin
export async function GET(request: NextRequest) {
  const session = await getServerAuthSession();
  
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const adminId = new Types.ObjectId(session.user.id);
    
    const forms = await FormTemplate.find({ adminId })
      .sort({ updatedAt: -1 })
      .lean();
    
    return NextResponse.json({ forms }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching forms:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ 
      error: 'Failed to fetch forms', 
      details: errorMessage 
    }, { status: 500 });
  }
}