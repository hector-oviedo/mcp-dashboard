// /src/components/ui/JsonPretty.tsx
"use client";
import { JsonView, defaultStyles, darkStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/ThemeProvider";
import { IconCopy, IconCheck } from "@tabler/icons-react";

export function JsonPretty({
  value,
  className,
  expand = 1,
}: { value: unknown; className?: string; expand?: number }) {
  const { theme } = useTheme();
  const [copied, setCopied] = React.useState(false);
  const shouldExpandNode = React.useCallback((level: number) => level <= expand, [expand]);

  // hard-black override for dark
  const blackDarkStyles = React.useMemo(() => ({
    ...darkStyles,
    container: { backgroundColor: "#000000", color: "#f2f2f2", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 },
  }), []);

  async function copyAll() {
    try {
      const text = JSON.stringify(value, null, 2);
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
      }
      setCopied(true); setTimeout(() => setCopied(false), 1000);
    } catch {}
  }

  return (
    <div className={cn("relative border border-border", className)}>
      <button
        type="button"
        onClick={copyAll}
        aria-label="Copy JSON"
        className={cn(
          "absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center border border-border",
          "bg-background/70 backdrop-blur-[1px] transition hover:outline hover:outline-1 hover:outline-[var(--fx-1)] z-10"
        )}
      >
        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
      </button>
      <JsonView
        data={value}
        style={theme === "dark" ? blackDarkStyles : defaultStyles}
        shouldExpandNode={shouldExpandNode}
      />
    </div>
  );
}