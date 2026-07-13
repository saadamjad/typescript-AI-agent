import { NextResponse } from "next/server";
import { getCausalChain } from "@/zizkadb/causality/why.service";
import { inspectorDisabledResponse, isInspectorEnabled } from "@/zizkadb/inspector-guard";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  if (!isInspectorEnabled()) {
    return inspectorDisabledResponse();
  }

  const { eventId } = await params;
  const { searchParams } = new URL(request.url);
  const depth = searchParams.get("depth");

  try {
    const chain = await getCausalChain(eventId, depth ? Number(depth) : undefined);
    return NextResponse.json({ eventId: chain.eventId, chainLength: chain.chainLength, chain: chain.chain });
  } catch (error) {
    console.warn("ZizkaDB why() failed", error);
    return NextResponse.json({ error: "Causal chain lookup failed." }, { status: 502 });
  }
}
