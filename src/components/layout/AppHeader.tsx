// /src/components/layout/AppHeader.tsx
"use client";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/providers/ThemeProvider";
import { Link } from "react-router-dom";
import { IconArrowLeft } from "@tabler/icons-react";

export function AppHeader({
  className,
  title = "Explorer",
  showThemeToggle = false,
  backTo,
}: {
  className?: string;
  title?: string;
  showThemeToggle?: boolean; // only on Explorer
  backTo?: string;           // when set, shows Back button instead of theme toggle
}) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className={cn("relative bg-[var(--header-bg)]", className)}>
      <div className="relative mx-auto w-full max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{title}</h1>

          {backTo ? (
            <Link
              to={backTo}
              className="inline-flex items-center gap-2 text-sm underline underline-offset-4 decoration-[var(--fx-1)] hover:text-[var(--fx-2)] hover:decoration-[var(--fx-2)]"
            >
              <IconArrowLeft size={16} />
              Back
            </Link>
          ) : showThemeToggle ? (
            <div className="flex items-center gap-3">
              <span className="text-sm">Dark Mode</span>
              <Switch checked={isDark} onCheckedChange={toggle} />
            </div>
          ) : (
            <span />
          )}
        </div>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 block h-px bg-gradient-to-r from-transparent via-[var(--fx-1)] to-transparent opacity-70" />
        <span className="pointer-events-none absolute inset-x-[15%] bottom-0 mx-auto block h-px w-2/5 bg-gradient-to-r from-transparent via-[var(--fx-2)] to-transparent opacity-40 blur-[1px]" />
      </div>
    </header>
  );
}