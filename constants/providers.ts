import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export type ProviderId = "openai" | "anthropic" | "gemini";

export interface ProviderDefinition {
  id: ProviderId;
  name: string;
  defaultModel: string;
  models: string[];
  createClient: (apiKey: string) => any;
}

export const PROVIDERS: ProviderDefinition[] = [
  {
    id: "openai",
    name: "OpenAI",
    defaultModel: "gpt-4o",
    models: ["gpt-4o", "gpt-4o-mini", "o3", "o4-mini"],
    createClient: (apiKey) => createOpenAI({ apiKey }),
  },
  {
    id: "anthropic",
    name: "Anthropic",
    defaultModel: "claude-sonnet-4-20250514",
    models: ["claude-sonnet-4-20250514", "claude-opus-4-20250514", "claude-3-5-haiku-20241022"],
    createClient: (apiKey) => createAnthropic({ apiKey }),
  },
  {
    id: "gemini",
    name: "Google Gemini",
    defaultModel: "gemini-2.5-pro",
    models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.5-flash-lite"],
    createClient: (apiKey) => createGoogleGenerativeAI({ apiKey }),
  },
];

export const getProvider = (id: ProviderId) => PROVIDERS.find((p) => p.id === id);
