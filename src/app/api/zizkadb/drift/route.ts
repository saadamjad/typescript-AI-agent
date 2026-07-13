import { NextResponse } from "next/server";
import { getBaseline, getBehaviorChange } from "@/zizkadb/drift/drift.service";
import { inspectorDisabledResponse, isInspectorEnabled } from "@/zizkadb/inspector-guard";
import type { BehaviorChangeWindow } from "@/zizkadb/rest-client";

const VALID_WINDOWS: BehaviorChangeWindow[] = ["24h", "7d", "30d", "custom"];

export async function GET(request: Request) {
  if (!isInspectorEnabled()) {
    return inspectorDisabledResponse();
  }

  const { searchParams } = new URL(request.url);
  const recentWindow = searchParams.get("recentWindow");
  const windowParam = searchParams.get("window");
  const window = VALID_WINDOWS.includes(windowParam as BehaviorChangeWindow)
    ? (windowParam as BehaviorChangeWindow)
    : "7d";
  const fromTs = searchParams.get("fromTs") ?? undefined;
  const toTs = searchParams.get("toTs") ?? undefined;

  try {
    const [baseline, behaviorChange] = await Promise.all([
      getBaseline(recentWindow ? Number(recentWindow) : undefined),
      getBehaviorChange(window, fromTs, toTs),
    ]);
    return NextResponse.json({ baseline, behaviorChange });
  } catch (error) {
    console.warn("ZizkaDB drift lookup failed", error);
    return NextResponse.json({ error: "Drift lookup failed." }, { status: 502 });
  }
}
