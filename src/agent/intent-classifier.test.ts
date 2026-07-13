import { describe, expect, it } from "vitest";
import { classifyIntent } from "@/agent/intent-classifier";

describe("classifyIntent", () => {
  it("classifies refund requests", () => {
    expect(classifyIntent("I'd like a refund please.")).toBe("refund");
    expect(classifyIntent("Can I get a refund?")).toBe("refund");
  });

  it("classifies billing questions", () => {
    expect(classifyIntent("What's my current bill?")).toBe("billing");
    expect(classifyIntent("Why was I charged twice?")).toBe("billing");
    expect(classifyIntent("Can you show me my invoice?")).toBe("billing");
  });

  it("prefers refund over billing when both keywords are present", () => {
    expect(classifyIntent("I want a refund for my last bill.")).toBe("refund");
  });

  it("classifies everything else as general", () => {
    expect(classifyIntent("Hello, how are you?")).toBe("general");
    expect(classifyIntent("What is 2 + 2?")).toBe("general");
  });
});
