import { NextResponse } from "next/server";
import { z } from "zod";
import { getContextFor } from "@/zizkadb/context/context.service";
import { inspectorDisabledResponse, isInspectorEnabled } from "@/zizkadb/inspector-guard";

const contextRequestSchema = z.object({
  task: z.string().min(1),
  maxTokens: z.number().int().positive().optional(),
  sessionId: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  if (!isInspectorEnabled()) {
    return inspectorDisabledResponse();
  }

  const body = await request.json().catch(() => null);
  const parsed = contextRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const context = await getContextFor(parsed.data.task, {
      maxTokens: parsed.data.maxTokens,
      sessionId: parsed.data.sessionId,
    });
    return NextResponse.json(context);
  } catch (error) {
    console.warn("ZizkaDB contextFor() failed", error);
    return NextResponse.json({ error: "Context lookup failed." }, { status: 502 });
  }
}
