import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Student, studentInterface } from "@/lib/db/models/student"; // Assuming studentInterface is your Mongoose document interface
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getServerAuthSession } from "@/lib/auth";
import * as XLSX from "xlsx";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import mongoose, { Types } from "mongoose"; // Import Types for _id
import type { Document } from "mongoose";

// Define a custom type for lean documents
type LeanDocument<T> = Omit<T, keyof Document> & { _id: Types.ObjectId };

// Workaround for Mongoose < v6 if LeanDocument is not directly exported
// This type aims to represent the plain JavaScript object version of your studentInterface
type CustomLeanStudent = Omit<studentInterface, keyof mongoose.Document> & {
  _id: Types.ObjectId; // Or string, or whatever the actual type of _id is in your schema
  // Add any other fields that might be part of studentInterface but are not Mongoose Document methods
  // For example, if studentInterface has its own methods you want to exclude.
  // However, if studentInterface primarily defines data fields and extends mongoose.Document,
  // Omit<studentInterface, keyof mongoose.Document> should be effective.
};

// Server-side Zod schema (should match your Mongoose model structure closely)
const studentValidationSchemaServer = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  branch: z.string().min(1, "Branch is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  cgpa: z.number().min(0).max(10, "CGPA must be between 0 and 10"),
  activeBacklogs: z.number().min(0, "Active backlogs cannot be negative"),
  gender: z.enum(["male", "female", "other"], { errorMap: () => ({ message: "Invalid gender" }) }),
  hometown: z.string().min(1, "Hometown is required"),
  dob: z.date({ errorMap: () => ({ message: "Invalid date of birth" }) }),
  education: z.object({
    tenthMarks: z.number().min(0).max(100, "10th marks must be between 0 and 100"),
    twelfthMarks: z.number().min(0).max(100, "12th marks must be between 0 and 100"),
  }),
  photo: z.string().url("Invalid photo URL").optional().or(z.literal('')),
  socialMedia: z.object({
    linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal('')),
    github: z.string().url("Invalid GitHub URL").optional().or(z.literal('')),
    twitter: z.string().url("Invalid Twitter URL").optional().or(z.literal('')),
    portfolio: z.string().url("Invalid portfolio URL").optional().or(z.literal('')),
  }).optional(),
  placement: z.object({
    placed: z.boolean().default(false),
    package: z.number().min(0, "Package cannot be negative").optional(),
    company: z.string().optional().or(z.literal('')),
    offerDate: z.date({ errorMap: () => ({ message: "Invalid offer date" }) }).optional(),
    type: z.enum(["intern", "fte", "both"], { errorMap: () => ({ message: "Invalid placement type" }) }).optional(),
  }).optional(),
  accountStatus: z.enum(["active", "inactive", "blocked"], { errorMap: () => ({ message: "Invalid account status" }) }).default("active").optional(),
});

type StudentInput = z.infer<typeof studentValidationSchemaServer>;
type OperationMode = "append" | "replace" | "update";

interface RequestBody {
  students: StudentInput[]; // Ensure frontend sends data that can be coerced by Zod
  mode: OperationMode;
}

// Define the type for the objects you're creating for the backup file.
// This is different from LeanDocument<studentInterface> because _id is a string and backupDate is added.
type StudentForBackup = Omit<LeanDocument<studentInterface>, 'password' | '_id' | '__v'> & {
  _id: string;
  backupDate: string;
  // Potentially other fields from studentInterface if not covered by Omit
};

// Helper type for lean student documents from MongoDB for backup
type LeanStudentDocument = Omit<studentInterface, keyof mongoose.Document | 'password'> & {
  _id: string; // ObjectId converted to string
  [key: string]: any;
};


export async function POST(request: NextRequest) {
  const session = await getServerAuthSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const body: RequestBody = await request.json();
    const { students: studentsInput, mode } = body;

    if (!Array.isArray(studentsInput) || !mode || !["append", "replace", "update"].includes(mode)) {
      return NextResponse.json({ error: 'Invalid request body or mode' }, { status: 400 });
    }

    let insertedCount = 0;
    let updatedCount = 0;
    let failedCount = 0;
    let replacedCount = 0;
    const detailedErrors: { index?: number, email?: string, error: string }[] = [];
    let backupFileUrl: string | null = null;

    // --- REPLACE MODE ---
    if (mode === 'replace') {
      try {
        const existingStudentsRaw = await Student.find({})
          .select('+password')
          .lean()
          .exec() as unknown as CustomLeanStudent[];

        if (existingStudentsRaw.length > 0) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const backupFileName = `student_backup_${timestamp}.xlsx`;

          // The 'doc' in map is now correctly typed as LeanDocument<studentInterface>.
          // The .toObject() call is not needed because lean documents are already plain objects.
          const sanitizedStudentsForBackup: StudentForBackup[] = existingStudentsRaw.map(doc => {
            // doc is now typed as CustomLeanStudent
            const { password, ...rest } = doc;
            return {
              ...rest,
              _id: doc._id.toString(), // Assuming _id is an ObjectId
              backupDate: new Date().toISOString(),
            };
          });

          const worksheet = XLSX.utils.json_to_sheet(sanitizedStudentsForBackup);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "StudentBackup");

          const backupDir = path.join(process.cwd(), 'public', 'backups');
          const backupPath = path.join(backupDir, backupFileName);

          await mkdir(backupDir, { recursive: true });
          const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
          await writeFile(backupPath, excelBuffer);

          backupFileUrl = `/backups/${backupFileName}`;
          console.log(`Created backup: ${backupPath}`);
        }

        const deleteResult = await Student.deleteMany({});
        replacedCount = deleteResult.deletedCount || 0;
        console.log(`REPLACE MODE: Deleted ${replacedCount} existing students.`);

      } catch (backupOrDeleteError: any) {
        console.error('Error during backup/delete phase:', backupOrDeleteError);
        // Decide if you want to stop the whole process or just log error and continue
        detailedErrors.push({ error: `Backup/Delete Error: ${backupOrDeleteError.message}` });
        // Potentially return early if backup is critical
        // return NextResponse.json({ error: 'Failed during backup/delete', details: backupOrDeleteError.message }, { status: 500 });
      }
    }

    // --- APPEND, UPDATE, and (REPLACE's insert phase) LOGIC ---
    for (let i = 0; i < studentsInput.length; i++) {
      let studentDataFromInput = { ...studentsInput[i] };

      // Coerce date strings to Date objects BEFORE Zod validation
      // Zod expects Date objects for z.date()
      if (studentDataFromInput.dob && typeof studentDataFromInput.dob === 'string') {
        studentDataFromInput.dob = new Date(studentDataFromInput.dob);
      }
      if (studentDataFromInput.placement?.offerDate && typeof studentDataFromInput.placement.offerDate === 'string') {
        studentDataFromInput.placement.offerDate = new Date(studentDataFromInput.placement.offerDate);
      }

      const validationResult = studentValidationSchemaServer.safeParse(studentDataFromInput);

      if (!validationResult.success) {
        failedCount++;
        detailedErrors.push({
          index: i,
          email: studentDataFromInput.email || `Row ${i + 1}`,
          error: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
        continue;
      }

      const validatedStudentData = validationResult.data;
      let studentToSave = { ...validatedStudentData };

      // Hash password if provided
      if (validatedStudentData.password) {
        studentToSave.password = await bcrypt.hash(validatedStudentData.password, 10);
      } else {
        // If password is not provided for an update, remove it so it doesn't overwrite existing
        if (mode === 'update') {
          delete studentToSave.password; // Important for updates
        }
        // For append/replace, if password is required by Mongoose schema and not optional here,
        // Mongoose will throw an error. If it's optional or has a default in Mongoose, it's fine.
        // If you want to enforce a default password for new users if not provided:
        else if (mode === 'append' || mode === 'replace') {
          // studentToSave.password = await bcrypt.hash('defaultPassword123', 10); // Example default
        }
      }

      try {
        if (mode === 'update') {
          const existingStudent = await Student.findOne({ email: studentToSave.email });
          if (existingStudent) {
            // $set will correctly update top-level fields and replace nested objects.
            // If studentToSave.placement is undefined (because it was optional and not in input),
            // it won't be in $set, so existing placement won't be touched.
            // If studentToSave.placement is an object (even empty {} if all its fields were optional and empty),
            // it will replace the existing placement sub-document.
            await Student.updateOne({ email: studentToSave.email }, { $set: studentToSave });
            updatedCount++;
          } else {
            // Student not found for update, so insert as new
            if (!studentToSave.password) { // Ensure new student has a password
              studentToSave.password = await bcrypt.hash('defaultPassword123', 10); // Or handle as error
            }
            await Student.create(studentToSave);
            insertedCount++;
          }
        } else { // Append or (Replace's insert phase) - Here, mode is 'append' or 'replace'
          // The check 'mode !== 'update'' is redundant here and can be removed.
          if (!studentToSave.password) { // Ensure new student has a password
            studentToSave.password = await bcrypt.hash('defaultPassword123', 10); // Or handle as error
          }
          await Student.create(studentToSave);
          insertedCount++;
        }
      } catch (dbError: any) {
        failedCount++;
        let errorMessage = `DB Error: ${dbError.message}`;
        if (dbError.code === 11000) { // MongoDB duplicate key error
          errorMessage = `Duplicate entry. Email '${studentToSave.email}' likely already exists.`;
        }
        detailedErrors.push({ email: studentToSave.email, error: errorMessage });
      }
    }

    const finalStatus = failedCount > 0 ? (insertedCount > 0 || updatedCount > 0 || replacedCount > 0 ? 207 : 400) : (insertedCount > 0 || updatedCount > 0 || replacedCount > 0 ? 201 : 200);
    let message = `Operation finished.`;
    if (mode === 'replace') message = `Data replacement finished.`;
    else if (mode === 'update') message = `Data update finished.`;
    else if (mode === 'append') message = `Data append finished.`;
    if (finalStatus === 200 && insertedCount === 0 && updatedCount === 0 && replacedCount === 0 && studentsInput.length > 0) {
      message = "Operation finished. No changes were made based on the input data."
    } else if (finalStatus === 200 && studentsInput.length === 0) {
      message = "No student data provided in the request."
    }


    return NextResponse.json({
      message,
      data: {
        insertedCount,
        updatedCount,
        failedCount,
        replacedCount: mode === 'replace' ? replacedCount : undefined,
        backupFileUrl: mode === 'replace' ? backupFileUrl : undefined,
        processedCount: studentsInput.length, // Total records attempted from input
      },
      detailedErrors: detailedErrors.length > 0 ? detailedErrors : undefined,
    }, { status: finalStatus });

  } catch (error: any) {
    console.error(`Error in bulk student upload (mode: ${(request as any).body?.mode || 'unknown'}):`, error);
    return NextResponse.json({ error: 'Failed to process student data', details: error.message || 'Unknown server error' }, { status: 500 });
  }
}