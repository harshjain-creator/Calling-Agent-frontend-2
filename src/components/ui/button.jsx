import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent-soft)] hover:bg-[var(--color-accent-strong)] hover:shadow-xl active:scale-[0.98]",
        gradient:
          "text-white shadow-xl bg-[length:200%_100%] bg-[linear-gradient(90deg,var(--gradient-1),var(--gradient-2),var(--gradient-3))] hover:bg-[position:100%_0] transition-[background-position] duration-500 active:scale-[0.98]",
        outline:
          "border border-[var(--color-border-strong)] bg-transparent hover:bg-[var(--color-bg-muted)] text-[var(--color-fg)]",
        ghost:
          "hover:bg-[var(--color-bg-muted)] text-[var(--color-fg)]",
        secondary:
          "bg-[var(--color-bg-muted)] text-[var(--color-fg)] hover:bg-[var(--color-border)]",
        link:
          "text-[var(--color-accent)] underline-offset-4 hover:underline",
        glass:
          "glass text-[var(--color-fg)] hover:bg-[var(--color-bg-elevated)]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm:      "h-8 px-3 text-xs",
        lg:      "h-12 px-7 text-base",
        xl:      "h-14 px-9 text-base rounded-2xl",
        icon:    "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
})
Button.displayName = "Button"

export { Button, buttonVariants }
