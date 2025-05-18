import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { Student } from '@/lib/db/models/student';
import { connectToDatabase } from '@/lib/db/mongodb';

// GET request handler to fetch a single student by ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // First await the params object
  const { id } = await context.params;
  
  try {
    const session = await getServerAuthSession();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    // Use the awaited id
    const student = await Student.findById(id);
    
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: student
    });
    
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch student' },
      { status: 500 }
    );
  }
}

// PUT request handler to update a student
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // First await the params object
  const { id } = await context.params;
  
  try {
    const session = await getServerAuthSession();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    await connectToDatabase();
    
    // Use the awaited id
    const student = await Student.findById(id);
    
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }
    
    // Rest of your update logic...
    const fieldsToUpdate = [
      'name', 'email', 'branch', 'phoneNumber', 'cgpa', 'activeBacklogs',
      'gender', 'hometown', 'dob', 'accountStatus'
    ];
    
    fieldsToUpdate.forEach(field => {
      if (body[field] !== undefined) {
        student[field] = body[field];
      }
    });
    
    // Handle nested objects
    if (body.placement) {
      // Convert empty fields to appropriate values
      if (body.placement.package === '') body.placement.package = null;
      if (body.placement.company === '') body.placement.company = null;
      if (body.placement.offerDate === '') body.placement.offerDate = null;
      if (body.placement.type === '') body.placement.type = null;
      
      student.placement = {
        ...student.placement,
        ...body.placement
      };
    }
    
    if (body.education) {
      student.education = {
        ...student.education,
        ...body.education
      };
    }
    
    if (body.socialMedia) {
      student.socialMedia = {
        ...student.socialMedia,
        ...body.socialMedia
      };
    }
    
    await student.save();
    
    return NextResponse.json({
      success: true,
      data: student
    });
    
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update student' },
      { status: 500 }
    );
  }
}