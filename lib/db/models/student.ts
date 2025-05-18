
import mongoose, { Schema, Document, Types } from "mongoose";

// Define the User Document interface
export interface studentInterface extends Document {
  _id: Types.ObjectId;
  password: string;
  name: string;
  email: string;
  branch: string;
  phoneNumber: string;
  cgpa: number;
  activeBacklogs: number;
  gender: "male" | "female" | "other";
  hometown: string;
  dob: Date;
  photo?: string;
  socialMedia: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
  };
  education: {
    tenthMarks: number;
    twelfthMarks: number;
  };
  placement: {
    placed: boolean;
    package?: number;
    type?: "intern" | "fte" | "both";
    company?: string;
    offerDate?: Date;
  };
  accountStatus: "active" | "inactive" | "blocked";
  createdAt: Date;
  updatedAt?: Date;
}

// Create the schema
const studentSchema = new Schema<studentInterface>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    
    // Academic details
    branch: { type: String, required: true },
    cgpa: { type: Number, required: true },
    activeBacklogs: { type: Number, default: 0 },
    phoneNumber: { type: String, required: true },
    // Personal details
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    hometown: { type: String, required: true },
    dob: { type: Date, required: true },
    photo: { type: String },
    
    // Social Media
    socialMedia: {
      linkedin: { type: String },
      github: { type: String },
      twitter: { type: String },
      portfolio: { type: String }
    },
    
    // Education
    education: {
      tenthMarks: { type: Number, required: true },
      twelfthMarks: { type: Number, required: true }
    },
    
    // Placement
    placement: {
      placed: { type: Boolean, default: false },
      package: { type: Number },
      type: { type: String, enum: ["intern", "fte", "both"] },
      company: { type: String },
      offerDate: { type: Date }
    },
    
    // Account status
    accountStatus: { 
      type: String, 
      enum: ["active", "inactive", "blocked"],
      default: "active"
    }
  },
  { 
    timestamps: true 
  }
);

export const Student = mongoose.models.Student || mongoose.model<studentInterface>("Student", studentSchema);