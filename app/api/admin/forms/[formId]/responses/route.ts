import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { UserResponse } from '@/lib/db/models/userResponse';
import { FormTemplate } from '@/lib/db/models/formTemplate';
import { Student } from '@/lib/db/models/student';
import { getServerAuthSession } from '@/lib/auth';
import mongoose, { Types } from 'mongoose';

interface RouteContext {
  params: {
    formId: string;
  };
}

// GET all responses for a specific form (for admins)
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { formId } = await params;
  const session = await getServerAuthSession();

  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!Types.ObjectId.isValid(formId)) {
    return NextResponse.json({ error: 'Invalid Form ID format' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    // Define the expected structure for the lean form template object
    interface FieldInTemplate {
      _id: Types.ObjectId; // Mongoose ObjectId, has .toString()
      fieldType: string;
      // Add other properties of a field if needed elsewhere
    }
    interface LeanFormTemplate {
      name: string;
      fields: FieldInTemplate[];
      // Add other properties of the form template if needed elsewhere
    }

    const formTemplate = await FormTemplate.findById(formId).lean<LeanFormTemplate>();
    if (!formTemplate) {
      return NextResponse.json({ error: 'Form template not found' }, { status: 404 });
    }

    // Fetch responses and populate student details
    // Also, ensure field details from the form template are available for context
    const responses = await UserResponse.find({ formId: new Types.ObjectId(formId) })
      .populate({
        path: 'studentId',
        model: Student,
        select: 'name email rollNumber branch', // Select fields you want to show for the student
      })
      .sort({ submittedAt: -1 }) // Sort by submission date, newest first
      .lean();

    // We need to map form template fields to easily access their type, esp. for 'file'
    const fieldMap = new Map(formTemplate.fields.map(field => [field._id.toString(), field]));

    // Define the type for individual submitted field data within a response
    interface SubmittedFieldInResponse {
      fieldId: Types.ObjectId;
      value: any; // The actual value submitted by the user for the field
      // Add other properties here if they exist on the sub-document from the database
    }

    const responsesWithFieldInfo = responses.map(response => ({
      ...response,
      responses: response.responses.map((submittedField: SubmittedFieldInResponse) => {
        const templateField = fieldMap.get(submittedField.fieldId.toString());
        return {
          ...submittedField,
          fieldType: templateField?.fieldType, // Add fieldType to each response field
          // If it's a file, the 'value' is the URL.
          // The client can then render it as a link.
        };
      }),
    }));

    return NextResponse.json({ responses: responsesWithFieldInfo, formName: formTemplate.name }, { status: 200 });

  } catch (error) {
    console.error(`Error fetching responses for form ${formId}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
