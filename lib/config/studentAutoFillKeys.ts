import { studentInterface } from '@/lib/db/models/student'; // Adjust path as needed

// Define a type that represents the allowed keys for auto-fill
// This is a simplified example. A more robust solution might involve
// generating this from the studentInterface keys programmatically if possible,
// or using a more specific Zod enum on the backend that you can replicate here.
export type StudentAutoFillKey =
  | keyof Omit<studentInterface, '_id' | 'password' | 'socialMedia' | 'education' | 'placement' | 'accountStatus' | 'createdAt' | 'updatedAt' | 'photo' | '__v' | 'formsSubmitted'>
  | `education.${keyof studentInterface['education']}`
  | `placement.${keyof Omit<studentInterface['placement'], 'offerLetterUrl'>}` // Example: Exclude offerLetterUrl if it's not a simple value
  | 'rollNumber';

export const studentAutoFillableFields: { value: StudentAutoFillKey; label: string }[] = [
  { value: 'name', label: 'Full Name' },
  { value: 'email', label: 'Email Address' },
  { value: 'rollNumber', label: 'Roll Number' },
  { value: 'branch', label: 'Branch' },
  { value: 'phoneNumber', label: 'Phone Number' },
  { value: 'cgpa', label: 'CGPA' },
  { value: 'activeBacklogs', label: 'Active Backlogs' },
  { value: 'gender', label: 'Gender' },
  { value: 'hometown', label: 'Hometown' },
  { value: 'dob', label: 'Date of Birth (YYYY-MM-DD)' },
  // Education (ensure these keys match your studentInterface.education structure)
  { value: 'education.tenthMarks', label: '10th Marks (%)' },
  { value: 'education.twelfthMarks', label: '12th Marks (%)' },
  // Placement (ensure these keys match your studentInterface.placement structure)
  { value: 'placement.company', label: 'Placement - Company' },
  { value: 'placement.package', label: 'Placement - Package (LPA)' },
  { value: 'placement.type', label: 'Placement - Type (FTE/Intern)' },
  // Add other relevant fields from studentInterface
];