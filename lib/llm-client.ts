import OpenAI from 'openai';

export function isAnthropicEndpoint(baseURL?: string) {
  return Boolean(baseURL?.trim().includes('api.anthropic.com'));
}

/** Cliente OpenAI-compatible, com headers extras quando o endpoint é Anthropic. */
export function createLlmClient(apiKey: string, baseURL?: string) {
  const endpoint = baseURL?.trim() || undefined;
  const anthropic = isAnthropicEndpoint(endpoint);

  return new OpenAI({
    apiKey,
    baseURL: endpoint,
    defaultHeaders: anthropic
      ? {
          'anthropic-version': '2026-10-21',
        }
      : undefined,
  });
}

/** Claude 5.x rejeita `temperature`; outros provedores usam 0.4. */
export function samplingParams(baseURL?: string): { temperature?: number } {
  if (isAnthropicEndpoint(baseURL)) return {};
  return { temperature: 0.4 };
}
