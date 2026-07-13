import { NextResponse } from "next/server";
import { z } from "zod";
import { forgetByField } from "@/zizkadb/gdpr/forget.service";
import { inspectorDisabledResponse, isInspectorEnabled } from "@/zizkadb/inspector-guard";

const forgetRequestSchema = z.object({
  filterKey: z.string().min(1),
  filterValue: z.string().min(1),
});

export async function DELETE(request: Request) {
  if (!isInspectorEnabled()) {
    return inspectorDisabledResponse();
  }

  const body = await request.json().catch(() => null);
  const parsed = forgetRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const result = await forgetByField(parsed.data.filterKey, parsed.data.filterValue);
    return NextResponse.json(result);
  } catch (error) {
    console.warn("ZizkaDB forget() failed", error);
    return NextResponse.json({ error: "Forget request failed." }, { status: 502 });
  }
}
