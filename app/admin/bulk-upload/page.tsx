
"use client";

import React, { useState, useCallback, JSX } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { Loader2, Upload, FileSpreadsheet, Check, AlertCircle, ChevronDown, ChevronUp, Info, X, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Student validation schema remains the same
// Update the schema definition around line 15

const studentValidationSchemaServer = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(), // Optional: only hash and update if provided
  branch: z.string().min(1),
  phoneNumber: z.string().min(1),
  cgpa: z.number().min(0).max(10),
  activeBacklogs: z.number().min(0),
  gender: z.enum(["male", "female", "other"]),
  hometown: z.string().min(1),
  dob: z.date(),
  education: z.object({
    tenthMarks: z.number().min(0).max(100),
    twelfthMarks: z.number().min(0).max(100),
  }),
  photo: z.string().url().optional().or(z.literal('')),
  // Properly define socialMedia
  socialMedia: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    portfolio: z.string().url().optional().or(z.literal('')),
  }).optional(),
  // Properly define placement
  placement: z.object({
    placed: z.boolean().default(false),
    package: z.number().optional(),
    company: z.string().optional(),
    offerDate: z.date().optional(),
    type: z.enum(["intern", "fte", "both"]).optional(),
  }).optional(),
  accountStatus: z.enum(["active", "inactive", "blocked"]).default("active").optional(),
});

type ParsedStudent = z.infer<typeof studentValidationSchemaServer>;
type OperationMode = "append" | "replace" | "update";

type UploadStatusType = { type: 'success' | 'error'; message: string | JSX.Element };

const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;

  // Check if the date is in DD-MM-YYYY format
  const ddmmyyyyMatch = dateString.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [_, day, month, year] = ddmmyyyyMatch;
    // JavaScript months are 0-indexed, so subtract 1 from the month
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Try parsing as ISO date (YYYY-MM-DD)
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};


export default function AdminSettingsPage() {
  const [rawJsonData, setRawJsonData] = useState<any[]>([]);
  const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatusType | null>(null);
  const [operationMode, setOperationMode] = useState<OperationMode>("append");
  const [currentTab, setCurrentTab] = useState<string>("upload");
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // For stats and visualization
  const [dataStats, setDataStats] = useState({
    total: 0,
    valid: 0,
    invalid: 0,
    branchDistribution: {} as Record<string, number>,
    genderDistribution: {} as Record<string, number>,
    placementStatus: { placed: 0, notPlaced: 0 }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadStatus(null);
    setValidationErrors([]);
    setParsedStudents([]);
    setRawJsonData([]);
    setUploadProgress(0);

    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFileName(file.name);
      setIsProcessing(true);

      // For a nicer loading animation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

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

          setRawJsonData(jsonData.slice(0, 5));

          const students: ParsedStudent[] = [];
          const errors: string[] = [];
          const branchCount: Record<string, number> = {};
          const genderCount: Record<string, number> = {};
          let placedCount = 0;
          let notPlacedCount = 0;

          jsonData.forEach((row, index) => {
            const excelRowNumber = index + 2;

            // Replace the mappedRow creation in the onDrop function (around line 107)

            const mappedRow = {
              name: row["Full Name"] || row["Name"] || row["name"],
              email: row["Email Address"] || row["Email"] || row["email"],
              password: row["Password"] || row["password"],
              branch: row["Branch"] || row["branch"],
              phoneNumber: row["Phone Number"] || row["phoneNumber"],
              cgpa: parseFloat(row["CGPA"] || row["cgpa"] || "0"),
              activeBacklogs: parseInt(row["Active Backlogs"] || row["activeBacklogs"] || "0", 10),
              gender: (row["Gender"] || row["gender"] || "")?.toLowerCase(),
              hometown: row["Hometown"] || row["hometown"],
              dob: parseDate(row["Date of Birth"] || row["DOB"] || row["dob"]),
              education: {
                tenthMarks: parseFloat(row["10th Marks"] || row["tenthMarks"] || "0"),
                twelfthMarks: parseFloat(row["12th Marks"] || row["twelfthMarks"] || "0"),
              },
              // Fix placement data mapping
              placement: {
                placed: row["Placed"] === "true" || row["placed"] === "true" ||
                  Boolean(row["Company"] || row["Company Name"] || row["company"]),
                package: parseFloat(row["Package"] || row["Package offered"] || row["package"] || "0") || undefined,
                company: row["Company"] || row["Company Name"] || row["Company Name 1"] || row["company"] || "",
                type: row["Type"] || row["type"] || "fte", // Default to "fte" if not provided
              },
              accountStatus: (row["Account Status"] || row["accountStatus"] || "active")?.toLowerCase(),
              photo: row["Photo URL"] || row["photo"] || "",
              // Fix social media mapping
              socialMedia: {
                linkedin: row["LinkedIn Profile"] || row["LinkedIn"] || "",
                github: row["GitHub Profile"] || row["GitHub"] || "",
                twitter: row["Twitter Profile"] || row["Twitter"] || "",
                portfolio: row["Portfolio URL"] || row["Portfolio"] || "",
              }
            };

            const validationResult = studentValidationSchemaServer.safeParse(mappedRow);
            if (validationResult.success) {
              students.push(validationResult.data);

              // Collect stats for visualization
              const branch = validationResult.data.branch;
              branchCount[branch] = (branchCount[branch] || 0) + 1;

              const gender = validationResult.data.gender;
              genderCount[gender] = (genderCount[gender] || 0) + 1;

              if (validationResult.data.placement?.placed) {
                placedCount++;
              } else {
                notPlacedCount++;
              }
            } else {
              errors.push(
                `Excel Row ${excelRowNumber}: ${validationResult.error.errors.map((e) => `${e.path.join('.')} - ${e.message}`).join('; ')}`
              );
            }
          });

          setParsedStudents(students);
          setValidationErrors(errors);
          setDataStats({
            total: jsonData.length,
            valid: students.length,
            invalid: errors.length,
            branchDistribution: branchCount,
            genderDistribution: genderCount,
            placementStatus: { placed: placedCount, notPlaced: notPlacedCount }
          });

          // Complete the progress bar
          setUploadProgress(100);
          // Switch to validation tab if we have data
          if (students.length > 0 || errors.length > 0) {
            setCurrentTab("validation");
          }

        } catch (error) {
          console.error("Error parsing Excel file:", error);
          setValidationErrors(["Failed to parse Excel file. Ensure it's a valid .xlsx or .xls file and the format is correct."]);
          setRawJsonData([]);
          setUploadStatus({ type: 'error', message: "File parsing failed. Please check file format and try again." });
        } finally {
          clearInterval(progressInterval);
          setIsProcessing(false);
        }
      };

      reader.readAsBinaryString(file);
    }
  }, [operationMode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  const handleSeedData = async () => {
    if (parsedStudents.length === 0) {
      setUploadStatus({ type: 'error', message: 'No valid student data to seed. Please check the file or validation errors.' });
      return;
    }

    setIsProcessing(true);
    setUploadStatus(null);

    // For a nicer loading animation
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 5;
      });
    }, 300);

    try {
      const response = await fetch('/api/admin/students/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: parsedStudents, mode: operationMode }),
      });

      const result = await response.json();

      if (response.ok || response.status === 207) {
        const backendData = result.data || {};
        const processed = backendData.processedCount || 0;
        const inserted = backendData.insertedCount || 0;
        const updated = backendData.updatedCount || 0;
        const replaced = backendData.replacedCount || 0;
        const failedDB = backendData.failedCount || 0;

        const messageParts: JSX.Element[] = [];
        messageParts.push(
          <span key="mainMsg" className="font-medium">
            {result.message || `Operation successful.`}
          </span>
        );

        if (processed > 0 || inserted > 0 || updated > 0 || (operationMode === 'replace' && replaced >= 0) || failedDB > 0) {
          messageParts.push(<br key="br1" />);
          messageParts.push(
            <div key="stats" className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="py-1 px-3 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800">
                Attempted: {processed}
              </Badge>

              {inserted > 0 && (
                <Badge variant="outline" className="py-1 px-3 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20">
                  <Check size={14} className="mr-1" /> Added: {inserted}
                </Badge>
              )}

              {updated > 0 && (
                <Badge variant="outline" className="py-1 px-3 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20">
                  <Check size={14} className="mr-1" /> Updated: {updated}
                </Badge>
              )}

              {operationMode === 'replace' && (
                <Badge variant="outline" className="py-1 px-3 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20">
                  <Database size={14} className="mr-1" /> Old Records Deleted: {replaced}
                </Badge>
              )}

              {failedDB > 0 && (
                <Badge variant="outline" className="py-1 px-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20">
                  <X size={14} className="mr-1" /> Failed in DB: {failedDB}
                </Badge>
              )}
            </div>
          );
        }

        if (backendData.backupFileUrl && operationMode === 'replace') {
          messageParts.push(<br key="br2" />);
          messageParts.push(
            <span key="backup" className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
              <Info size={14} /> Previous data backed up
            </span>
          );
        }

        // Display detailed errors from backend if any
        if (result.detailedErrors && result.detailedErrors.length > 0) {
          messageParts.push(<br key="br3" />);
          messageParts.push(
            <Accordion type="single" collapsible className="mt-2 w-full">
              <AccordionItem value="errors">
                <AccordionTrigger className="text-sm font-medium text-red-600 dark:text-red-400 py-2">
                  Show {result.detailedErrors.length} DB Errors
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc list-inside max-h-32 overflow-y-auto bg-red-50 dark:bg-red-950/20 rounded p-3">
                    {result.detailedErrors.map((err: { email?: string, error: string }, index: number) => (
                      <li key={`detail-${index}`} className="text-xs text-red-700 dark:text-red-400">
                        {err.email ? <strong>{err.email}:</strong> : ''} {err.error}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        }

        setUploadStatus({ type: 'success', message: <>{messageParts}</> });
        setCurrentTab("success");

        // Keep the data for reference, don't clear immediately
      } else {
        // For error messages with detailed errors

        // For error messages with detailed errors
        let errorTitle = "Operation Failed";
        let errorMessage: JSX.Element;

        // Get a more user-friendly explanation based on the operation mode
        const getErrorExplanation = () => {
          switch (operationMode) {
            case "append":
              return "You're trying to add students that already exist in the database. In 'Append' mode, duplicate students are skipped.";
            case "update":
              return "There was an issue processing these students. If you meant to update existing records instead of reporting duplicates as errors, please ensure your data format is correct.";
            case "replace":
              return "There was an unexpected issue replacing the student data. This could be due to database constraints or permissions.";
            default:
              return "There was an issue processing your request.";
          }
        };

        // Create a more user-friendly categorization of errors
        const categorizeErrors = (errors: { email?: string, error: string }[]) => {
          const categories: Record<string, { count: number, examples: string[] }> = {};

          errors.forEach(err => {
            let category = "Other Error";
            let cleanError = err.error;

            // Check for known error patterns and categorize them
            if (err.error.includes("Duplicate email")) {
              category = "Duplicate Email";
              cleanError = "Already exists in database";
            } else if (err.error.includes("validation")) {
              category = "Validation Error";
            } else if (err.error.includes("DB")) {
              category = "Database Error";
            }

            if (!categories[category]) {
              categories[category] = { count: 0, examples: [] };
            }

            categories[category].count++;
            if (err.email) {
              categories[category].examples.push(err.email);
            }
          });

          return categories;
        };

        if (result.detailedErrors && result.detailedErrors.length > 0) {
          const categories = categorizeErrors(result.detailedErrors);

          errorMessage = (
            <div className="space-y-4">
              <p key="explanation" className="text-muted-foreground">{getErrorExplanation()}</p>

              <div key="error-table" className="rounded-md border bg-card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Issue Type</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Count</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">What This Means</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Example Emails</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {Object.entries(categories).map(([category, { count, examples }]) => (
                      <tr key={category} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">
                          {category === "Duplicate Email" ? (
                            <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-200">
                              Duplicate Email
                            </Badge>
                          ) : category === "Validation Error" ? (
                            <Badge variant="outline" className="bg-red-50 dark:bg-red-950/30 text-red-600 border-red-200">
                              Validation Error
                            </Badge>
                          ) : (
                            <Badge variant="outline">{category}</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className="bg-muted/50">{count}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {category === "Duplicate Email" ? (
                            <span>Students with these emails already exist in the database.</span>
                          ) : category === "Validation Error" ? (
                            <span>The data for these students doesn't match required format.</span>
                          ) : category === "Database Error" ? (
                            <span>There was an error saving these students to the database.</span>
                          ) : (
                            <span>Unexpected error occurred with these students.</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-md">
                            {examples.slice(0, 3).map((email, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs font-normal">
                                {email}
                              </Badge>
                            ))}
                            {examples.length > 3 && (
                              <Badge variant="outline" className="text-xs font-normal">
                                +{examples.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Accordion key="accordion" type="single" collapsible className="w-full">
                <AccordionItem value="all-errors" className="border-muted">
                  <AccordionTrigger className="text-sm">
                    View All Error Details ({result.detailedErrors.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="max-h-60 overflow-y-auto rounded-md border p-4 bg-muted/20">
                      <ul className="space-y-2">
                        {result.detailedErrors.map((err: { email?: string, error: string }, index: number) => (
                          <li key={`err-detail-${index}`} className="text-sm flex items-start gap-2">
                            <span className="text-red-500">•</span>
                            <span>
                              {err.email && <span className="font-medium">{err.email}: </span>}
                              {err.error}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div key="actions-footer" className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-2">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">What can you do?</h4>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    {operationMode === "append" && (
                      <>
                        <li key="append-tip-1">Switch to <strong>Update</strong> mode if you want to update existing students.</li>
                        <li key="append-tip-2">Remove duplicate students from your Excel file before uploading.</li>
                      </>
                    )}
                    {operationMode === "update" && (
                      <>
                        <li key="update-tip-1">Check if the data matches exactly what's expected by the system.</li>
                        <li key="update-tip-2">Ensure email addresses are correct in your Excel file.</li>
                      </>
                    )}
                    {operationMode === "replace" && (
                      <>
                        <li key="replace-tip-1">Try again or try the Update mode instead.</li>
                        <li key="replace-tip-2">Contact an administrator if the problem persists.</li>
                      </>
                    )}
                  </ul>
                </div>

                <Button
                  key="back-button"
                  onClick={() => setCurrentTab("validation")}
                  className="bg-muted/80 hover:bg-muted text-foreground">
                  Back to Data Validation
                </Button>
              </div>
            </div>
          );
        } else {
          // Simple error without detailed errors
          errorMessage = (
            <div className="text-center py-2">
              <p>{result.error || `Failed to process data. Please check your input and try again.`}</p>
            </div>
          );
        }

        setUploadStatus({ type: 'error', message: errorMessage });
        setCurrentTab("upload");
      }
    } catch (error) {
      console.error("Error seeding data:", error);
      setUploadStatus({
        type: 'error',
        message: 'An unexpected error occurred during seeding. Check console for details.'
      });
    } finally {
      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsProcessing(false);
    }
  };

  // Function to render operation mode cards
  const renderOperationModeCards = () => {
    const modeData = {
      append: {
        title: "Append Data",
        description: "Add new students while skipping duplicates",
        icon: <Upload className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />,
        class: "border-emerald-200 dark:border-emerald-900 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30",
        activeClass: "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-md"
      },
      update: {
        title: "Update Existing",
        description: "Match by email & update fields; optionally add new",
        icon: <Check className="h-6 w-6 text-amber-500 dark:text-amber-400" />,
        class: "border-amber-200 dark:border-amber-900 hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/30",
        activeClass: "border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 shadow-md"
      },
      replace: {
        title: "Replace All Data",
        description: "Backup old data, delete all, then insert new",
        icon: <Database className="h-6 w-6 text-purple-500 dark:text-purple-400" />,
        class: "border-purple-200 dark:border-purple-900 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/30",
        activeClass: "border-purple-500 bg-purple-50/80 dark:bg-purple-950/40 shadow-md"
      }
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {Object.entries(modeData).map(([mode, data]) => (
          <div
            key={mode}
            onClick={() => setOperationMode(mode as OperationMode)}
            className={`cursor-pointer border rounded-xl p-4 transition-all duration-200 
                      ${operationMode === mode ? data.activeClass : data.class}`}
          >
            <RadioGroup value={operationMode} onValueChange={(value: OperationMode) => setOperationMode(value)}>
              <div className="flex items-start space-x-3">
                <RadioGroupItem value={mode as OperationMode} id={mode} className="mt-1" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {data.icon}
                    <Label htmlFor={mode} className="text-lg font-medium">{data.title}</Label>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{data.description}</p>
                </div>
              </div>
            </RadioGroup>
          </div>
        ))}
      </div>
    );
  };

  // Get color classes based on operation mode
  const getModeColorClasses = () => {
    switch (operationMode) {
      case 'append':
        return {
          bg: "bg-emerald-500",
          bgLight: "bg-emerald-100 dark:bg-emerald-950/30",
          text: "text-emerald-500 dark:text-emerald-400",
          border: "border-emerald-200 dark:border-emerald-800"
        };
      case 'update':
        return {
          bg: "bg-amber-500",
          bgLight: "bg-amber-100 dark:bg-amber-950/30",
          text: "text-amber-500 dark:text-amber-400",
          border: "border-amber-200 dark:border-amber-800"
        };
      case 'replace':
        return {
          bg: "bg-purple-500",
          bgLight: "bg-purple-100 dark:bg-purple-950/30",
          text: "text-purple-500 dark:text-purple-400",
          border: "border-purple-200 dark:border-purple-800"
        };
    }
  };

  const colors = getModeColorClasses();

  // Render student table with enhanced UI
  const renderStudentTable = () => {
    return (
      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr>
              <th className="sticky left-0 z-20 bg-muted/80 backdrop-blur-sm px-4 py-3 text-left font-semibold">
                <div className={`${colors.text} flex items-center gap-1.5`}>
                  <Check size={16} />
                  <span>Action</span>
                </div>
              </th>
              {parsedStudents.length > 0 && Object.keys(parsedStudents[0]).map((key) => (
                <th key={key} className="px-4 py-3 text-left font-medium text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {parsedStudents.slice(0, 10).map((student, rowIndex) => {
              let intendedActionText = "";
              let actionIcon = null;
              let actionClass = "";

              switch (operationMode) {
                case "append":
                  intendedActionText = "Add";
                  actionIcon = <Upload size={14} />;
                  actionClass = "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30";
                  break;
                case "update":
                  intendedActionText = "Update";
                  actionIcon = <Check size={14} />;
                  actionClass = "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30";
                  break;
                case "replace":
                  intendedActionText = "Replace";
                  actionIcon = <Database size={14} />;
                  actionClass = "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30";
                  break;
              }

              return (
                <tr key={rowIndex} className={`${rowIndex % 2 === 0 ? "bg-transparent" : "bg-muted/30"} hover:bg-muted/60 transition-colors`}>
                  <td className={`sticky left-0 z-10 px-4 py-3 ${rowIndex % 2 === 0 ? "bg-card" : "bg-muted/30"} backdrop-blur-sm`}>
                    <Badge variant="outline" className={`flex items-center gap-1 ${actionClass} font-medium`}>
                      {actionIcon}
                      {intendedActionText}
                    </Badge>
                  </td>

                  {Object.keys(student).map((key) => {
                    const value = student[key as keyof ParsedStudent];
                    let displayValue: string | JSX.Element = "";

                    if (value instanceof Date) {
                      displayValue = value.toISOString().split('T')[0];
                    } else if (typeof value === 'object' && value !== null) {
                      const objEntries = Object.entries(value)
                        .filter(([_, val]) => val !== undefined && val !== null && val !== '')
                        .map(([objKey, objVal]) => (
                          <div key={objKey} className="text-xs">
                            <span className="font-medium text-primary/70 dark:text-primary/60 capitalize">
                              {objKey.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className="ml-1 text-gray-700 dark:text-gray-300">
                              {String(objVal)}
                            </span>
                          </div>
                        ));
                      displayValue = objEntries.length > 0 ?
                        <div className="space-y-0.5">{objEntries}</div> :
                        <span className="text-gray-400 dark:text-gray-500 italic">—</span>;
                    } else if (typeof value === 'boolean') {
                      displayValue = value ? (
                        <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900">Yes</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900">No</Badge>
                      );
                    } else {
                      displayValue = (value === null || value === undefined || String(value).trim() === "")
                        ? <span className="text-gray-400 dark:text-gray-500 italic">—</span>
                        : <span className="text-gray-700 dark:text-gray-300">{String(value)}</span>;
                    }

                    return (
                      <td key={key} className="px-4 py-3 align-top">
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {parsedStudents.length > 10 && (
          <div className="p-4 text-center border-t bg-muted/30">
            <Badge variant="outline" className="bg-primary/5 text-primary-foreground">
              + {parsedStudents.length - 10} more students
            </Badge>
          </div>
        )}
      </div>
    );
  };

  // Render data visualization card
  const renderDataStats = () => {
    if (parsedStudents.length === 0) return null;

    return (
      <Card className="mt-6 bg-gradient-to-b from-card to-card/80">
        <CardHeader>
          <CardTitle className="text-lg">Data Overview</CardTitle>
          <CardDescription>Statistics about your uploaded student data</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-primary">{dataStats.valid}</div>
              <div className="text-sm text-muted-foreground mt-1">Valid Students</div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <div className="flex justify-center space-x-2">
                <div className="text-3xl font-bold text-emerald-500 dark:text-emerald-400">{dataStats.placementStatus.placed}</div>
                <div className="text-3xl font-bold text-muted-foreground">/</div>
                <div className="text-3xl font-bold text-rose-500 dark:text-rose-400">{dataStats.placementStatus.notPlaced}</div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">Placed / Not Placed</div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <div className="text-3xl font-bold text-primary">{Object.keys(dataStats.branchDistribution).length}</div>
                <div className="text-lg text-muted-foreground self-end">Branches</div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {Object.keys(dataStats.branchDistribution).slice(0, 3).join(", ")}
                {Object.keys(dataStats.branchDistribution).length > 3 && "..."}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Student Data Upload</h1>
            <p className="text-muted-foreground mt-1">Import student records from Excel with validation</p>
          </div>

          <Badge variant="outline" className={`${colors.bgLight} ${colors.text} ${colors.border} font-medium py-1.5 px-3`}>
            {operationMode === 'append' && "Add New Mode"}
            {operationMode === 'update' && "Update Mode"}
            {operationMode === 'replace' && "Replace All Mode"}
          </Badge>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="upload" disabled={isProcessing}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="validation" disabled={isProcessing || parsedStudents.length === 0 && validationErrors.length === 0}>
              <Check className="h-4 w-4 mr-2" />
              Validation
            </TabsTrigger>
            <TabsTrigger value="success" disabled={uploadStatus?.type !== 'success'}>
              <Database className="h-4 w-4 mr-2" />
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="focus-visible:outline-none focus-visible:ring-0">
            <Card className="border bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Choose Operation Mode</CardTitle>
                <CardDescription>
                  Select how you want to process the imported student data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderOperationModeCards()}

                {operationMode === 'replace' && (
                  <Alert variant="destructive" className="mt-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Warning! Destructive Operation</AlertTitle>
                    <AlertDescription>
                      Replace mode will first backup existing student data, then delete ALL current students, and then insert the new data.
                    </AlertDescription>
                  </Alert>
                )}

                {operationMode === 'update' && (
                  <Alert variant="default" className="mt-6 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Update mode matches students by email. If a password column is present in your Excel, it will be updated. Otherwise, existing passwords remain unchanged. New students (not matched by email) will be added.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>

              <CardHeader className="pt-2">
                <CardTitle>Upload Excel File</CardTitle>
                <CardDescription>
                  Upload your .xlsx or .xls file containing student data
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 overflow-hidden
                    ${isDragActive
                      ? `${colors.bgLight} ${colors.border} shadow-lg`
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }
                  `}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className={`rounded-full p-3 mb-3 ${colors.bgLight}`}>
                      <FileSpreadsheet className={`h-8 w-8 ${colors.text}`} />
                    </div>
                    {isDragActive ? (
                      <p className={`text-lg font-medium ${colors.text}`}>Drop the Excel file here...</p>
                    ) : (
                      <>
                        <p className="text-lg font-medium mb-1">Drag & drop an Excel file here</p>
                        <p className="text-sm text-muted-foreground">or click to browse files (.xlsx, .xls)</p>
                      </>
                    )}
                  </div>
                </div>

                {fileName && !isProcessing && (
                  <div className="flex items-center">
                    <Badge variant="outline" className="py-1 px-3 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900">
                      <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
                      {fileName}
                    </Badge>
                  </div>
                )}

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{uploadProgress < 100 ? "Processing file..." : "Processing complete"}</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className={`h-2 ${colors.bg}`} />
                  </div>
                )}

                {uploadStatus && (
                  <Alert variant={uploadStatus.type === 'error' ? 'destructive' : 'default'}
                    className={uploadStatus.type === 'success'
                      ? "bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-900"
                      : undefined}>
                    {uploadStatus.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertTitle>{uploadStatus.type === 'success' ? 'Success!' : 'Error!'}</AlertTitle>
                    <AlertDescription>{uploadStatus.message}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Raw Data Preview */}
            {rawJsonData.length > 0 && !isProcessing && (
              <Accordion type="single" collapsible className="mt-6">
                <AccordionItem value="raw-data" className="border rounded-lg overflow-hidden">
                  <AccordionTrigger className="px-4 py-3 bg-muted/30 hover:bg-muted/50">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <FileSpreadsheet className="h-4 w-4" />
                      Raw Data Preview (First 5 rows)
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="bg-muted/10 p-4 overflow-x-auto">
                      <pre className="text-xs">{JSON.stringify(rawJsonData, null, 2)}</pre>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </TabsContent>

          <TabsContent value="validation" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            {/* Validation Statistics */}
            {renderDataStats()}

            {/* Qualified Students Table */}
            {parsedStudents.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-1.5">
                        <Check className="h-5 w-5 text-green-500" />
                        Valid Students
                        <Badge className="ml-2 bg-green-500">{parsedStudents.length}</Badge>
                      </CardTitle>
                      <CardDescription>
                        These students passed validation and are ready for processing
                      </CardDescription>
                    </div>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleSeedData}
                            disabled={isProcessing}
                            className={`${colors.bg} hover:opacity-90 text-white shadow`}>
                            {isProcessing
                              ? <span className="flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /> Processing...</span>
                              : `Process ${parsedStudents.length} Students`}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Start processing students in {operationMode} mode</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {renderStudentTable()}
                </CardContent>
              </Card>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Card className="border-red-200 dark:border-red-900/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-1.5 text-red-600 dark:text-red-500">
                    <AlertCircle className="h-5 w-5" />
                    Validation Errors
                    <Badge variant="outline" className="ml-2 bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900">
                      {validationErrors.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-red-600/80 dark:text-red-400/80">
                    These rows contain errors and will be skipped during processing
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="bg-red-50 dark:bg-red-950/20 rounded-lg overflow-hidden border border-red-100 dark:border-red-900/50">
                    <div className="max-h-60 overflow-y-auto p-4">
                      <ul className="space-y-2">
                        {validationErrors.map((err, i) => (
                          <li key={i} className="text-sm text-red-700 dark:text-red-400 flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{err}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleSeedData}
                disabled={isProcessing || parsedStudents.length === 0}
                className={`${colors.bg} hover:opacity-90 text-white`}>
                {isProcessing
                  ? <span className="flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /> Processing...</span>
                  : `Process ${parsedStudents.length} Students (${operationMode} mode)`}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="success" className="focus-visible:outline-none focus-visible:ring-0">
            {uploadStatus?.type === 'success' && (
              <Card className="border-green-200 dark:border-green-900 bg-gradient-to-b from-green-50/50 to-white dark:from-green-950/10 dark:to-card/90">
                <CardHeader>
                  <div className="mx-auto rounded-full w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-900/30">
                    <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-center text-xl mt-4">Processing Completed!</CardTitle>
                  <CardDescription className="text-center">
                    Your student data has been successfully processed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="bg-white dark:bg-black/20 border">
                    <AlertDescription>{uploadStatus.message}</AlertDescription>
                  </Alert>
                </CardContent>
                <CardFooter className="flex justify-center gap-4">
                  <Button variant="outline" onClick={() => setCurrentTab("upload")}>
                    Upload Another File
                  </Button>
                  <Button variant="default" onClick={() => {
                    // Navigate to students page (you would implement this)
                    console.log("Navigate to students page");
                  }}>
                    View All Students
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Message if a file was processed but no valid data found */}
        {fileName && !isProcessing && parsedStudents.length === 0 && rawJsonData.length === 0 && currentTab === "upload" && (
          <Alert variant="default" className="mt-6 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Valid Data Found</AlertTitle>
            <AlertDescription>
              {validationErrors.length > 0
                ? "No students passed validation. Please check the errors listed in the validation tab or verify the file format."
                : "No student data found in the uploaded file, or the file could not be parsed correctly."}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}