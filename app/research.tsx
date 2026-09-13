import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useState } from "react";
import Markdown from "react-markdown";
import { useSettingsStore } from "@/services/storage";

export default function ResearchScreen() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const { providers, activeProvider } = useSettingsStore();
  const ready = providers.some((p) => p.id === activeProvider && p.enabled && p.apiKey);

  const runResearch = async () => {
    if (!query.trim() || !ready) return;
    setLoading(true);
    setResult(null);
    setSources([]);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const mockSources = [
        `https://example.com/search?q=${encodeURIComponent(query)}`,
        `https://example.com/wiki/${encodeURIComponent(query)}`,
      ];

      const answer = `# Research: ${query}\n\nThis is a placeholder research output. In a full implementation, this would:\n\n1. Generate focused search queries from your topic\n2. Fetch real sources via web search API\n3. Synthesize a cited brief\n\n## Key points\n\n- Point one with citation [1]\n- Point two with citation [2]\n\n## Sources\n\n1. ${mockSources[0]}\n2. ${mockSources[1]}\n`;

      setResult(answer);
      setSources(mockSources);
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Research failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Research</Text>
          <Text style={styles.subtitle}>Deep dive with citations</Text>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="What do you want to research?"
            placeholderTextColor="#666666"
            onSubmitEditing={runResearch}
            returnKeyType="search"
            editable={ready}
          />
          <TouchableOpacity
            style={[styles.button, (loading || !query.trim() || !ready) && styles.buttonDisabled]}
            onPress={runResearch}
            disabled={loading || !query.trim() || !ready}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Run</Text>
            )}
          </TouchableOpacity>
        </View>

        {!ready && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              Add an API key in Settings to enable research mode.
            </Text>
          </View>
        )}

        {result && (
          <View style={styles.result}>
            <Markdown
              style={{
                body: { color: "#e0e0e0", fontSize: 15, lineHeight: 22 },
                strong: { color: "#ffffff", fontWeight: "600" },
                code: {
                  backgroundColor: "#1a1a1a",
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                  fontFamily: "monospace",
                  fontSize: 13,
                  color: "#ff9f43",
                },
                pre: {
                  backgroundColor: "#1a1a1a",
                  padding: 12,
                  borderRadius: 8,
                  marginVertical: 8,
                },
                a: { color: "#4da6ff" },
              }}
            >
              {result}
            </Markdown>

            {sources.length > 0 && (
              <View style={styles.sources}>
                <Text style={styles.sourcesTitle}>Sources</Text>
                {sources.map((src, i) => (
                  <Text key={i} style={styles.source}>
                    {i + 1}. {src}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  content: {
    padding: 16,
    gap: 12,
  },
  header: {
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 14,
    color: "#888888",
    marginTop: 2,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#111111",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#ffffff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
  warning: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    padding: 14,
  },
  warningText: {
    color: "#ff9f43",
    fontSize: 14,
    lineHeight: 20,
  },
  result: {
    gap: 12,
  },
  sources: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
  },
  sourcesTitle: {
    color: "#888888",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  source: {
    color: "#4da6ff",
    fontSize: 13,
    marginBottom: 4,
  },
});
