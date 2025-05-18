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

    // Create a map of fieldIds to their labels for reference
    const fieldLabelMap = new Map();
    formTemplate.fields.forEach(field => {
      fieldLabelMap.set(field._id.toString(), field.label);
    });

    // Define headers based on form fields
    const formFieldHeaders = formTemplate.fields.map(field => field.label);

    // Create rows for Excel
    const excelData = responses.map(response => {
      const row: { [key: string]: any } = {};

      // Add form field responses
      response.responses.forEach((fieldResp: any) => {
        const fieldLabel = fieldLabelMap.get(fieldResp.fieldId.toString());
        if (!fieldLabel) return; // Skip if field not found in template

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

    // Create worksheet with all form fields
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column order to match headers
    worksheet['!cols'] = formFieldHeaders.map(() => ({ width: 15 })); // Set reasonable column widths

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