"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function Nav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  // Ensure the component is mounted before rendering theme-dependent UI
  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path;

  // Return null to render nothing when user is logged in
  if (isLoggedIn) return null;

  return (
    <header className="backdrop-blur-xl bg-white/80 dark:bg-black/80 sticky top-0 z-40 w-full border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="hidden text-lg font-medium tracking-tight sm:inline-block">
              IIIT NAGPUR
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/")
                ? "text-primary font-semibold"
                : "text-foreground/70"
            )}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/about")
                ? "text-primary font-semibold"
                : "text-foreground/70"
            )}
          >
            About
          </Link>

          <Link
            href="/contact"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/contact")
                ? "text-primary font-semibold"
                : "text-foreground/70"
            )}
          >
            Contact
          </Link>
        </nav>

        {/* Login button */}
        <div className="flex items-center">
          <Button
            asChild
            size="sm"
            className="rounded-full px-5 bg-primary hover:bg-primary/90 transition-all shadow-sm"
          >
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
