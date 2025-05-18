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

    // Check form ownership
    const formTemplate = await FormTemplate.findOne({
      _id: new Types.ObjectId(formId),
      adminId: new Types.ObjectId(session.user.id),
    }).lean() as FormTemplateInterface | null;

    if (!formTemplate) {
      return NextResponse.json({ error: 'Form template not found or access denied' }, { status: 404 });
    }

    // Get responses
    const responses = await UserResponse.find({ formId: new Types.ObjectId(formId) })
      .populate('studentId', 'name email rollNumber branch')
      .sort({ submittedAt: -1 })
      .lean();

    if (!responses || responses.length === 0) {
      return NextResponse.json({ message: 'No responses found for this form to export.' }, { status: 200 });
    }

    // Create a set of valid fieldIds from the form template for strict filtering
    const validFieldIds = new Set(formTemplate.fields.map(field => field._id.toString()));

    // Create a map of fieldIds to their labels for reference
    const fieldLabelMap = new Map();
    formTemplate.fields.forEach(field => {
      fieldLabelMap.set(field._id.toString(), field.label);
    });

    // Define headers based on form fields (add student info columns first)
const headers = ['Student Name', 'Email', 'Branch', 'Submission Date']; // Removed Roll Number
    const formFieldHeaders = formTemplate.fields.map(field => field.label);
    headers.push(...formFieldHeaders);

    // Create rows for Excel with strict filtering to only include form fields
    const excelData = responses.map(response => {
  const row: { [key: string]: any } = {
    'Student Name': response.studentId?.name || 'N/A',
    'Email': response.studentId?.email || 'N/A',
    'Branch': response.studentId?.branch || 'N/A',
    'Submission Date': new Date(response.submittedAt).toLocaleString()
  };

      // Initialize all form fields with empty values
      formTemplate.fields.forEach(field => {
        row[field.label] = '';
      });

      // Only add responses for fields that exist in the form template
      response.responses.forEach((fieldResp: any) => {
        const fieldId = fieldResp.fieldId.toString();

        // Skip if this field is not in the form template
        if (!validFieldIds.has(fieldId)) return;

        const fieldLabel = fieldLabelMap.get(fieldId);
        if (!fieldLabel) return; // Extra safety check

        // Format the value based on type
        if (Array.isArray(fieldResp.value)) {
          row[fieldLabel] = fieldResp.value.join(', ');
        } else if (typeof fieldResp.value === 'boolean') {
          row[fieldLabel] = fieldResp.value ? 'Yes' : 'No';
        } else if (fieldResp.value === null || fieldResp.value === undefined) {
          row[fieldLabel] = '';
        } else {
          row[fieldLabel] = String(fieldResp.value);
        }
      });

      return row;
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = headers.map(header => ({
      width: Math.max(header.length, 15)
    }));
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Form Responses');

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
