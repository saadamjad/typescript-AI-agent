import type { Intent } from "@/agent/types";

const REFUND_PATTERN = /\brefunds?\b/i;
const BILLING_PATTERN = /\b(bill|billing|invoice|charge|charged|payment)\b/i;

/**
 * Deterministic keyword-based intent routing. Billing/refund messages get a
 * dedicated business tool; everything else falls through to the existing
 * external-chat-then-internal-fallback path.
 */
export function classifyIntent(message: string): Intent {
  if (REFUND_PATTERN.test(message)) {
    return "refund";
  }
  if (BILLING_PATTERN.test(message)) {
    return "billing";
  }
  return "general";
}
