import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { logAgentEvent } from "@/zizkadb/events/event-logger";
import { getSessionReplay } from "@/zizkadb/replay/replay.service";
import { getBaseline, getBehaviorChange } from "@/zizkadb/drift/drift.service";
import { listAgents } from "@/zizkadb/agents/agents.service";
import { forgetByField } from "@/zizkadb/gdpr/forget.service";
import { queryEvents } from "@/zizkadb/query/query.service";

const hasCredentials = Boolean(process.env.ZIZKADB_API_KEY && process.env.ZIZKADB_AGENT_NAME);

describe.skipIf(!hasCredentials)("replay, drift, agents, forget (real cloud)", () => {
  it("memoryDiff() summarizes a session we just logged", async () => {
    const sessionId = `sess_integration_${randomUUID()}`;
    await logAgentEvent({ event: "user_message", data: { content: "hi" }, sessionId });
    const second = await logAgentEvent({
      event: "assistant_response",
      data: { content: "hello" },
      sessionId,
    });

    const diff = await getSessionReplay(sessionId);
    expect(diff.sessionId).toBe(sessionId);
    expect(diff.eventCount).toBeGreaterThanOrEqual(2);
    expect(typeof diff.summary).toBe("string");
    void second;
  });

  it("baseline() returns a well-formed response without throwing (structural — data volume varies)", async () => {
    const baseline = await getBaseline(5);
    expect(baseline).toHaveProperty("status");
  });

  it("behavior-change (REST, SDK gap) returns a well-formed response without throwing", async () => {
    const behaviorChange = await getBehaviorChange("7d");
    expect(behaviorChange).toHaveProperty("status");
  });

  it("agents() lists the configured agent", async () => {
    const agents = await listAgents();
    expect(agents.some((a) => a.agent === process.env.ZIZKADB_AGENT_NAME)).toBe(true);
  });

  it("forget() deletes events matching a data field", async () => {
    const marker = `integration_forget_${randomUUID()}`;
    const logged = await logAgentEvent({
      event: "user_message",
      data: { forget_marker: marker },
      sessionId: `sess_integration_${randomUUID()}`,
    });

    const result = await forgetByField("forget_marker", marker);
    expect(result.deletedEvents).toBeGreaterThanOrEqual(1);

    const remaining = await queryEvents({ eventType: "user_message", limit: 100 });
    expect(remaining.some((e) => e.eventId === logged.eventId)).toBe(false);
  });
});
