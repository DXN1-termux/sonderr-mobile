export type ProviderId = "openai" | "anthropic" | "gemini";

export interface ProviderDefinition {
  id: ProviderId;
  name: string;
  defaultModel: string;
  models: string[];
  endpoint: string;
}

export const PROVIDERS: ProviderDefinition[] = [
  {
    id: "openai",
    name: "OpenAI",
    defaultModel: "gpt-4o",
    models: ["gpt-4o", "gpt-4o-mini", "o3", "o4-mini"],
    endpoint: "https://api.openai.com/v1/chat/completions",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    defaultModel: "claude-sonnet-4-20250514",
    models: ["claude-sonnet-4-20250514", "claude-opus-4-20250514", "claude-3-5-haiku-20241022"],
    endpoint: "https://api.anthropic.com/v1/messages",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    defaultModel: "gemini-2.5-pro",
    models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.5-flash-lite"],
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent",
  },
];

export const getProvider = (id: ProviderId) => PROVIDERS.find((p) => p.id === id);
