import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SubscriptionStatus = {
  active: boolean;
  plan: "weekly" | "monthly" | null;
  status: string | null;
  currentPeriodEnd: string | null;
};

export const getSubscriptionStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SubscriptionStatus> => {
    const { data, error } = await context.supabase
      .from("subscriptions")
      .select("plan, status, current_period_end")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return { active: false, plan: null, status: null, currentPeriodEnd: null };

    const notExpired =
      !data.current_period_end || new Date(data.current_period_end).getTime() > Date.now();
    const active = (data.status === "active" || data.status === "trialing") && notExpired;

    return {
      active,
      plan: data.plan,
      status: data.status,
      currentPeriodEnd: data.current_period_end,
    };
  });
