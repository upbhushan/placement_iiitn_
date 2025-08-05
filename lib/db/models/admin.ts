import mongoose, { Schema, Document, Types } from "mongoose";

// Define the Admin Document interface
export interface adminInterface extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  designation: string;
  phoneNumber: string;
  gender: "male" | "female" | "other";
  
  // Account metadata
 
  password: string;
  accountStatus: "active" | "inactive" | "blocked";
  lastLogin?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

// Create the schema
const adminSchema = new Schema<adminInterface>(

  {
    _id: { 
      type: Schema.Types.ObjectId, 
      auto: true 
    },
    // Basic information
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true, 
      lowercase: true 
    },
    designation: { 
      type: String, 
      required: true 
    },
    phoneNumber: { 
      type: String, 
      required: true 
    },
    gender: { 
      type: String, 
      enum: ["male", "female", "other"], 
      required: true 
    },
    

    password: { 
      type: String, 
      required: true, 
      select: false // Don't include in query results unless explicitly requested
    },
    accountStatus: { 
      type: String, 
      enum: ["active", "inactive", "blocked"],
      default: "active"
    },
    lastLogin: { 
      type: Date 
    }
  },
  { 
    timestamps: true 
  }
);

// Create and export the model
export const Admin = mongoose.models.Admin || mongoose.model<adminInterface>("Admin", adminSchema);
