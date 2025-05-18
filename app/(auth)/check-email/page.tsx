import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-10 h-10 text-primary"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>
        
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground px-8">
            We've sent you a login link. Check your email and click the link to sign in.
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Didn't receive an email? Check your spam folder or try again.
          </p>
          <Button asChild variant="outline">
            <Link href="/login">
              Back to login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}