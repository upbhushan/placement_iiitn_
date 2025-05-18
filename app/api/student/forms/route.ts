import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { FormTemplate, FormTemplateInterface } from '@/lib/db/models/formTemplate';
import { UserResponse } from '@/lib/db/models/userResponse';
import mongoose, { Types } from 'mongoose';

interface StudentFormListItem {
  _id: string;
  name: string;
  description?: string;
  hasSubmitted: boolean;
  publishedAt: string;
  published: boolean; // Added as it was expected by the original Omit-based type
}

export async function GET(request: NextRequest) {
  const session = await getServerAuthSession();
  if (!session?.user?.id || session.user.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized: Student session required.' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const studentId = new Types.ObjectId(session.user.id);

    // Fetch all published forms
    const publishedForms = await FormTemplate.find({ published: true })
      .sort({ createdAt: -1 }) // Show newest forms first
      .lean() as unknown as FormTemplateInterface[];

    if (!publishedForms.length) {
      return NextResponse.json({ forms: [] }, { status: 200 });
    }

    // Get IDs of forms the student has already responded to
    const submittedFormIds = await UserResponse.find(
      { studentId: studentId, formId: { $in: publishedForms.map(f => f._id) } },
      'formId' // Select only the formId field
    ).lean();

    const submittedFormIdSet = new Set(submittedFormIds.map(res => res.formId.toString()));
    const studentFormsList: StudentFormListItem[] = publishedForms.map(form => ({
      _id: form._id.toString(),
      name: form.name,
      description: form.description,
      published: form.published, // Add the 'published' field
      hasSubmitted: submittedFormIdSet.has(form._id.toString()),
      publishedAt: form.createdAt.toISOString(), // Or updatedAt, depending on desired sort/display
    }));

    return NextResponse.json({ forms: studentFormsList }, { status: 200 });
    return NextResponse.json({ forms: studentFormsList }, { status: 200 });

  } catch (error) {
    console.error('Error fetching forms for student dashboard:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}