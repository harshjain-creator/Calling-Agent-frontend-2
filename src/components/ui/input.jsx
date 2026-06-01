import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-4 py-2 text-sm",
      "placeholder:text-[var(--color-fg-subtle)]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:border-transparent",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "transition-colors",
      className
    )}
    {...props}
  />
))
Input.displayName = "Input"

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[100px] w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm",
      "placeholder:text-[var(--color-fg-subtle)] resize-y",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:border-transparent",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "transition-colors",
      className
    )}
    {...props}
  />
))
Textarea.displayName = "Textarea"

export { Input, Textarea }
