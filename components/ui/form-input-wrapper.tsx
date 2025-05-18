"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface FormInputWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A wrapper component to ensure proper focus handling for form inputs
 * Use this around any input or input-like component that needs focus handling
 */
export function FormInputWrapper({ 
  children, 
  className 
}: FormInputWrapperProps) {
  return (
    <div className={cn(
      "relative w-full", 
      className
    )}>
      {children}
    </div>
  );
}

export default FormInputWrapper;
