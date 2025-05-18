import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[500px] text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10 mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 text-destructive"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page. Please contact an administrator if you believe this is an error.
          </p>
        </div>
        
        <div className="space-y-4 pt-4">
          <Button asChild>
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}