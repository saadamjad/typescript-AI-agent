export const API_ENDPOINTS = {
  CHAT: "/chat",
} as const;

export const REQUEST_TIMEOUT_MS = 30_000;

export const MAX_MESSAGE_LENGTH = 2000;

export const FALLBACK_UNSUPPORTED_MESSAGE =
  "I'm currently unable to reach the AI assistant, and I don't have information to answer that question. Please try again in a moment.";
