import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Sheet         = DialogPrimitive.Root
const SheetTrigger  = DialogPrimitive.Trigger
const SheetClose    = DialogPrimitive.Close
const SheetPortal   = DialogPrimitive.Portal

const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/55 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
SheetOverlay.displayName = "SheetOverlay"

/**
 * Side sheet — slides from the right by default. Used for the mobile nav drawer.
 */
const SheetContent = React.forwardRef(({ className, side = "right", children, ...props }, ref) => {
  const sideMap = {
    right: "inset-y-0 right-0 h-full w-3/4 sm:max-w-sm border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
    left:  "inset-y-0 left-0  h-full w-3/4 sm:max-w-sm border-r data-[state=closed]:slide-out-to-left  data-[state=open]:slide-in-from-left",
    top:   "inset-x-0 top-0   h-auto w-full border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
    bottom:"inset-x-0 bottom-0 h-auto w-full border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
  }
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 glass-strong p-6 shadow-2xl transition-transform",
          "data-[state=open]:animate-in data-[state=closed]:animate-out duration-300",
          sideMap[side],
          className
        )}
        {...props}
      >
        {children}
        <SheetClose className="absolute right-4 top-4 rounded-md opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </SheetClose>
      </DialogPrimitive.Content>
    </SheetPortal>
  )
})
SheetContent.displayName = "SheetContent"

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetOverlay, SheetPortal }
