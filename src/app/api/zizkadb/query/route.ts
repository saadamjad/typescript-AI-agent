import { NextResponse } from "next/server";
import { queryEventsPage } from "@/zizkadb/query/query.service";
import { inspectorDisabledResponse, isInspectorEnabled } from "@/zizkadb/inspector-guard";

export async function GET(request: Request) {
  if (!isInspectorEnabled()) {
    return inspectorDisabledResponse();
  }

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit");
  const before = searchParams.get("before");
  const after = searchParams.get("after");
  const eventType = searchParams.get("eventType");
  const sessionId = searchParams.get("sessionId");

  try {
    const page = await queryEventsPage({
      limit: limit ? Number(limit) : undefined,
      before: before ? new Date(before) : undefined,
      after: after ? new Date(after) : undefined,
      eventType: eventType ?? undefined,
      sessionId: sessionId ?? undefined,
    });
    return NextResponse.json(page);
  } catch (error) {
    console.warn("ZizkaDB query failed", error);
    return NextResponse.json({ error: "Query failed." }, { status: 502 });
  }
}
