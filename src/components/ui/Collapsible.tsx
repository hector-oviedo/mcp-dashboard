/** /src/components/ui/Collapsible.tsx
 * Square collapsible with gradient divider using unified tokens.
 */
"use client";
import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { IconChevronDown } from "@tabler/icons-react";

type Props = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

export function Collapsible({ title, children, defaultOpen=false, className }: Props) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className={cn("border border-border", className)}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm"
      >
        <span className="font-medium">{title}</span>
        <IconChevronDown size={16} className={cn("transition-transform", open ? "rotate-180" : "rotate-0")} />
      </button>

      {/* gradient divider */}
      <div className="relative h-px">
        <span className="pointer-events-none absolute inset-0 block h-px bg-gradient-to-r from-transparent via-[var(--fx-1)] to-transparent opacity-70" />
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="px-3 py-3 text-sm text-muted-foreground">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}