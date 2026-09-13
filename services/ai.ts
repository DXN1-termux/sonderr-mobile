import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, streamText } from "ai";
import { useSettingsStore } from "./storage";
import { z } from "zod";

export type ProviderId = "openai" | "anthropic" | "gemini";

export interface ChatOptions {
  mode: "chat" | "research";
  attachments?: string[];
}

export async function* streamChatMessage(prompt: string, options: ChatOptions = { mode: "chat" }) {
  const settings = useSettingsStore.getState();
  const provider = settings.providers.find((p) => p.id === settings.activeProvider && p.enabled);

  if (!provider?.apiKey) {
    throw new Error("No active provider configured. Add an API key in Settings.");
  }

  let model;
  switch (provider.id) {
    case "openai":
      model = createOpenAI({ apiKey: provider.apiKey })(provider.model);
      break;
    case "anthropic":
      model = createAnthropic({ apiKey: provider.apiKey })(provider.model);
      break;
    case "gemini":
      model = createGoogleGenerativeAI({ apiKey: provider.apiKey })(provider.model);
      break;
    default:
      throw new Error(`Unsupported provider: ${provider.id}`);
  }

  const systemPrompt =
    options.mode === "research"
      ? "You are a research assistant. Provide detailed, well-cited answers. When possible, include inline citations and a sources section."
      : "You are Sonderr, an expert coding and general-purpose assistant. Be concise, precise, and helpful.";

  const result = streamText({
    model,
    system: systemPrompt,
    prompt,
    maxSteps: 5,
    experimental_continueSteps: options.mode === "research",
  });

  for await (const chunk of result.textStream) {
    yield chunk;
  }
}

export async function runResearch(query: string) {
  const settings = useSettingsStore.getState();
  const provider = settings.providers.find((p) => p.id === settings.activeProvider && p.enabled);

  if (!provider?.apiKey) {
    throw new Error("No active provider configured.");
  }

  const searchSchema = z.object({
    queries: z.array(z.string()).min(1).max(5),
  });

  let model;
  switch (provider.id) {
    case "openai":
      model = createOpenAI({ apiKey: provider.apiKey })(provider.model);
      break;
    case "anthropic":
      model = createAnthropic({ apiKey: provider.apiKey })(provider.model);
      break;
    case "gemini":
      model = createGoogleGenerativeAI({ apiKey: provider.apiKey })(provider.model);
      break;
    default:
      throw new Error(`Unsupported provider: ${provider.id}`);
  }

  const { object: searchQueries } = await generateText({
    model,
    system: "Generate focused web search queries for the user's research question.",
    prompt: `Research query: ${query}\n\nGenerate 1-3 focused search queries.`,
    schema: searchSchema,
  });

  // Placeholder: integrate with real web search API (Brave, Tavily, Serper, etc.)
  const mockSources = searchQueries.queries.map((q) => `https://example.com/search?q=${encodeURIComponent(q)}`);

  const { text: answer } = await generateText({
    model,
    system:
      "You are a research assistant. Write a comprehensive, structured answer with inline citations and a Sources section at the end.",
    prompt: `Research question: ${query}\n\nSearch queries used: ${searchQueries.queries.join(", ")}\n\nSources: ${mockSources.join("\n")}\n\nWrite a thorough research brief with citations.`,
    maxSteps: 3,
  });

  return { answer, sources: mockSources };
}
