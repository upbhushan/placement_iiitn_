import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Student, studentInterface } from '@/lib/db/models/student';
import { Admin, adminInterface } from '@/lib/db/models/admin';
import bcrypt from 'bcryptjs';

// Optional: Add authentication to prevent unauthorized access
const SEED_SECRET = process.env.SEED_SECRET || 'development-seed-key';

export async function GET(request: Request) {
  // Optional: Check for a secret to prevent unauthorized seeding
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  
  if (secret !== SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    console.log('🌱 Starting database seeding...');
    await connectToDatabase();
    console.log('📡 Connected to database');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Student.deleteMany({});
    await Admin.deleteMany({});

    // Seed student data
    console.log('👨‍🎓 Seeding student data...');
    const studentData: studentInterface[] = [];

    await Student.insertMany(studentData);

    // Seed admin data
    console.log('👩‍💼 Seeding admin data...');
    const adminData = [
      { 
        name: 'Admin', 
        email: 'anuragk2204@gmail.com', // Changed email for admin
        designation: 'Principal',
        phoneNumber: '9876543210',
        gender: 'male' as const,
        password: await bcrypt.hash('password123', 10),
        accountStatus: 'active' as const,
        lastLogin: new Date()
      }
    ];

    await Admin.insertMany(adminData);

    console.log('✅ Database seeding completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        students: studentData.length,
        admins: adminData.length
      }
    });
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ 
      error: 'Failed to seed database', 
      details: errorMessage 
    }, { status: 500 });
  }
}