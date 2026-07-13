import { NextResponse } from "next/server";
import { listAgents } from "@/zizkadb/agents/agents.service";
import { inspectorDisabledResponse, isInspectorEnabled } from "@/zizkadb/inspector-guard";

export async function GET() {
  if (!isInspectorEnabled()) {
    return inspectorDisabledResponse();
  }

  try {
    const agents = await listAgents();
    return NextResponse.json({ agents });
  } catch (error) {
    console.warn("ZizkaDB agents() failed", error);
    return NextResponse.json({ error: "Agents lookup failed." }, { status: 502 });
  }
}
