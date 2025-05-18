
'use client'; 

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import useStudentStore, { mapToStudentData } from '@/lib/store/userStore'; 

// This component synchronizes the NextAuth session with the Zustand store
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { setStudent, clearStudent, student: zustandStudent } = useStudentStore();

  useEffect(() => {
    // When session is authenticated and Zustand store is empty
    if (status === 'authenticated' && session?.user && !zustandStudent) {
      // Assuming session.user contains the detailed student data
      // If not, you might need an API call here to fetch full student details
      const studentDataForStore = mapToStudentData(session.user);
      if (studentDataForStore) {
        setStudent(studentDataForStore);
      }
    }
    // When session ends (unauthenticated) and Zustand store still has data
    else if (status === 'unauthenticated' && zustandStudent) {
      clearStudent();
    }
    // 'loading' status means we wait for authentication check to complete
  }, [status, session, setStudent, clearStudent, zustandStudent]);

  // Render children regardless of auth status; the store reflects the state
  return <>{children}</>;
}