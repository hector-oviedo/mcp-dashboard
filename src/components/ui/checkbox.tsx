/** /src/components/ui/checkbox.tsx
 * Rounded box + subtle hover glow + inner fill animation using text color.
 */
"use client";
import * as React from "react";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  label?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (v: boolean) => void;
  className?: string;
  glowRadius?: number; // px
};

export function Checkbox({
  id,
  label,
  defaultChecked,
  checked,
  onChange,
  className,
  glowRadius = 48,
}: Props) {
  const controlled = typeof checked === "boolean";
  const [local, setLocal] = React.useState(!!defaultChecked);
  const value = controlled ? !!checked : local;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [visible, setVisible] = React.useState(false);

  const bg = useMotionTemplate`
    radial-gradient(${visible ? glowRadius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
      color-mix(in oklch, var(--glow-from) 40%, transparent), transparent 35%),
    radial-gradient(${visible ? glowRadius * 0.5 + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
      color-mix(in oklch, var(--glow-to) 35%, transparent), transparent 45%)
  `;

  return (
    <label
      htmlFor={id}
      className={cn("flex items-center gap-3 cursor-pointer select-none text-sm text-foreground", className)}
    >
      <input
        id={id}
        type="checkbox"
        className="peer sr-only"
        checked={value}
        onChange={(e) => {
          if (!controlled) setLocal(e.target.checked);
          onChange?.(e.target.checked);
        }}
      />
      <motion.span
        style={{ background: bg }}
        onMouseMove={(e) => {
          const r = (e.currentTarget as HTMLSpanElement).getBoundingClientRect();
          mouseX.set(e.clientX - r.left);
          mouseY.set(e.clientY - r.top);
        }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="rounded-[8px] p-[1px] transition duration-300"
      >
        <span
          className={cn(
            "relative block h-5 w-5 rounded-[6px] border border-border bg-card",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
          )}
        >
          {/* inner fill uses text color for clarity */}
          <motion.span
            className="absolute inset-[2px] rounded-[4px] bg-current"
            initial={false}
            animate={{ scale: value ? 1 : 0.4, opacity: value ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            style={{ transformOrigin: "50% 50%" }}
          />
        </span>
      </motion.span>
      {label ? <span>{label}</span> : null}
    </label>
  );
}
