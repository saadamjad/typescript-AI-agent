import { NextResponse } from "next/server";

/**
 * Gate for the read/debug `/api/zizkadb/*` inspector routes. Enabled by
 * default outside production; set ZIZKADB_INSPECTOR_ENABLED=false to disable
 * anywhere, or =true to force it on in a production build.
 */
export function isInspectorEnabled(): boolean {
  const flag = process.env.ZIZKADB_INSPECTOR_ENABLED;
  if (flag === "false") return false;
  if (flag === "true") return true;
  return process.env.NODE_ENV !== "production";
}

export function inspectorDisabledResponse(): NextResponse {
  return NextResponse.json(
    { error: "Inspector routes are disabled in this environment." },
    { status: 404 },
  );
}
