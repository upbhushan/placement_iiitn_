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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
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
  
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access your account
          </p>
        </div>

        <Tabs defaultValue="credentials" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="credentials">Password</TabsTrigger>
            <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
          </TabsList>
          
          <TabsContent value="credentials">
            <Card>
              <form onSubmit={handleEmailPasswordLogin}>
                <CardHeader>
                  <CardTitle>Email & Password</CardTitle>
                  <CardDescription>
                    Sign in with your email and password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email" 
                      placeholder="name@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link 
                        href="/forgot-password" 
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input 
                      id="password"
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="magic-link">
            <Card>
              <form onSubmit={handleMagicLinkLogin}>
                <CardHeader>
                  <CardTitle>Email Magic Link</CardTitle>
                  <CardDescription>
                    We'll send you a magic link to sign in
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email">Email</Label>
                    <Input 
                      id="magic-email"
                      type="email" 
                      placeholder="name@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isEmailSending}
                  >
                    {isEmailSending ? "Sending..." : "Send Magic Link"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 text-center text-sm">
          <Link href="/about" className="text-primary hover:underline">
            About Us
          </Link>
          {" | "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}

// Fixed component that properly wraps the search params usage in Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}