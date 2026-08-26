export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimated: boolean;
  model?: string;
}

export interface BackendUsage {
  model?: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

/**
 * ZizkaDB's documented `data.token_usage` convention (see
 * docs/adr/006-token-usage-jsonb-convention.md in the ZizkaDB repo). The
 * Token Usage / Token Optimization reports aggregate events with
 * `WHERE data ? 'token_usage'` reading exactly these key names — logging
 * under any other shape (e.g. our internal TokenUsage type) makes an event
 * invisible to those reports no matter how many get logged.
 */
export interface ZizkaDBTokenUsage {
  model?: string;
  input_tokens: number;
  output_tokens: number;
  cached_tokens?: number;
  reasoning_tokens?: number;
}

export function toZizkaDBTokenUsage(usage: TokenUsage): ZizkaDBTokenUsage {
  return {
    ...(usage.model ? { model: usage.model } : {}),
    input_tokens: usage.promptTokens,
    output_tokens: usage.completionTokens,
  };
}

const CHARS_PER_TOKEN = 4;

/** Rough token estimate for text the backend didn't report real usage for. */
export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / CHARS_PER_TOKEN));
}

/**
 * Prefers real token counts reported by the backend; falls back to a
 * character-based estimate so token-usage tracking still works against
 * backends that don't report usage.
 */
export function resolveUsage(
  backendUsage: BackendUsage | undefined,
  promptText: string,
  completionText: string,
): TokenUsage {
  if (backendUsage?.prompt_tokens != null && backendUsage?.completion_tokens != null) {
    const promptTokens = backendUsage.prompt_tokens;
    const completionTokens = backendUsage.completion_tokens;
    return {
      promptTokens,
      completionTokens,
      totalTokens: backendUsage.total_tokens ?? promptTokens + completionTokens,
      estimated: false,
      model: backendUsage.model,
    };
  }

  const promptTokens = estimateTokens(promptText);
  const completionTokens = estimateTokens(completionText);
  return {
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    estimated: true,
    model: backendUsage?.model,
  };
}
