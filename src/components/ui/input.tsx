"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useMotionTemplate, useMotionValue, motion } from "motion/react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  glowRadius?: number;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, glowRadius = 100, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({
      currentTarget,
      clientX,
      clientY,
    }: React.MouseEvent<HTMLDivElement>) {
      const { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    }

    // two-layer radial gradient for blue→purple glow (uses tokens)
    const glow = useMotionTemplate`
      radial-gradient(${visible ? glowRadius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
        var(--glow-from), transparent 60%)
      ,radial-gradient(${visible ? glowRadius * 0.6 + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
        var(--glow-to), transparent 65%)
    `;

    return (
      <motion.div
        style={{ background: glow }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="group/input rounded-lg p-[2px] transition duration-300"
      >
        <input
          ref={ref}
          type={type}
          className={cn(
            // base
            "shadow-input flex h-10 w-full rounded-md border-none px-3 py-2 text-sm",
            // palette via tokens
            "bg-secondary text-foreground placeholder:text-muted-foreground",
            // focus ring with token
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            // dark shadow parity
            "dark:shadow-[0_0_1px_1px_color-mix(in_oklch,var(--ring)_50%,transparent)]",
            // remove shadow on hover like demo
            "group-hover/input:shadow-none",
            className
          )}
          {...props}
        />
      </motion.div>
    );
  }
);
Input.displayName = "Input";
export { Input };