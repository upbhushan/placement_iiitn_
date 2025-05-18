import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/mongodb";
import {Student} from "@/lib/db/models/student";

export async function GET() {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to MongoDB using mongoose
    await connectToDatabase();
    
    // Fetch the student profile from the database
    const student = await Student.findOne({
      email: session.user.email
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch student profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse the request body
    // Parse the request body
    const data = await request.json();
    
    // Connect to MongoDB using mongoose
    await connectToDatabase();
    
    // Find the current student
    const student = await Student.findOne({
      email: session.user.email
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    // Only update fields that are provided in the request
    if (data.hometown !== undefined) {
      student.hometown = data.hometown;
    }
    
    if (data.dob !== undefined) {
      student.dob = data.dob ? new Date(data.dob) : undefined;
    }
    
    if (data.photo !== undefined) {
      student.photo = data.photo;
    }
    
    // Only update socialMedia if it's provided
    if (data.socialMedia) {
      student.socialMedia = {
        ...student.socialMedia || {},
        linkedin: data.socialMedia.linkedin,
        github: data.socialMedia.github,
        twitter: data.socialMedia.twitter,
        portfolio: data.socialMedia.portfolio
      };
    }
    
    // Only update education if it's provided
    if (data.education) {
      student.education = {
        ...student.education || {},
        tenthMarks: data.education.tenthMarks !== undefined ? 
          Number(data.education.tenthMarks) : student.education?.tenthMarks,
        twelfthMarks: data.education.twelfthMarks !== undefined ? 
          Number(data.education.twelfthMarks) : student.education?.twelfthMarks
      };
    }
    
    // Save the updated student
    await student.save();

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error updating student profile:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to update student profile", details: errorMessage },
      { status: 500 }
    );
  }
}