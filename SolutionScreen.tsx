import { ChevronDown, Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import { useState } from "react";

import type { SolveResult } from "@/lib/solve.functions";
import { cn } from "@/lib/utils";

export function SolutionScreen({
  image,
  data,
  isPending,
  error,
  onRetry,
  onClose,
}: {
  image: string;
  data: SolveResult | undefined;
  isPending: boolean;
  error: Error | null;
  onRetry: () => void;
  onClose: () => void;
}) {
  const [revealed, setRevealed] = useState(1);
  const steps = data?.steps ?? [];
  const visible = steps.slice(0, revealed);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <p className="flex items-center gap-1.5 text-[0.65rem] tracking-[0.2em] text-primary uppercase">
            <Sparkles className="size-3.5" /> AI solution
          </p>
          <h2 className="text-lg font-semibold">Step by step</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close solution"
          className="rounded-full bg-secondary p-2 text-secondary-foreground"
        >
          <X className="size-5" />
        </button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 pb-12">
        <img
          src={image}
          alt="Scanned math problem"
          className="max-h-40 w-full rounded-2xl border border-border object-cover"
        />

        {isPending && (
          <div className="flex items-center gap-3 rounded-2xl bg-card p-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" />
            Reading the problem and working through it…
          </div>
        )}

        {error && (
          <div className="space-y-3 rounded-2xl bg-card p-4">
            <p className="text-sm text-destructive">
              {error.message.includes("SUBSCRIPTION_REQUIRED")
                ? "Your subscription isn't active, so the AI solver is locked."
                : error.message || "Something went wrong solving that."}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm text-secondary-foreground"
            >
              <RefreshCw className="size-4" /> Try again
            </button>
          </div>
        )}

        {data && (
          <>
            <div className="rounded-2xl bg-card p-4">
              <p className="text-[0.65rem] tracking-widest text-muted-foreground uppercase">
                Problem
              </p>
              <p className="mt-1 font-mono text-base">{data.problem}</p>
              <p className="mt-4 text-[0.65rem] tracking-widest text-muted-foreground uppercase">
                Answer
              </p>
              <p className="font-mono text-3xl font-semibold text-primary">{data.answer}</p>
            </div>

            <ol className="space-y-3">
              {visible.map((step, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex gap-3 rounded-2xl bg-card p-4",
                    i === revealed - 1 && "animate-in fade-in slide-in-from-bottom-2",
                  )}
                >
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-key-fn font-mono text-sm text-key-fn-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className="mt-1 font-mono text-sm leading-relaxed text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {steps.length === 0 && (
              <div className="space-y-3 rounded-2xl bg-card p-4">
                <p className="text-sm text-muted-foreground">
                  No steps to show. Try a closer, better-lit shot of the problem.
                </p>
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm text-secondary-foreground"
                >
                  <RefreshCw className="size-4" /> Solve again
                </button>
              </div>
            )}



            {revealed < steps.length && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRevealed((r) => r + 1)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground active:scale-[0.98]"
                >
                  <ChevronDown className="size-4" /> Next step
                </button>
                <button
                  type="button"
                  onClick={() => setRevealed(steps.length)}
                  className="rounded-2xl bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground"
                >
                  Show all
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

