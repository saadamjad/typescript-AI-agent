# AI Customer Support Chat

A lightweight, single-page AI customer support chat frontend. It sends user
messages to an existing FastAPI backend and renders the AI's response. Built
for local development and testing — no auth, no database, no persistence.

## Overview

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS for styling
- Native `fetch` for API calls, validated with Zod
- Vitest + React Testing Library for tests
- No conversation history is stored anywhere (in-memory only, cleared on refresh)

## Architecture

The app follows a strict one-directional layering so each layer has a single
responsibility:

```
UI Components  ->  Custom Hooks  ->  Service Layer  ->  API Client  ->  Backend API
```

- **Components** (`src/components/chat`) — presentation only. No fetch calls,
  no business logic.
- **Hooks** (`src/hooks/useChat.ts`) — owns chat state (messages, loading,
  error) and orchestrates sending a message.
- **Services** (`src/services/chat.service.ts`) — talks to the backend for a
  specific domain (chat), validates the response shape with Zod, and falls
  back to the internal knowledge handler if the backend is unavailable.
- **API client** (`src/services/api-client.ts`) — generic HTTP concerns:
  building the URL from env config, timeouts, JSON headers, and normalized
  error types.
- **Internal knowledge handler** (`src/services/internal-knowledge.service.ts`)
  — a self-contained fallback source for basic questions, kept separate from
  the external AI integration so each concern stays isolated.
- **Backend API** — an external FastAPI service, reached only through
  `NEXT_PUBLIC_API_URL`.

This separation makes it straightforward to extend later (streaming, auth,
persistence, multiple conversations, etc.) without restructuring existing
code — see the bottom of this document.

## Folder structure

```
src/
  app/                  Next.js App Router pages (layout, page, error, loading, not-found)
  components/chat/      Chat UI components (Chat, ChatWindow, ChatMessage, ChatInput)
  hooks/                useChat — chat state + orchestration
  services/             api-client (HTTP), chat.service (orchestration),
                        internal-knowledge.service (offline fallback)
  config/               env.ts — validated environment configuration
  types/                chat.ts — shared types and Zod schemas
  utils/                validation.ts — message validation utilities
  constants/            api.ts — endpoint paths, timeouts, limits
```

## Prerequisites

- Node.js 20+
- A running FastAPI backend exposing `POST /chat` (see [Backend API contract](#backend-api-contract))

## Installation

```bash
npm install
```

## Environment setup

Copy the example env file and point it at your backend:

```bash
cp .env.local.example .env.local
```

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

`NEXT_PUBLIC_API_URL` is required. The app validates it at startup
(`src/config/env.ts`) and fails fast with a clear error if it's missing or not
a valid URL — it will never silently fall back to a hardcoded URL.

## Running locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Make sure your FastAPI
backend is running and reachable at the URL configured above.

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

The OpenAI API key (or any provider credentials) must live only in the
backend — the frontend never sees or stores secrets.

## Internal fallback (offline mode)

If the backend is unreachable, times out, returns an error, or the AI
provider's API key is missing/invalid on the server side, the frontend never
surfaces a raw error or crashes. `chat.service.ts` catches any failure from
the external call and hands the question to
`internal-knowledge.service.ts`, a small, dependency-free handler registry
that can answer basic questions offline:

- Today's date / day of the week
- Days in a week / months in a year
- "How old are you?"
- Basic arithmetic (`2 + 2`, `10 / 4`, `6 x 7`, ...)

If the internal handler doesn't recognize the question either, the user gets
a clear, safe message asking them to try again later — never an internal
error or a crash.

To add a new offline capability, add one `{ canHandle, respond }` entry to
the `knowledgeHandlers` array in `internal-knowledge.service.ts`; no other
files need to change.

## Testing

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

Tests cover: message validation, chat message/input rendering and disabled
states, the `useChat` hook (success, error, duplicate-submission guard), and
the chat service (success, HTTP error, malformed response, network failure).

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

The layering above is intentionally ready to absorb, without major rework:

- Streaming AI responses (swap the fetch call in `chat.service.ts`)
- Authentication (add headers in `api-client.ts`)
- Conversation history / persistence (extend `useChat`)
- Multiple conversations, markdown rendering, file uploads, voice input,
  WebSockets, analytics, RAG integration

None of these are implemented now — only the architecture is prepared for them.
