import { NextResponse } from "next/server";
import { getStateAt } from "@/zizkadb/state/state.service";
import { inspectorDisabledResponse, isInspectorEnabled } from "@/zizkadb/inspector-guard";

export async function GET(request: Request) {
  if (!isInspectorEnabled()) {
    return inspectorDisabledResponse();
  }

  const { searchParams } = new URL(request.url);
  const timestamp = searchParams.get("timestamp");
  if (!timestamp) {
    return NextResponse.json({ error: "timestamp query param is required." }, { status: 400 });
  }

  try {
    const state = await getStateAt(new Date(timestamp));
    return NextResponse.json(state);
  } catch (error) {
    console.warn("ZizkaDB at() failed", error);
    return NextResponse.json({ error: "State lookup failed." }, { status: 502 });
  }
}
