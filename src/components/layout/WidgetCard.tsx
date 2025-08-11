/** @file /src/components/layout/WidgetCard.tsx
 * Reusable widget card with animated radial glow border (like Input) and
 * button-style inset highlights. Children render inside the inner panel.
 */
"use client";
import * as React from "react";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { cn } from "@/lib/utils";

type WidgetCardProps = {
  children: React.ReactNode;
  className?: string;
  glowRadius?: number; // px
};

export function WidgetCard({
  children,
  className,
  glowRadius = 160,
}: WidgetCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [visible, setVisible] = React.useState(false);

  const bg = useMotionTemplate`
    radial-gradient(${visible ? glowRadius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
      var(--glow-from), transparent 60%),
    radial-gradient(${visible ? glowRadius * 0.6 + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
      var(--glow-to), transparent 65%)
  `;

  return (
    <motion.div
      style={{ background: bg }}
      onMouseMove={(e) => {
        const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        mouseX.set(e.clientX - r.left);
        mouseY.set(e.clientY - r.top);
      }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className={cn("relative rounded-xl p-[2px] transition duration-300", className)}
    >
      <div
        className={cn(
          "rounded-[inherit] border border-[color:var(--btn-border)] bg-card p-5",
          "shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset]",
          "dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}