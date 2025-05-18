"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Assuming Shadcn UI
import { Label } from "@/components/ui/label"; // Assuming Shadcn UI

// ... (studentValidationSchema and ParsedStudent type remain the same)
const studentValidationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  // Make password optional for updates where it might not be provided
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  branch: z.string().min(1, "Branch is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  cgpa: z.number().min(0).max(10),
  activeBacklogs: z.number().min(0),
  gender: z.enum(["male", "female", "other"]),
  hometown: z.string().min(1, "Hometown is required"),
  dob: z.date({ coerce: true }),
  education: z.object({
    tenthMarks: z.number().min(0).max(100),
    twelfthMarks: z.number().min(0).max(100),
  }),
  photo: z.string().url().optional().or(z.literal('')),
  socialMedia: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    portfolio: z.string().url().optional().or(z.literal('')),
  }).optional(),
  placement: z.object({
    placed: z.boolean(),
    package: z.number().optional(),
    type: z.enum(["intern", "fte", "both"]).optional(),
    company: z.string().optional(),
    offerDate: z.date({ coerce: true }).optional(),
  }).optional(),
  accountStatus: z.enum(["active", "inactive", "blocked"]).default("active").optional(),
});

type ParsedStudent = z.infer<typeof studentValidationSchema>;
type OperationMode = "append" | "replace" | "update";


export default function AdminSettingsPage() {
  const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [operationMode, setOperationMode] = useState<OperationMode>("append"); // Default to append

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // ... (existing onDrop logic for parsing Excel)
    // Ensure password mapping provides a default if not in Excel,
    // or make it truly optional in the schema if updates won't always include it.
    // For "update" mode, if password is not in Excel, it shouldn't be set to "password123"
    // but rather left undefined so the backend doesn't unnecessarily update it.

    setUploadStatus(null);
    setValidationErrors([]);
    setParsedStudents([]);
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFileName(file.name);
      setIsProcessing(true);
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const binaryStr = event.target?.result;
          const workbook = XLSX.read(binaryStr, { type: 'binary', cellDates: true });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, {
            raw: false,
            dateNF: 'yyyy-mm-dd',
          });

          const students: ParsedStudent[] = [];
          const errors: string[] = [];

          jsonData.forEach((row, index) => {
            const mappedRow = {
              // ... (your existing mapping logic)
              name: row["Full Name"] || row["name"],
              email: row["Email Address"] || row["email"],
              // Password: make it optional if not always present, especially for updates
              password: row["Password"] || row["password"], // If undefined, Zod .optional() handles it
              branch: row["Branch"] || row["branch"],
              phoneNumber: row["Phone Number"] || row["phoneNumber"],
              cgpa: parseFloat(row["CGPA"] || row["cgpa"]),
              activeBacklogs: parseInt(row["Active Backlogs"] || row["activeBacklogs"], 10),
              gender: (row["Gender"] || row["gender"])?.toLowerCase(),
              hometown: row["Hometown"] || row["hometown"],
              dob: row["Date of Birth"] || row["dob"],
              education: {
                tenthMarks: parseFloat(row["10th Marks"] || row.education?.tenthMarks),
                twelfthMarks: parseFloat(row["12th Marks"] || row.education?.twelfthMarks),
              },
              placement: {
                placed: (row["Placed"] || row.placement?.placed)?.toString().toLowerCase() === 'true',
                package: row.placement?.package ? parseFloat(row.placement.package) : undefined,
                type: row.placement?.type,
                company: row.placement?.company,
                offerDate: row.placement?.offerDate,
              },
              accountStatus: (row["Account Status"] || row.accountStatus)?.toLowerCase() || "active",
              photo: row["Photo URL"] || row["photo"],
              socialMedia: {
                linkedin: row.socialMedia?.linkedin,
                github: row.socialMedia?.github,
                twitter: row.socialMedia?.twitter,
                portfolio: row.socialMedia?.portfolio,
              }
            };

            // For 'append' and 'replace', password might be required if not set by default server-side
            // For 'update', password should be truly optional from Excel
            let tempSchema = studentValidationSchema;
            if (operationMode === 'append' || operationMode === 'replace') {
                // If password is not in row and not defaulted, make it required
                if (!mappedRow.password) {
                    // You might want a default password here if schema requires it
                    // For now, let's assume schema's .optional() is fine if backend handles default
                }
            }


            const validationResult = tempSchema.safeParse(mappedRow);
            if (validationResult.success) {
              students.push(validationResult.data);
            } else {
              errors.push(
                `Row ${index + 2}: ${validationResult.error.errors.map((e) => `${e.path.join('.')} - ${e.message}`).join(', ')}`
              );
            }
          });

          setParsedStudents(students);
          setValidationErrors(errors);
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          setValidationErrors(["Failed to parse Excel file. Ensure it's a valid .xlsx or .xls file."]);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsBinaryString(file);
    }
  }, [operationMode]); // Add operationMode to dependencies of onDrop

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  const handleSeedData = async () => {
    // ... (existing checks for parsedStudents and validationErrors)
    if (parsedStudents.length === 0 && validationErrors.length === 0) {
      setUploadStatus({ type: 'error', message: 'No valid student data to seed. Please upload and parse a file.' });
      return;
    }
    if (validationErrors.length > 0) {
      setUploadStatus({ type: 'error', message: 'Please fix validation errors before seeding.' });
      return;
    }

    setIsProcessing(true);
    setUploadStatus(null);
    try {
      const response = await fetch('/api/admin/students/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: parsedStudents, mode: operationMode }), // Send mode
      });

      const result = await response.json();

      if (response.ok || response.status === 207) { // 207 for multi-status
        let successMessage = result.message || `Operation successful.`;
        if (result.data) {
            successMessage += ` Added: ${result.data.insertedCount || 0}, Updated: ${result.data.updatedCount || 0}, Replaced: ${result.data.replacedCount || 0}. Failed: ${result.data.failedCount || 0}.`;
            if (result.data.backupFileUrl && operationMode === 'replace') {
                successMessage += ` Previous data backed up.`; // Or provide a link if implemented
            }
        }
        setUploadStatus({ type: 'success', message: successMessage });
        setParsedStudents([]);
        setFileName(null);
      } else {
        setUploadStatus({ type: 'error', message: result.error || 'Failed to process data.' });
      }
    } catch (error) {
      console.error("Error seeding data:", error);
      setUploadStatus({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Student Data Bulk Upload</h1>

      {/* Operation Mode Selection */}
      <div className="mb-6 p-4 border rounded-lg bg-card">
        <Label className="text-lg font-semibold mb-2 block">Operation Mode:</Label>
        <RadioGroup
          value={operationMode}
          onValueChange={(value: OperationMode) => setOperationMode(value)}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="append" id="append" />
            <Label htmlFor="append">Append Data (Add new students, skip duplicates)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="update" id="update" />
            <Label htmlFor="update">Update Existing (Match by email, update fields; optionally add new)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="replace" id="replace" />
            <Label htmlFor="replace">Replace All Data (Backup old, then insert new)</Label>
          </div>
        </RadioGroup>
        {operationMode === 'replace' && (
            <Alert variant="destructive" className="mt-3 text-sm">
                <AlertTitle>Warning!</AlertTitle>
                <AlertDescription>
                Replace mode will first attempt to backup existing student data, then delete ALL current students, and then insert the new data. This is a destructive operation.
                </AlertDescription>
            </Alert>
        )}
         {operationMode === 'update' && (
            <Alert variant="default" className="mt-3 text-sm">
                <AlertDescription>
                Update mode will try to match students by email. If a password column is present and filled in your Excel, it will be updated. Otherwise, existing passwords remain unchanged. New students (not matched by email) will be added.
                </AlertDescription>
            </Alert>
        )}
      </div>


      <div
        {...getRootProps()}
        // ... (existing dropzone styling)
        className={`p-10 border-2 border-dashed rounded-lg cursor-pointer text-center transition-colors
                    ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-primary">Drop the Excel file here ...</p>
        ) : (
          <p>Drag 'n' drop an Excel file here, or click to select file (.xlsx, .xls)</p>
        )}
      </div>

      {/* ... (rest of the UI: fileName, progress, status messages, validation errors, preview table) ... */}
      {fileName && <p className="mt-4 text-sm">Selected file: {fileName}</p>}
      {isProcessing && <Progress value={50} className="w-full mt-4" />}

      {uploadStatus && (
        <Alert variant={uploadStatus.type === 'error' ? 'destructive' : 'default'} className="mt-4">
          <AlertTitle>{uploadStatus.type === 'success' ? 'Success!' : 'Operation Complete'}</AlertTitle>
          <AlertDescription>{uploadStatus.message}</AlertDescription>
        </Alert>
      )}

      {validationErrors.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-destructive mb-2">Validation Errors:</h3>
          <ul className="list-disc list-inside bg-destructive/10 p-4 rounded-md max-h-60 overflow-y-auto">
            {validationErrors.map((err, i) => (
              <li key={i} className="text-sm text-destructive-foreground">{err}</li>
            ))}
          </ul>
        </div>
      )}

      {parsedStudents.length > 0 && validationErrors.length === 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Parsed Students (Preview - First 5):</h3>
          <div className="overflow-x-auto bg-card p-4 rounded-md shadow">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  {Object.keys(parsedStudents[0]).slice(0, 5).map(key => <th key={key} className="p-2 text-left font-medium">{key}</th>)}
                </tr>
              </thead>
              <tbody>
                {parsedStudents.slice(0, 5).map((student, i) => (
                  <tr key={i} className="border-t">
                    {Object.values(student).slice(0, 5).map((value, j) => <td key={j} className="p-2">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={handleSeedData} disabled={isProcessing} className="mt-6 w-full md:w-auto">
            {isProcessing ? 'Processing...' : `Process ${parsedStudents.length} Students (${operationMode} mode)`}
          </Button>
        </div>
      )}
       {parsedStudents.length === 0 && validationErrors.length === 0 && fileName && !isProcessing && (
         <p className="mt-4 text-muted-foreground">No valid student data found in the file or all rows had errors.</p>
       )}
    </div>
  );
}