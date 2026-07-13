import { describe, expect, it } from "vitest";
import { knowledgeBaseTool } from "@/agent/tools/knowledge-base.tool";

describe("knowledgeBaseTool", () => {
  it("answers a supported question", async () => {
    const result = await knowledgeBaseTool.run("How many days are there in a week?");
    expect(result.output).toBe("There are 7 days in a week.");
  });

  it("throws when no handler matches", async () => {
    await expect(knowledgeBaseTool.run("What is the capital of France?")).rejects.toThrow();
  });
});
