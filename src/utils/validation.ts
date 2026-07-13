import { MAX_MESSAGE_LENGTH } from "@/constants/api";

export type MessageValidationResult = { valid: true } | { valid: false; error: string };

export function validateMessage(input: string): MessageValidationResult {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Message cannot be empty." };
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      error: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`,
    };
  }

  return { valid: true };
}
