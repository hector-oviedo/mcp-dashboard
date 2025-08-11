// /src/components/ui/switch.tsx
"use client";
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border",
      "border-[color:var(--btn-border)]",
      "bg-secondary", // light: flat light track
      "dark:bg-[linear-gradient(to_bottom_right,var(--btn-from),var(--btn-to))]", // dark: match buttons
      "shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset]",
      "dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]",
      "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      className
    )}
    {...props}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 translate-x-1 rounded-full bg-current transition-transform",
        "data-[state=checked]:translate-x-6"
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = "Switch";
export { Switch };