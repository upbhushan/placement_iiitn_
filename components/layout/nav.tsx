"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export function Nav() {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    // Update localStorage to persist the preference
    localStorage.setItem("darkMode", newDarkMode ? "true" : "false");

    // Update document class
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Ensure the component is mounted before rendering theme-dependent UI
  useEffect(() => {
    // Check if dark mode was previously set in localStorage
    const savedDarkMode = localStorage.getItem("darkMode") === "true";

    // Update state based on localStorage or system preference
    setDarkMode(
      savedDarkMode ||
        (window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
    );

    // Apply dark mode class
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // If user is authenticated and not on homepage, render a different nav or no nav
  if (status === "authenticated" && pathname !== "/") {
    // For authenticated users in dashboards, you might want to render a different nav
    // or return null if the sidebar already handles navigation
    return null;
  }

  // For the landing page or other public pages
  return (
    <header
      className={`w-full ${
        darkMode ? "bg-[#00508F]" : "bg-[#0066CC]"
      } text-white`}
    >
      <div className="px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {/* Removed the rounded-full class and increased the size for better visibility */}
          <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center p-1">
            <Image 
              src="/logo.png" 
              alt="IIITN Logo" 
              width={60} 
              height={54} 
              className="object-contain" 
              priority
            />
          </div>
          <h1 className="text-xl font-semibold">Placement Cell, IIIT Nagpur</h1>
        </div>
        <div className="flex items-center space-x-6">
          {/* Show navigation links only on homepage */}
          {pathname === "/" && (
            <nav>
              <ul className="hidden md:flex space-x-8">
                <li>
                  <Link
                    href="#about-section"
                    className="hover:opacity-80 text-sm font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Why Recruit
                  </Link>
                </li>
                <li>
                  <Link
                    href="#director"
                    className="hover:opacity-80 text-sm font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('director-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Director's Message
                  </Link>
                </li>
                <li>
                  <Link
                    href="#contact"
                    className="hover:opacity-80 text-sm font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </nav>
          )}

          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-white hover:bg-white/20"
            onClick={toggleDarkMode}
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
            <span className="sr-only">
              {darkMode ? "Switch to light mode" : "Switch to dark mode"}
            </span>
          </Button>

          {/* Login button - only show if not authenticated */}
          {status !== "authenticated" && (
            // Update the Login button to ensure text visibility in dark mode
          // Update the Login button with new hover styles
        <Button
          variant="outline"
          className="text-[#0066CC] border-[#0066CC] hover:bg-gray-200 hover:text-black dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-200 dark:hover:text-black transition-colors"
          onClick={() => router.push("/login")}
        >
          Login
        </Button>
            // <Button
            //   variant="outline"
            //   className="border-white text-white hover:bg-white hover:text-[#0066CC] dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-[#00508F]"

            // >

            // </Button>
          )}
        </div>
      </div>
    </header>
  );
}
