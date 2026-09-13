import { useSettingsStore } from "./storage";
import { PROVIDERS, getProvider } from "@/constants/providers";

export interface ChatOptions {
  mode: "chat" | "research";
  attachments?: string[];
}

export function getActiveProvider() {
  const { providers, activeProvider } = useSettingsStore.getState();
  const provider = providers.find((p) => p.id === activeProvider);
  if (!provider?.apiKey) {
    throw new Error("No active provider configured. Add an API key in Settings.");
  }
  return provider;
}

export async function streamChatMessage(prompt: string, options: ChatOptions = { mode: "chat" }) {
  const provider = getActiveProvider();
  const providerDef = getProvider(provider.id);

  if (!providerDef) throw new Error(`Unknown provider: ${provider.id}`);

  const endpoint = providerDef.endpoint ?? getDefaultEndpoint(provider.id);
  const model = provider.model || providerDef.defaultModel;

  const systemPrompt =
    options.mode === "research"
      ? "You are a research assistant. Provide detailed, well-cited answers with a Sources section."
      : "You are Sonderr, an expert assistant. Be concise, precise, and helpful.";

  const body = buildRequestBody(provider.id, {
    model,
    system: systemPrompt,
    prompt,
    stream: true,
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(provider.id, provider.apiKey),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Provider error ${response.status}: ${text}`);
  }

  if (!response.body) {
    throw new Error("Streaming not supported in this environment.");
  }

  return streamResponseBody(response.body, provider.id);
}

export async function runResearch(query: string) {
  const provider = getActiveProvider();
  const providerDef = getProvider(provider.id);

  if (!providerDef) throw new Error(`Unknown provider: ${provider.id}`);

  const endpoint = providerDef.endpoint ?? getDefaultEndpoint(provider.id);
  const model = provider.model || providerDef.defaultModel;

  const searchBody = buildRequestBody(provider.id, {
    model,
    system: "Generate focused web search queries for the user's research question.",
    prompt: `Research query: ${query}\n\nGenerate 1-3 focused search queries.`,
    maxTokens: 256,
  });

  const searchRes = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(provider.id, provider.apiKey),
    },
    body: JSON.stringify(searchBody),
  });

  if (!searchRes.ok) {
    const text = await searchRes.text();
    throw new Error(`Provider error ${searchRes.status}: ${text}`);
  }

  const searchData = await searchRes.json();
  const queries = extractQueries(provider.id, searchData);

  const mockSources = queries.map((q) => `https://example.com/search?q=${encodeURIComponent(q)}`);

  const answerBody = buildRequestBody(provider.id, {
    model,
    system:
      "You are a research assistant. Write a comprehensive, structured answer with inline citations and a Sources section.",
    prompt: `Research question: ${query}\n\nSearch queries used: ${queries.join(", ")}\n\nSources: ${mockSources.join("\n")}\n\nWrite a thorough research brief with citations.`,
    maxTokens: 1200,
  });

  const answerRes = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(provider.id, provider.apiKey),
    },
    body: JSON.stringify(answerBody),
  });

  if (!answerRes.ok) {
    const text = await answerRes.text();
    throw new Error(`Provider error ${answerRes.status}: ${text}`);
  }

  const answerData = await answerRes.json();
  const answer = extractText(provider.id, answerData);

  return { answer, sources: mockSources };
}

async function* streamResponseBody(body: any, providerId: string) {
  const reader = body.getReader?.();
  if (!reader) {
    const text = await extractTextFromBody(body);
    yield text;
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const chunk = parseStreamLine(providerId, trimmed);
        if (chunk) yield chunk;
      }
    }
  } finally {
    reader.releaseLock?.();
  }
}

function parseStreamLine(providerId: string, line: string): string | null {
  if (providerId === "openai") {
    if (!line.startsWith("data: ")) return null;
    if (line === "data: [DONE]") return null;
    try {
      const parsed = JSON.parse(line.slice(6));
      return parsed.choices?.[0]?.delta?.content ?? null;
    } catch {
      return null;
    }
  }

  if (providerId === "anthropic") {
    if (!line.startsWith("data: ")) return null;
    try {
      const parsed = JSON.parse(line.slice(6));
      if (parsed.type === "content_block_delta") {
        return parsed.delta?.text ?? null;
      }
      return null;
    } catch {
      return null;
    }
  }

  if (providerId === "gemini") {
    try {
      const parsed = JSON.parse(line);
      return parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    } catch {
      return null;
    }
  }

  return null;
}

function buildRequestBody(providerId: string, payload: any) {
  if (providerId === "openai") {
    return {
      model: payload.model,
      messages: [
        { role: "system", content: payload.system },
        { role: "user", content: payload.prompt },
      ],
      stream: payload.stream ?? false,
      max_tokens: payload.maxTokens ?? 1024,
    };
  }

  if (providerId === "anthropic") {
    return {
      model: payload.model,
      max_tokens: payload.maxTokens ?? 1024,
      system: payload.system,
      messages: [{ role: "user", content: payload.prompt }],
      stream: payload.stream ?? false,
    };
  }

  if (providerId === "gemini") {
    return {
      contents: [
        {
          role: "user",
          parts: [{ text: `${payload.system}\n\n${payload.prompt}` }],
        },
      ],
      generationConfig: { maxOutputTokens: payload.maxTokens ?? 1024 },
    };
  }

  return payload;
}

function getAuthHeader(providerId: string, apiKey: string) {
  if (providerId === "openai") {
    return { Authorization: `Bearer ${apiKey}` };
  }
  if (providerId === "anthropic") {
    return { "x-api-key": apiKey, "anthropic-version": "2023-06-01" };
  }
  if (providerId === "gemini") {
    return {};
  }
  return { Authorization: `Bearer ${apiKey}` };
}

function getDefaultEndpoint(providerId: string): string {
  if (providerId === "openai") return "https://api.openai.com/v1/chat/completions";
  if (providerId === "anthropic") return "https://api.anthropic.com/v1/messages";
  if (providerId === "gemini") return "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent";
  throw new Error(`No endpoint for provider: ${providerId}`);
}

function extractQueries(providerId: string, data: any): string[] {
  if (providerId === "openai") {
    const text = data.choices?.[0]?.message?.content ?? "";
    const matches = text.match(/\b[\w\s]+(?:\?|$)/g);
    return matches ? matches.slice(0, 3).map((m: string) => m.trim()).filter(Boolean) : [data.choices?.[0]?.message?.content ?? ""];
  }
  if (providerId === "anthropic") {
    return [(data.content ?? [])[0]?.text ?? ""].filter(Boolean);
  }
  if (providerId === "gemini") {
    return [(data.candidates?.[0]?.content?.parts?.[0]?.text ?? "")].filter(Boolean);
  }
  return [];
}

function extractText(providerId: string, data: any): string {
  if (providerId === "openai") {
    return data.choices?.[0]?.message?.content ?? "(empty response)";
  }
  if (providerId === "anthropic") {
    return (data.content ?? []).map((b: any) => b.text).join("") || "(empty response)";
  }
  if (providerId === "gemini") {
    return data.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "(empty response)";
  }
  return "(empty response)";
}

async function extractTextFromBody(body: any): Promise<string> {
  try {
    const text = await body.text?.();
    if (typeof text === "string") return text;
  } catch {}
  return "(streaming not available in this environment)";
}
