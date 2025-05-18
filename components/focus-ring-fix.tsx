"use client";

import { useFocusRingFix } from "@/lib/hooks/useFocusRingFix";

/**
 * Component that applies focus ring fixes globally
 * Import and add this to your layout or root component
 */
export default function FocusRingFix() {
  // Apply focus ring fix
  useFocusRingFix();
  
  // This component doesn't render anything
  return null;
}
