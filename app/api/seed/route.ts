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
    const studentData = [
      {
        name: "Anurag Singh",
        email: "anuragkhobragade2204@gmail.com", // Corrected email format
        password: await bcrypt.hash('password123', 10), // Added password
        branch: "Computer Science",
        phoneNumber: "9876543210",
        cgpa: 9.2,
        activeBacklogs: 0,
        gender: "male" as const,
        hometown: "Delhi",
        dob: new Date("2002-05-15"),
        photo: "https://randomuser.me/api/portraits/men/1.jpg",
        socialMedia: {
          linkedin: "https://linkedin.com/in/anurag",
          github: "https://github.com/anurag",
          portfolio: "https://anurag.dev"
        },
        education: {
          tenthMarks: 92.5,
          twelfthMarks: 88.7
        },
        placement: {
          placed: true,
          package: 1200000,
          type: "fte" as const,
          company: "Google",
          offerDate: new Date("2024-02-15")
        },
        accountStatus: "active" as const
      },
      {
        name: "Prashant Saxena",
        email: "prasxhunter@gmail.com",
        password: await bcrypt.hash('password123', 10), // Added password
        branch: "CSE",
        phoneNumber: "8765432109",
        cgpa: 8.7,
        activeBacklogs: 1,
        gender: "male" as const,
        hometown: "Mumbai",
        dob: new Date("2001-11-22"),
        photo: "https://randomuser.me/api/portraits/women/2.jpg",
        socialMedia: {
          linkedin: "https://linkedin.com/in/priya",
          github: "https://github.com/priya"
        },
        education: {
          tenthMarks: 88.3,
          twelfthMarks: 78.9
        },
        placement: {
          placed: true,
          package: 950000,
          type: "intern" as const,
          company: "Microsoft",
          offerDate: new Date("2024-03-10")
        },
        accountStatus: "active" as const
      },
      {
        name: "Rahul Verma",
        email: "rahul@example.com",
        password: await bcrypt.hash('password123', 10), // Added password
        branch: "Mechanical",
        phoneNumber: "7654321098",
        cgpa: 7.5,
        activeBacklogs: 2,
        gender: "male" as const,
        hometown: "Bangalore",
        dob: new Date("2002-07-30"),
        socialMedia: {},
        education: {
          tenthMarks: 76.4,
          twelfthMarks: 68.2
        },
        placement: {
          placed: false
        },
        accountStatus: "active" as const
      },
      {
        name: "Nisha Patel",
        email: "nisha@example.com",
        password: await bcrypt.hash('password123', 10), // Added password
        branch: "Chemical",
        phoneNumber: "6543210987",
        cgpa: 9.8,
        activeBacklogs: 0,
        gender: "female" as const,
        hometown: "Hyderabad",
        dob: new Date("2000-12-05"),
        photo: "https://randomuser.me/api/portraits/women/3.jpg",
        socialMedia: {
          linkedin: "https://linkedin.com/in/nisha",
          twitter: "https://twitter.com/nisha"
        },
        education: {
          tenthMarks: 95.2,
          twelfthMarks: 91.5
        },
        placement: {
          placed: true,
          package: 1400000,
          type: "both" as const,
          company: "Amazon",
          offerDate: new Date("2024-01-20")
        },
        accountStatus: "active" as const
      },
      {
        name: "Amit Kumar",
        email: "amit@example.com",
        password: await bcrypt.hash('password123', 10), // Added password
        branch: "Civil",
        phoneNumber: "5432109876",
        cgpa: 6.9,
        activeBacklogs: 3,
        gender: "male" as const,
        hometown: "Chennai",
        dob: new Date("2001-03-18"),
        socialMedia: {
          github: "https://github.com/amit"
        },
        education: {
          tenthMarks: 72.1,
          twelfthMarks: 68.7
        },
        placement: {
          placed: false
        },
        accountStatus: "inactive" as const
      }
    ];

    await Student.insertMany(studentData);

    // Seed admin data
    console.log('👩‍💼 Seeding admin data...');
    const adminData = [
      { 
        name: 'Dr. Anuerag Khobragade admin', 
        email: 'anuragk2204@gmail.com', // Changed email for admin
        designation: 'Principal',
        phoneNumber: '9876543210',
        gender: 'male' as const,
        password: await bcrypt.hash('password123', 10),
        accountStatus: 'active' as const,
        lastLogin: new Date()
      },
      { 
        name: 'Prof. Sunita Verma', 
        email: 'akashkarenight@gmail.com', 
        designation: 'HOD Computer Science',
        phoneNumber: '8765432109',
        gender: 'female' as const,
        password: await bcrypt.hash('password123', 10),
        accountStatus: 'active' as const
      },
      { 
        name: 'Dr. Anil Sharma', 
        email: 'anil@example.com', 
        designation: 'Placement Officer',
        phoneNumber: '7654321098',
        gender: 'male' as const,
        password: await bcrypt.hash('password123', 10),
        accountStatus: 'active' as const,
        lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
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