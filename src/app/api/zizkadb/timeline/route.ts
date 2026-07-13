import { NextResponse } from "next/server";
import { getAgentStatsSummary, getTimeline } from "@/zizkadb/query/query.service";
import { inspectorDisabledResponse, isInspectorEnabled } from "@/zizkadb/inspector-guard";

export async function GET(request: Request) {
  if (!isInspectorEnabled()) {
    return inspectorDisabledResponse();
  }

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit");

  try {
    const [sessions, stats] = await Promise.all([
      getTimeline(limit ? Number(limit) : undefined),
      getAgentStatsSummary(),
    ]);
    return NextResponse.json({ sessions, stats });
  } catch (error) {
    console.warn("ZizkaDB timeline lookup failed", error);
    return NextResponse.json({ error: "Timeline lookup failed." }, { status: 502 });
  }
}
