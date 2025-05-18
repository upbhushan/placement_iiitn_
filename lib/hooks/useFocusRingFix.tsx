"use client";

/**
 * This script ensures proper input focus behavior across all form elements
 * It can be imported in any page or component that needs additional focus handling
 */

import { useEffect } from "react";

export function useFocusRingFix() {
  useEffect(() => {
    // Fix for inputs and textareas that might have layout issues on focus
    const fixInputFocus = () => {
      // Query all form elements that can have focus issues
      const formElements = document.querySelectorAll(
        'input, textarea, select, [role="combobox"], [contenteditable="true"]'
      );

      formElements.forEach((element) => {
        // Add focus handling attributes
        element.setAttribute("data-focus-fixed", "true");
        
        // Cast element to HTMLElement to access style property
        const htmlElement = element as HTMLElement;
        
        // Make sure the element has a proper stacking context
        if (!htmlElement.style.position || htmlElement.style.position === "static") {
          htmlElement.style.position = "relative";
        }
        
        if (!htmlElement.style.zIndex) {
          htmlElement.style.zIndex = "0";
        }
        
        // Add focus event listeners
        element.addEventListener("focus", () => {
          (element as HTMLElement).style.zIndex = "1";
        });
        
        element.addEventListener("blur", () => {
          (element as HTMLElement).style.zIndex = "0";
        });
      });
    };

    fixInputFocus();
    
    // Re-apply when DOM changes (for dynamically added elements)
    const observer = new MutationObserver(fixInputFocus);
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => {
      observer.disconnect();
    };
  }, []);
}

export default useFocusRingFix;
