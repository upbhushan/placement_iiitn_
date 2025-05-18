"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { EyeIcon, EyeOffIcon } from "lucide-react"; 
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userType = searchParams?.get("type") || "student";
  
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      userType,
    });
    
    if (result?.error) {
      setError("Invalid email or password");
      setIsLoading(false);
    } else {
      router.push(callbackUrl);
    }
  };
  
  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email");
      return;
    }
    
    setIsEmailSending(true);
    setError(null);
    
    const result = await signIn("email", {
      redirect: false,
      email,
    });
    
    if (result?.error) {
      setError("Failed to send login link. Please try again.");
    } else {
      router.push("/check-email");
    }
    
    setIsEmailSending(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* Logo and Heading */}
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-white rounded-lg flex items-center justify-center p-1">
                <Image 
                  src="/logo.png" 
                  alt="IIITN Logo" 
                  width={64} 
                  height={64}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {userType === "admin" ? "Coordinator Login" : "Student Login"}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Sign in to access the IIIT Nagpur Placement Portal
            </p>
          </div>

          <Card className="border-gray-200 dark:border-gray-700 shadow-lg">
            <form onSubmit={handleEmailPasswordLogin}>
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-600 dark:text-blue-400">Welcome Back</CardTitle>
                <CardDescription>
                  Enter your credentials to sign in
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="name@iiitn.ac.in" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    className="border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                    <Link 
                      href="/forgot-password" 
                      className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      className="pr-10 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button 
                        type="button"
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                        onClick={togglePasswordVisibility}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {error && (
                  <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800">
                  <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-5 pt-4"> {/* Increased space-y to 6 for more spacing */}
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Back to Home
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Need help? Contact the placement cell at <a href="mailto:placement@iiitn.ac.in" className="text-blue-600 dark:text-blue-400 hover:underline">placement@iiitn.ac.in</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fixed component that properly wraps the search params usage in Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}