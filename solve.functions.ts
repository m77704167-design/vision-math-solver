import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SolveInput = z.object({
  image: z.string().min(20),
});

const SolveSchema = z.object({
  problem: z.string(),
  answer: z.string(),
  steps: z.array(z.object({ title: z.string(), detail: z.string() })),
});

export type SolveResult = z.infer<typeof SolveSchema>;

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced?.[1] ?? text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

export const solveFromImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SolveInput.parse(input))
  .handler(async ({ data, context }): Promise<SolveResult> => {
    const { data: hasSubscription, error: subError } = await context.supabase.rpc(
      "has_active_subscription",
    );
    if (subError) throw new Error(subError.message);
    if (!hasSubscription) throw new Error("SUBSCRIPTION_REQUIRED");

    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    const result = streamText({
      model: gateway("google/gemini-3.6-flash"),
      system:
        "You are a maths tutor. Read the maths problem in the image and solve it.\n" +
        "Reply with ONLY a JSON object, no prose and no code fences, shaped like:\n" +
        '{"problem":"transcribed problem","answer":"final answer",' +
        '"steps":[{"title":"short step name","detail":"what happens in this step"}]}\n' +
        "Keep each detail to at most 2 sentences of plain-text maths notation, and use at most 8 steps.\n" +
        'If no maths problem is readable, return {"problem":"No maths problem was readable in that photo.","answer":"—","steps":[]}.',
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Solve the maths problem shown in this image." },
            { type: "image", image: data.image },
          ],
        },
      ],
    });

    const text = await result.text;
    const parsed = SolveSchema.safeParse(extractJson(text));

    if (!parsed.success) {
      console.error("solveFromImage: unparsable model output", text.slice(0, 800));
      return {
        problem: "The photo couldn't be read as a maths problem.",
        answer: "—",
        steps: [],
      };
    }

    return { ...parsed.data, steps: parsed.data.steps.slice(0, 8) };
  });
