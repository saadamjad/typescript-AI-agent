import { NextResponse } from "next/server";
import { getSessionReplay } from "@/zizkadb/replay/replay.service";
import { inspectorDisabledResponse, isInspectorEnabled } from "@/zizkadb/inspector-guard";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  if (!isInspectorEnabled()) {
    return inspectorDisabledResponse();
  }

  const { sessionId } = await params;

  try {
    const diff = await getSessionReplay(sessionId);
    return NextResponse.json(diff);
  } catch (error) {
    console.warn("ZizkaDB memoryDiff() failed", error);
    return NextResponse.json({ error: "Replay lookup failed." }, { status: 502 });
  }
}
