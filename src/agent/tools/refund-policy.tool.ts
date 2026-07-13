import type { Tool } from "@/agent/types";

const REFUND_WINDOW_DAYS = 30;
const DENIAL_KEYWORDS = /\b(expired|used|damaged)\b/i;
const STANDARD_REFUND_AMOUNT = 49.99;

/** Simulated business tool: evaluates a refund request against a mock policy. */
export const refundPolicyTool: Tool = {
  name: "refund_policy",
  async run(message) {
    if (DENIAL_KEYWORDS.test(message)) {
      return {
        output:
          `Refunds are available within ${REFUND_WINDOW_DAYS} days of purchase for unused items. ` +
          "Based on your description, this request doesn't qualify — please contact support for other options.",
        statePatch: { refund_status: "denied" },
      };
    }

    return {
      output:
        `Refunds are available within ${REFUND_WINDOW_DAYS} days of purchase. Your request qualifies — ` +
        `a refund of $${STANDARD_REFUND_AMOUNT.toFixed(2)} will be processed within 5-7 business days.`,
      statePatch: { refund_status: "approved", refund_amount: STANDARD_REFUND_AMOUNT },
    };
  },
};
