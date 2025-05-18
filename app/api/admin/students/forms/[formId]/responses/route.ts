import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { FormTemplate } from '@/lib/db/models/formTemplate';
import { UserResponse, UserResponseInterface } from '@/lib/db/models/userResponse';
import mongoose, { Types } from 'mongoose';

interface RouteContext {
  params: {
    formId: string;
  };
}

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

    // First, verify the admin owns the form template
    const formTemplate = await FormTemplate.findOne({
      _id: new Types.ObjectId(formId),
      adminId: new Types.ObjectId(session.user.id),
    }).lean<{ name: string; _id: Types.ObjectId }>();

    if (!formTemplate) {
      return NextResponse.json({ error: 'Form template not found or access denied' }, { status: 404 });
    }

    // Fetch responses for this form and populate student details
    // You might want to add pagination, sorting, and filtering via query parameters later
    const responses = await UserResponse.find({ formId: new Types.ObjectId(formId) })
      .populate({
        path: 'studentId',
        select: 'name email rollNumber branch', // Select specific student fields you want to show in the response list
        model: 'Student', // Explicitly state model name if not automatically inferred or if issues arise
      })
      .sort({ submittedAt: -1 }) // Show newest responses first
      .lean();

    // The 'responses' will now have studentId populated with an object containing name, email, etc.

    return NextResponse.json({ responses, formName: formTemplate.name }, { status: 200 });

  } catch (error) {
    console.error(`Error fetching responses for form ${formId}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}