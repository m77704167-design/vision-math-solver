import { Check, Loader2, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

type PlanId = "weekly" | "monthly";

const plans: {
  id: PlanId;
  name: string;
  price: string;
  cadence: string;
  note: string;
  badge?: string;
}[] = [
  {
    id: "weekly",
    name: "Weekly",
    price: "$4.99",
    cadence: "/ week",
    note: "Great for exam weeks. Cancel anytime.",
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "$12.99",
    cadence: "/ month",
    note: "Best value — works out to about $3 a week.",
    badge: "Save 35%",
  },
];

const perks = [
  "Unlimited photo scans of maths problems",
  "Full step-by-step AI explanations",
  "Scientific keypad and history",
  "New solvers as they ship",
];

export function Paywall({
  onClose,
  onSignIn,
  isSignedIn,
}: {
  onClose: () => void;
  onSignIn: () => void;
  isSignedIn: boolean;
}) {
  const [selected, setSelected] = useState<PlanId>("monthly");
  const [pending, setPending] = useState(false);

  function subscribe() {
    if (!isSignedIn) {
      onSignIn();
      return;
    }
    setPending(true);
    setTimeout(() => {
      setPending(false);
      toast.info("Stripe checkout isn't connected yet", {
        description: "Plans and subscription checks are ready — payments get wired up next.",
      });
    }, 500);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background">
      <header className="flex items-start justify-between px-5 pt-6">
        <div>
          <p className="flex items-center gap-1.5 text-[0.65rem] tracking-[0.2em] text-primary uppercase">
            <Sparkles className="size-3.5" /> Solvr Pro
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Unlock the AI maths solver
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Snap any problem and get the full reasoning, step by step.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close paywall"
          className="rounded-full bg-secondary p-2 text-secondary-foreground"
        >
          <X className="size-5" />
        </button>
      </header>

      <div className="flex-1 space-y-6 px-5 py-6">
        <ul className="space-y-2.5">
          {perks.map((perk) => (
            <li key={perk} className="flex items-start gap-2.5 text-sm">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-key-fn text-key-fn-foreground">
                <Check className="size-3" strokeWidth={3} />
              </span>
              <span className="text-foreground/90">{perk}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-3">
          {plans.map((plan) => {
            const isActive = selected === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelected(plan.id)}
                aria-pressed={isActive}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-colors",
                  isActive
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-muted-foreground/40",
                )}
              >
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    {plan.name}
                    {plan.badge && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide text-primary-foreground uppercase">
                        {plan.badge}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{plan.note}</p>
                </div>
                <p className="shrink-0 font-mono text-lg font-semibold">
                  {plan.price}
                  <span className="text-xs text-muted-foreground">{plan.cadence}</span>
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 space-y-3 border-t border-border bg-background px-5 py-5">
        <button
          type="button"
          onClick={subscribe}
          disabled={pending}
          className="scan-gradient shadow-float flex w-full items-center justify-center gap-2 rounded-3xl px-6 py-4 text-base font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-70"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          {isSignedIn ? `Continue with ${selected}` : "Sign in to subscribe"}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Cancel anytime. The manual calculator stays free.
        </p>
      </div>
    </div>
  );
}
