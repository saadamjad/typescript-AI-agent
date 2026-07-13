import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { logAgentEvent } from "@/zizkadb/events/event-logger";
import { getCausalChain } from "@/zizkadb/causality/why.service";

const hasCredentials = Boolean(process.env.ZIZKADB_API_KEY && process.env.ZIZKADB_AGENT_NAME);

describe.skipIf(!hasCredentials)("events + causality (real cloud)", () => {
  it("logs a parent/child event pair and reconstructs the causal chain via why()", async () => {
    const sessionId = `sess_integration_${randomUUID()}`;

    const parent = await logAgentEvent({
      event: "user_message",
      data: { content: "integration test parent" },
      sessionId,
    });
    expect(parent.eventId).toBeTruthy();

    const child = await logAgentEvent({
      event: "assistant_response",
      data: { content: "integration test child", source: "integration_test" },
      sessionId,
      parentId: parent.eventId,
    });
    expect(child.eventId).toBeTruthy();

    const chain = await getCausalChain(child.eventId);
    expect(chain.chainLength).toBeGreaterThanOrEqual(2);
    expect(chain.chain[0].eventId).toBe(parent.eventId);
    expect(chain.chain[chain.chain.length - 1].eventId).toBe(child.eventId);
  });
});
