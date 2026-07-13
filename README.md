# AI Customer Support Chat

A lightweight AI customer-support chat agent, instrumented end-to-end with
[ZizkaDB](https://db.zizka.ai) — the operational database for AI agents. It
sends user messages to an external FastAPI backend (or a couple of built-in
business tools) and logs every decision, tool call, and outcome as a causally
linked event chain, so the agent's own behavior can be queried, searched,
replayed, and drift-checked through a built-in Inspector panel.

## Overview

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS for styling
- Native `fetch` for API calls, validated with Zod
- Vitest + React Testing Library for unit tests; a separate integration suite
  hits real ZizkaDB
- `zizkadb-sdk` for all ZizkaDB communication (cloud or self-hosted)
- No conversation history is stored client-side (in-memory only, cleared on
  refresh) — full history lives in ZizkaDB itself

## Architecture

```
UI Components -> useChat -> chat.service (runAgentTurn) -> agent/ (intent + tools) -> external backend / internal tools
                    |                                                                          |
                    +--> logging.service --> /api/log --> zizkadb/events (log)                 |
                    |                                                                          v
InspectorPanel --> /api/zizkadb/* routes --> zizkadb/* services (query/why/search/at/...) --> ZizkaDB
```

- **`src/agent/`** — the actual agent decision logic, independent of any UI or
  server framework. `run-agent-turn.ts` classifies intent
  (`intent-classifier.ts`), selects and runs a tool from `tools/` (dedicated
  business tools for billing/refund, or external-chat-with-fallback for
  everything else), and returns the response plus every step taken. Runs
  equally in the browser (via `chat.service.ts`) and in Node (the scenario
  scripts) — no browser-only APIs.
- **`src/hooks/useChat.ts`** — chat state + logs each agent step via
  `logging.service.ts`, chaining `parentId` so the causal tree is unbroken
  across a whole session, not just one turn.
- **`src/zizkadb/`** — the ZizkaDB integration, organized one file per
  capability (see below). `client.ts` is the only place the SDK is
  constructed; `rest.ts`/`rest-client.ts` cover the few REST endpoints the SDK
  doesn't wrap yet.
- **`src/app/api/zizkadb/*`** — server-only routes (API key never reaches the
  browser) that the Inspector panel calls.
- **`src/components/inspector/`** — a collapsible debug panel under the chat
  window with a tab per ZizkaDB capability.

## Folder structure

```
src/
  agent/                 Agent decision layer
    types.ts              Intent, Tool, AgentStep, AgentTurnResult
    intent-classifier.ts   billing / refund / general routing
    tools/                 external-chat, knowledge-base, billing-lookup, refund-policy
    run-agent-turn.ts       orchestrates classify -> select tool -> execute
  zizkadb/                ZizkaDB integration, one module per capability
    client.ts               SDK singleton (cloud apiKey or self-hosted host)
    rest.ts / rest-client.ts  raw REST for endpoints the SDK doesn't wrap
    inspector-guard.ts       enable/disable flag for the /api/zizkadb/* routes
    events/                  event catalog + logAgentEvent()
    causality/               why() wrapper
    query/                   query() + cursor pagination + timeline/stats
    state/                   at() wrapper (time travel)
    search/                  search() wrapper
    replay/                  memoryDiff() wrapper
    context/                 contextFor()/contextForFull() wrapper
    drift/                   baseline() + behavior-change (REST)
    gdpr/                    forget() wrapper
    agents/                  agents() wrapper
    integration/             integration tests (real cloud) + env loader
  components/
    chat/                    Chat, ChatWindow, ChatMessage, ChatInput
    inspector/               InspectorPanel + one tab component per capability
  hooks/                    useChat — chat state + causal step logging
  services/                chat.service (delegates to agent/run-agent-turn),
                           logging.service (fire-and-forget event logging),
                           internal-knowledge.service (offline FAQ handlers),
                           api-client (generic HTTP)
  app/api/
    log/                     proxies db.log() (existing)
    zizkadb/                 proxies query/why/search/at/replay/context/drift/timeline/forget/agents
  config/                  env.ts — validated environment configuration
  types/                   chat.ts, logging.ts — shared types and Zod schemas
  utils/                   validation.ts
  constants/               api.ts
scripts/
  test-zizkadb-query.ts    original manual log->why sanity script
  scenarios/
    seed-normal-sessions.ts   drives the real agent through ~15 varied sessions
    seed-behavior-shift.ts    drives a shifted-mix traffic pattern for drift
    full-tour.ts              exercises every ZizkaDB capability, prints a report
```

## Prerequisites

- Node.js 20+
- A running FastAPI backend exposing `POST /chat` (see
  [Backend API contract](#backend-api-contract)) — optional; the agent falls
  back to internal tools if it's unreachable
- A ZizkaDB agent + API key (cloud at [db.zizka.ai](https://db.zizka.ai), or a
  self-hosted instance)

## Installation

```bash
npm install
```

## Environment setup

```bash
cp .env.local.example .env.local
```

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes | External chat backend base URL (public — no secrets) |
| `ZIZKADB_API_KEY` | yes, unless `ZIZKADB_HOST` is set | Cloud API key (server-only) |
| `ZIZKADB_HOST` | alternative to `ZIZKADB_API_KEY` | Self-hosted ZizkaDB URL, e.g. `http://localhost:8000` |
| `ZIZKADB_AGENT_NAME` | yes | Must match an agent already created in the ZizkaDB dashboard |
| `ZIZKADB_INSPECTOR_ENABLED` | no | `true`/`false` to force the `/api/zizkadb/*` routes + Inspector panel on/off (default: enabled outside production) |

All are validated at startup/request time (`src/config/env.ts`,
`src/zizkadb/client.ts`) — the app fails fast with a clear error rather than
silently misbehaving.

## Running locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Try a few different
message types to exercise the different tools:

- "What's my current bill?" → `billing_lookup` tool (no external call)
- "I want a refund, my item was damaged." → `refund_policy` tool
- "How many days are there in a week?" / general chat → external chat
  backend, falling back to the internal knowledge handler if it's unreachable

Open the **ZizkaDB Inspector** panel at the bottom of the chat to inspect the
causal chain for your last message, search past events, replay a session,
check drift, view reconstructed state at a point in time, or browse the
session timeline.

## Backend API contract

```
POST /chat
Content-Type: application/json

{ "message": "Hello" }
```

Response:

```json
{
  "success": true,
  "data": {
    "response": "Hello! How can I help you today?"
  }
}
```

The OpenAI API key (or any provider credentials) must live only in this
backend — the frontend never sees or stores secrets.

## ZizkaDB capabilities demonstrated

| Capability | Where |
|---|---|
| Event logging (lifecycle, decisions, tool calls, errors, outcomes) | Every chat turn, via `useChat.ts` + `/api/log` |
| Causality | `why()` — Inspector "Causality" tab, `/api/zizkadb/why/[eventId]` |
| Query (filters, time-range, cursor pagination) | Inspector isn't wired to raw query browsing yet, but `src/zizkadb/query/query.service.ts` + `/api/zizkadb/query` expose it; exercised directly in `scripts/scenarios/full-tour.ts` and the integration tests |
| Search (semantic) | Inspector "Search" tab, `/api/zizkadb/search` — requires an embeddings provider configured for your ZizkaDB tenant (Dashboard → Settings → Embeddings) |
| Replay (session diff) | Inspector "Replay" tab, `/api/zizkadb/replay/[sessionId]` |
| State / time travel | Inspector "State" tab, `/api/zizkadb/state` — reconstructed from `STATE_SET` events (e.g. logged after a billing/refund tool runs) |
| Context injection | `src/zizkadb/context/context.service.ts` + `/api/zizkadb/context` (not yet in the Inspector UI) |
| Drift (session-count baseline + time-windowed behavior-change) | Inspector "Drift" tab, `/api/zizkadb/drift` |
| Timeline (sessions) + stats | Inspector "Timeline" tab, `/api/zizkadb/timeline` |
| GDPR forget | `src/zizkadb/gdpr/forget.service.ts` + `/api/zizkadb/forget` (not yet in the Inspector UI) |
| Agents list | `src/zizkadb/agents/agents.service.ts` + `/api/zizkadb/agents` |

## Known ZizkaDB SDK limitations (as of `zizkadb-sdk@0.2.4`)

- `query()` has no `offset` parameter even though the REST API supports it —
  `queryEventsPage()` works around this with `before`-timestamp cursor
  pagination instead.
- `baseline()` only forwards `recentWindow`, not the REST endpoint's optional
  `window` (`24h`/`7d`/`30d`) parameter for a time-based split.
- `GET /v1/agents/{id}/stats`, `/sessions`, and `/behavior-change` have no SDK
  wrapper at all — `src/zizkadb/rest.ts`/`rest-client.ts` call them directly
  over REST with the same bearer-token auth the SDK uses.

## Scenario scripts (seed realistic data against real ZizkaDB)

```bash
npm run scenario:seed-normal   # ~15 varied "normal traffic" sessions
npm run scenario:seed-shift    # ~10 sessions with a shifted mix (for drift)
npm run scenario:full-tour     # exercises every capability, prints a report
```

These run the real `src/agent/run-agent-turn.ts` logic standalone in Node
(via `tsx`), logging directly through `zizkadb-sdk` using `.env.local` — no
dev server required. Run `seed-normal` then `seed-shift` before checking the
Drift tab/tour output, so there's a "before" and "after" window to compare.

## Testing

```bash
npm run test              # unit tests (mocked, offline)
npm run test:watch        # watch mode
npm run test:integration  # hits real ZizkaDB using .env.local's credentials
npm run test:zizkadb      # original manual log -> why sanity script
```

Unit tests cover: message validation, chat UI rendering, the `useChat` hook
(including full causal step-chain logging), `chat.service`/`run-agent-turn`
(intent routing, tool dispatch, external-chat/internal-fallback behavior),
and each tool in isolation. The integration suite
(`src/zizkadb/integration/*.integration.test.ts`) exercises the real
`src/zizkadb/*` service layer — logging, causality, query, search, state,
replay, drift, agents, and forget — against your configured ZizkaDB tenant;
it's excluded from `npm test` and skips gracefully if no API key is set.

## Linting & formatting

```bash
npm run lint
npm run format        # write
npm run format:check  # check only
```

## Build

```bash
npm run build
npm run start
```

## Future extensibility

- Streaming AI responses (swap the fetch call in `agent/tools/external-chat.tool.ts`)
- More business tools (add a `Tool` to `src/agent/tools/` and register it in
  `src/agent/tools/index.ts`'s `intentToolRegistry`)
- Wire `contextFor()`/`forget()` into the Inspector UI (services + API routes
  already exist, just no tab yet)
- Authentication, multi-conversation history, markdown rendering, streaming,
  RAG — none implemented now, but the layering doesn't fight any of them.
