/** /src/pages/Agent.tsx */
import { AppHeader } from "@/components/layout/AppHeader";
export default function Agent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader title="Agent - LLM + NPM" backTo="/explorer" />
      <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-6">
        <h2 className="text-base font-medium">MCP Agent</h2>
        <p className="mt-2 text-sm text-muted-foreground">Coming next.</p>
      </main>
    </div>
  );
}