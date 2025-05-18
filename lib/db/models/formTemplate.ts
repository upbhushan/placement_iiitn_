// filepath: lib/db/models/formTemplate.ts
import mongoose, { Schema, Document, Types } from "mongoose";
import { studentInterface } from "./student"; // Import the student interface

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  _id: Types.ObjectId; // For unique key in React
  label: string;
  fieldType: "text" | "email" | "number" | "date" | "file" | "select";
  placeholder?: string;
  required: boolean;
  options?: FormFieldOption[]; // For select dropdown
  autoFillKey?: keyof Omit<studentInterface, '_id' | 'password' | 'socialMedia' | 'education' | 'placement' | 'accountStatus' | 'createdAt' | 'updatedAt'> | `education.${keyof studentInterface['education']}` | `placement.${keyof studentInterface['placement']}`; // Key from student model for auto-fill
}

export interface FormColorScheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface FormTemplateInterface extends Document {
  _id: Types.ObjectId;
  adminId: Types.ObjectId; // Creator
  name: string;
  description?: string;
  fields: FormField[];
  colorScheme: FormColorScheme;
  uniqueFeatures?: string; // For any other custom settings
  published: boolean;
  sharedWith?: Types.ObjectId[]; // Array of student IDs it's specifically shared with (optional feature)
  createdAt: Date;
  updatedAt: Date;
}

const FormFieldSchema = new Schema<FormField>({
  label: { type: String, required: true },
  fieldType: { type: String, enum: ["text", "email", "number", "date", "file", "select"], required: true },
  placeholder: { type: String },
  required: { type: Boolean, default: false },
  options: [{ label: String, value: String }],
  autoFillKey: { type: String }, // e.g., 'name', 'email', 'cgpa', 'education.tenthMarks'
}, { _id: true }); // Ensure _id is created for each field for React keys

const FormTemplateSchema = new Schema<FormTemplateInterface>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Assuming you have a User model for admins
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    fields: [FormFieldSchema],
    colorScheme: {
      primaryColor: { type: String, default: "#007bff" },
      backgroundColor: { type: String, default: "#ffffff" },
      textColor: { type: String, default: "#333333" },
    },
    uniqueFeatures: { type: String },
    published: { type: Boolean, default: false },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: "Student" }],
  },
  { timestamps: true }
);

export const FormTemplate = mongoose.models.FormTemplate || mongoose.model<FormTemplateInterface>("FormTemplate", FormTemplateSchema);