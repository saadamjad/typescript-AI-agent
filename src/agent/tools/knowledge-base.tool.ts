import { getInternalResponse } from "@/services/internal-knowledge.service";
import type { Tool } from "@/agent/types";

/** Offline fallback handler used when the external chat backend is unavailable. */
export const knowledgeBaseTool: Tool = {
  name: "knowledge_base",
  async run(message) {
    const output = getInternalResponse(message);
    if (output === null) {
      throw new Error("No internal knowledge handler matched the message.");
    }
    return { output };
  },
};
