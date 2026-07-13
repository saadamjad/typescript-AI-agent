import { describe, expect, it } from "vitest";
import { refundPolicyTool } from "@/agent/tools/refund-policy.tool";

describe("refundPolicyTool", () => {
  it("approves a normal refund request", async () => {
    const result = await refundPolicyTool.run("I'd like a refund please.");
    expect(result.statePatch).toMatchObject({ refund_status: "approved" });
  });

  it("denies a refund request that mentions an expired/used/damaged item", async () => {
    expect((await refundPolicyTool.run("my item expired")).statePatch).toMatchObject({
      refund_status: "denied",
    });
    expect((await refundPolicyTool.run("it was already used")).statePatch).toMatchObject({
      refund_status: "denied",
    });
    expect((await refundPolicyTool.run("the product arrived damaged")).statePatch).toMatchObject({
      refund_status: "denied",
    });
  });
});
