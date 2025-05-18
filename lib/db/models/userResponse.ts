// filepath: lib/db/models/userResponse.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface FieldResponse {
  fieldId: Types.ObjectId; // Corresponds to FormField._id
  fieldLabel: string; // For easier display and export
  value: any; // Can be string, number, date, file URL, etc.
}

export interface UserResponseInterface extends Document {
  _id: Types.ObjectId;
  formId: Types.ObjectId; // Ref to FormTemplate
  studentId: Types.ObjectId; // Ref to Student
  responses: FieldResponse[];
  submittedAt: Date;
}

const FieldResponseSchema = new Schema<FieldResponse>({
  fieldId: { type: Schema.Types.ObjectId, required: true },
  fieldLabel: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
}, { _id: false });

const UserResponseSchema = new Schema<UserResponseInterface>(
  {
    formId: { type: Schema.Types.ObjectId, ref: "FormTemplate", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    responses: [FieldResponseSchema],
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'submittedAt', updatedAt: false } } // Use submittedAt as createdAt
);

export const UserResponse = mongoose.models.UserResponse || mongoose.model<UserResponseInterface>("UserResponse", UserResponseSchema);