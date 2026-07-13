import { describe, expect, it } from "vitest";
import { billingLookupTool } from "@/agent/tools/billing-lookup.tool";

describe("billingLookupTool", () => {
  it("returns a deterministic billing summary with a state patch", async () => {
    const result = await billingLookupTool.run("what's my bill?");
    expect(result.output).toContain("balance");
    expect(result.statePatch).toMatchObject({ billing_status: "reviewed" });
  });
});
