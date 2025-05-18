import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { FormTemplate, FormTemplateInterface } from '@/lib/db/models/formTemplate';
import { UserResponse, UserResponseInterface, FieldResponse } from '@/lib/db/models/userResponse';
import mongoose, { Types } from 'mongoose';
import * as XLSX from 'xlsx'; // For Excel generation

interface RouteContext {
  params: {
    formId: string;
  };
}

// Define a type for the populated student details within a response
interface PopulatedStudentDetails {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  rollNumber?: string;
  branch?: string;
  // Add other fields you selected in .populate()
  [key: string]: any; // Allow other student fields
}

interface PopulatedUserResponse extends Omit<UserResponseInterface, 'studentId'> {
  studentId: PopulatedStudentDetails | null; // Student details can be null if population fails or student deleted
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

    const formTemplate = await FormTemplate.findOne({
      _id: new Types.ObjectId(formId),
      adminId: new Types.ObjectId(session.user.id),
    }).lean() as FormTemplateInterface | null;

    if (!formTemplate) {
      return NextResponse.json({ error: 'Form template not found or access denied' }, { status: 404 });
    }

    const responses = await UserResponse.find({ formId: new Types.ObjectId(formId) })
      .populate<{ studentId: PopulatedStudentDetails | null }>({ // Type the populated field
        path: 'studentId',
        select: 'name email rollNumber branch', // Match fields selected in the view responses API
        model: 'Student',
      })
      .sort({ submittedAt: -1 })
      .lean() as unknown as PopulatedUserResponse[];

    if (!responses || responses.length === 0) {
      return NextResponse.json({ message: 'No responses found for this form to export.' }, { status: 200 });
    }

    // Prepare data for Excel
    // Define headers: Student details + Form field labels
    const studentDetailHeaders = ['Submission Date', 'Student Name', 'Student Email', 'Roll Number', 'Branch'];
    const formFieldHeaders = formTemplate.fields.map(field => field.label);
    const allHeaders = [...studentDetailHeaders, ...formFieldHeaders];

    const excelData = responses.map(response => {
      const row: { [key: string]: any } = {};

      // Add student details
      row['Submission Date'] = response.submittedAt ? new Date(response.submittedAt).toLocaleString() : 'N/A';
      row['Student Name'] = response.studentId?.name || 'N/A';
      row['Student Email'] = response.studentId?.email || 'N/A';
      row['Roll Number'] = response.studentId?.rollNumber || 'N/A';
      row['Branch'] = response.studentId?.branch || 'N/A';

      // Add form field responses
      // Create a map of fieldId to value for quick lookup from the response's 'responses' array
      const responseValuesByFieldId = new Map<string, any>();
      response.responses.forEach((fieldResp: FieldResponse) => {
        responseValuesByFieldId.set(fieldResp.fieldId.toString(), fieldResp.value);
      });

      formTemplate.fields.forEach(formField => {
        const value = responseValuesByFieldId.get(formField._id.toString());
        // Handle various data types for Excel, e.g., arrays for multi-select, booleans
        if (Array.isArray(value)) {
          row[formField.label] = value.join(', ');
        } else if (typeof value === 'boolean') {
          row[formField.label] = value ? 'Yes' : 'No';
        } else {
          row[formField.label] = value !== undefined && value !== null ? String(value) : ''; // Ensure string, handle null/undefined
        }
      });
      return row;
    });

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData, { header: allHeaders });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Sanitize form name for filename
    const safeFormName = formTemplate.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${safeFormName}_responses_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Return the file as a response
    return new NextResponse(Buffer.from(excelBuffer), {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

  } catch (error) {
    console.error(`Error exporting responses for form ${formId}:`, error);
    return NextResponse.json({ error: 'Internal server error during export' }, { status: 500 });
  }
}