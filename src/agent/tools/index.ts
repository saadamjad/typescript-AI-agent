import type { Intent, Tool } from "@/agent/types";
import { billingLookupTool } from "@/agent/tools/billing-lookup.tool";
import { refundPolicyTool } from "@/agent/tools/refund-policy.tool";

export { externalChatTool } from "@/agent/tools/external-chat.tool";
export { knowledgeBaseTool } from "@/agent/tools/knowledge-base.tool";
export { billingLookupTool } from "@/agent/tools/billing-lookup.tool";
export { refundPolicyTool } from "@/agent/tools/refund-policy.tool";

/** Maps an intent to the dedicated business tool that should handle it, if any. */
export const intentToolRegistry: Partial<Record<Intent, Tool>> = {
  billing: billingLookupTool,
  refund: refundPolicyTool,
};
