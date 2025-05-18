import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Interface for the student data to be stored in Zustand
// Based on studentInterface, but simplified for client-side state
interface StudentData {
  id: string | null; // Changed from Types.ObjectId to string
  name: string | null;
  email: string | null;
  branch: string | null;
  phoneNumber: string | null;
  cgpa: number | null;
  activeBacklogs: number | null;
  gender: "male" | "female" | "other" | null;
  hometown: string | null;
  dob: string | null; // Store date as string for easier serialization
  photo?: string | null;
  socialMedia?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
  } | null;
  education?: {
    tenthMarks: number | null;
    twelfthMarks: number | null;
  } | null;
  placement?: {
    placed: boolean | null;
    package?: number;
    type?: "intern" | "fte" | "both";
    company?: string;
    offerDate?: string; // Store date as string
  } | null;
  accountStatus?: "active" | "inactive" | "blocked" | null;
  createdAt?: string | null; // Store date as string
  // Note: Password is intentionally omitted for security
}

// Interface for the Zustand store state and actions
interface StudentState {
  student: StudentData | null;
  setStudent: (studentData: Partial<StudentData> | null) => void; // Allow partial updates or setting null
  clearStudent: () => void;
  // Add other specific actions if needed, e.g., updatePlacement(data)
}

// Create the Zustand store with persistence
const useStudentStore = create<StudentState>()(
  persist(
    (set) => ({
      // Initial state
      student: null,

      // Action to set or update student data
      setStudent: (studentData) => set((state) => ({
        // If null is passed, clear the student.
        // Otherwise, merge the new partial data with existing data (if any).
        student: studentData === null
          ? null
          : { ...(state.student ?? {}), ...studentData } as StudentData // Ensure type correctness
      })),

      // Action to clear student data (logout)
      clearStudent: () => set({ student: null }),

    }),
    {
      name: 'student-storage', // Unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // Use localStorage
      // Optionally, define which parts of the state to persist:
      // partialize: (state) => ({ student: state.student }),
    }
  )
);

export default useStudentStore;

// Helper function to map data fetched (e.g., from session or API) to StudentData format
export const mapToStudentData = (fetchedData: any): Partial<StudentData> | null => {
  if (!fetchedData) return null;

  // Basic mapping, adjust based on the actual structure of fetchedData
  // Ensure dates are converted to strings if necessary for consistency
  return {
    id: fetchedData._id?.toString() || fetchedData.id || null,
    name: fetchedData.name || null,
    email: fetchedData.email || null,
    branch: fetchedData.branch || null,
    phoneNumber: fetchedData.phoneNumber || null,
    cgpa: fetchedData.cgpa ?? null, // Use nullish coalescing for numbers/booleans
    activeBacklogs: fetchedData.activeBacklogs ?? null,
    gender: fetchedData.gender || null,
    hometown: fetchedData.hometown || null,
    dob: fetchedData.dob ? new Date(fetchedData.dob).toISOString() : null,
    photo: fetchedData.photo || null,
    socialMedia: fetchedData.socialMedia || null,
    education: fetchedData.education || null,
    placement: fetchedData.placement ? {
        ...fetchedData.placement,
        offerDate: fetchedData.placement.offerDate ? new Date(fetchedData.placement.offerDate).toISOString() : undefined
    } : null,
    accountStatus: fetchedData.accountStatus || null,
    createdAt: fetchedData.createdAt ? new Date(fetchedData.createdAt).toISOString() : null,
  };
};