/** Realistic message banks used to drive the agent through varied, believable conversations. */

export const BILLING_MESSAGES = [
  "What's my current bill?",
  "Can you show me my last payment?",
  "Why was I charged twice this month?",
  "How much do I owe on my invoice?",
];

export const REFUND_MESSAGES = [
  "I want a refund for my last order.",
  "Can I get my money back? The item was expired.",
  "I'd like a refund please.",
  "The product I bought was damaged, can I get a refund?",
];

export const FAQ_MESSAGES = [
  "How many days are there in a week?",
  "What is 12 * 4?",
  "What's today's date?",
  "How many months are there in a year?",
];

export const SMALLTALK_MESSAGES = [
  "Hello, how are you?",
  "Thanks for your help!",
  "Good morning!",
  "Can you help me with something?",
];

export const OFF_TOPIC_MESSAGES = [
  "What is the capital of France?",
  "Tell me about quantum physics.",
  "Who won the world cup in 1998?",
];

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** A normal-traffic session: mostly smalltalk/faq/billing, occasional refund. */
export function normalSessionMessages(): string[] {
  const count = 2 + Math.floor(Math.random() * 3);
  const pool = [...SMALLTALK_MESSAGES, ...FAQ_MESSAGES, ...BILLING_MESSAGES, ...REFUND_MESSAGES];
  return Array.from({ length: count }, () => pick(pool));
}

/** A shifted-traffic session: heavy refund/billing plus off-topic questions the agent can't resolve. */
export function shiftedSessionMessages(): string[] {
  const count = 3 + Math.floor(Math.random() * 3);
  const pool = [...REFUND_MESSAGES, ...BILLING_MESSAGES, ...OFF_TOPIC_MESSAGES];
  return Array.from({ length: count }, () => pick(pool));
}
