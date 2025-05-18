import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { FormTemplate, FormTemplateInterface, FormField } from '@/lib/db/models/formTemplate';
import { UserResponse, UserResponseInterface, FieldResponse } from '@/lib/db/models/userResponse';
import mongoose, { Types } from 'mongoose';

interface StudentSubmissionData {
  formName: string;
  formDescription?: string;
  submittedAt: string;
  fields: Array<{
    fieldId: string;
    label: string;
    value: any; // Can be string, number, boolean, string[]
    fieldType: FormField['fieldType'];
  }>;
}

interface RouteContext {
  params: {
    formId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const session = await getServerAuthSession();
  if (!session?.user?.id || session.user.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized: Student session required.' }, { status: 401 });
  }

  const { formId } = await params;
  if (!Types.ObjectId.isValid(formId)) {
    return NextResponse.json({ error: 'Invalid Form ID format' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const studentId = new Types.ObjectId(session.user.id);
    const objectFormId = new Types.ObjectId(formId);

    // 1. Fetch the student's response for this form
    const userResponse = await UserResponse.findOne({
      studentId: studentId,
      formId: objectFormId,
    }).lean() as UserResponseInterface | null;

    if (!userResponse) {
      return NextResponse.json({ error: 'No submission found for this form by the student.' }, { status: 404 });
    }

    // 2. Fetch the form template to get field labels and structure
    const formTemplate = await FormTemplate.findById(objectFormId).lean() as FormTemplateInterface | null;

    if (!formTemplate) {
      // This case should be rare if a response exists, but good to handle
      return NextResponse.json({ error: 'Form template not found.' }, { status: 404 });
    }

    // 3. Combine form structure with submitted values
    const submissionFields: StudentSubmissionData['fields'] = formTemplate.fields.map(formField => {
      const submittedField = userResponse.responses.find(
        respField => respField.fieldId.toString() === formField._id.toString()
      );
      return {
        fieldId: formField._id.toString(),
        label: formField.label,
        value: submittedField ? submittedField.value : undefined, // Value could be undefined if not answered (though schema might require it)
        fieldType: formField.fieldType,
      };
    });

    const responseData: StudentSubmissionData = {
      formName: formTemplate.name,
      formDescription: formTemplate.description,
      submittedAt: userResponse.submittedAt.toISOString(),
      fields: submissionFields,
    };

    return NextResponse.json({ submission: responseData }, { status: 200 });

  } catch (error) {
    console.error('Error fetching student submission:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}