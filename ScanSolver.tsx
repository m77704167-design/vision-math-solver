import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Loader2, Lock } from "lucide-react";
import { useState } from "react";

import { CameraScanner } from "@/components/calculator/CameraScanner";
import { SolutionScreen } from "@/components/calculator/SolutionScreen";
import { Paywall } from "@/components/paywall/Paywall";
import { useAuth } from "@/hooks/useAuth";
import { getSubscriptionStatus } from "@/lib/subscription.functions";
import { solveFromImage, type SolveResult } from "@/lib/solve.functions";

type Stage = "idle" | "camera" | "solution" | "paywall";

export function ScanSolver() {
  const [stage, setStage] = useState<Stage>("idle");
  const [image, setImage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const solve = useServerFn(solveFromImage);
  const fetchStatus = useServerFn(getSubscriptionStatus);

  const subscription = useQuery({
    queryKey: ["subscription", session?.user.id ?? "anon"],
    queryFn: () => fetchStatus(),
    enabled: Boolean(session),
  });

  const mutation = useMutation<SolveResult, Error, string>({
    mutationFn: (dataUrl) => solve({ data: { image: dataUrl } }),
  });

  const isActive = subscription.data?.active ?? false;
  const checking = authLoading || (Boolean(session) && subscription.isLoading);

  function startScan() {
    if (!session) {
      setStage("paywall");
      return;
    }
    if (!isActive) {
      setStage("paywall");
      return;
    }
    setStage("camera");
  }

  function handleCapture(dataUrl: string) {
    setImage(dataUrl);
    setStage("solution");
    mutation.mutate(dataUrl);
  }

  function close() {
    setStage("idle");
    setImage(null);
    mutation.reset();
  }

  const locked = !checking && !isActive;

  return (
    <>
      <button
        type="button"
        onClick={startScan}
        disabled={checking}
        className="scan-gradient shadow-float flex w-full items-center justify-center gap-3 rounded-3xl px-6 py-4 text-base font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-70"
      >
        {checking ? (
          <Loader2 className="size-5 animate-spin" />
        ) : locked ? (
          <Lock className="size-5" strokeWidth={2.5} />
        ) : (
          <Camera className="size-5" strokeWidth={2.5} />
        )}
        Scan &amp; solve with AI
      </button>
      {locked && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Pro feature — subscribe weekly or monthly to unlock.
        </p>
      )}

      {stage === "camera" && (
        <CameraScanner onCapture={handleCapture} onClose={close} />
      )}

      {stage === "paywall" && (
        <Paywall
          isSignedIn={Boolean(session)}
          onSignIn={() => void navigate({ to: "/auth" })}
          onClose={close}
        />
      )}

      {stage === "solution" && image && (
        <SolutionScreen
          image={image}
          data={mutation.data}
          isPending={mutation.isPending}
          error={mutation.error}
          onRetry={() => mutation.mutate(image)}
          onClose={close}
        />
      )}
    </>
  );
}
