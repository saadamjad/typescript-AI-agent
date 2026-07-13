import { describe, expect, it } from "vitest";
import { validateMessage } from "@/utils/validation";
import { MAX_MESSAGE_LENGTH } from "@/constants/api";

describe("validateMessage", () => {
  it("rejects an empty message", () => {
    expect(validateMessage("")).toEqual({
      valid: false,
      error: "Message cannot be empty.",
    });
  });

  it("rejects a whitespace-only message", () => {
    expect(validateMessage("   \n\t  ")).toEqual({
      valid: false,
      error: "Message cannot be empty.",
    });
  });

  it("rejects a message longer than the max length", () => {
    const tooLong = "a".repeat(MAX_MESSAGE_LENGTH + 1);
    const result = validateMessage(tooLong);
    expect(result.valid).toBe(false);
  });

  it("accepts a valid trimmed message", () => {
    expect(validateMessage("  Hello there  ")).toEqual({ valid: true });
  });

  it("accepts a message exactly at the max length", () => {
    const exact = "a".repeat(MAX_MESSAGE_LENGTH);
    expect(validateMessage(exact)).toEqual({ valid: true });
  });
});
