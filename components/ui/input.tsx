import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--ring,rgba(59,130,246,0.4))] relative focus-visible:z-[1]",
        "aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_3px_var(--destructive-ring,rgba(239,68,68,0.2))]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
