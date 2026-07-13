import { NextResponse } from "next/server";
import { z } from "zod";
import { searchEvents } from "@/zizkadb/search/search.service";
import { inspectorDisabledResponse, isInspectorEnabled } from "@/zizkadb/inspector-guard";

const searchRequestSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().positive().optional(),
});

export async function POST(request: Request) {
  if (!isInspectorEnabled()) {
    return inspectorDisabledResponse();
  }

  const body = await request.json().catch(() => null);
  const parsed = searchRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const results = await searchEvents(parsed.data.query, parsed.data.limit);
    return NextResponse.json({ results });
  } catch (error) {
    console.warn("ZizkaDB search failed", error);
    return NextResponse.json({ error: "Search failed." }, { status: 502 });
  }
}
