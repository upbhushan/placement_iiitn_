import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--ring,rgba(59,130,246,0.4))] relative focus-visible:z-[1]",
        "aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_3px_var(--destructive-ring,rgba(239,68,68,0.2))]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
