import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Student } from '@/lib/db/models/student';

export async function GET(req: Request) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Optional: Add role-based check if you have user roles
    // if (session.user.role !== 'admin') {
    //   return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    // }

    // Connect to database
    await connectToDatabase();
    
    // Get all students with sensitive fields excluded
    const students = await Student.find({}).select('-password');
    
    return NextResponse.json({
      success: true,
      count: students.length,
      data: students
    });
    
  } catch (error) {
    console.error('Error fetching students:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch students',
      error: errorMessage
    }, { status: 500 });
  }
}