import { useState, useRef, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useSettingsStore } from "@/services/storage";
import { PROVIDERS, getProvider } from "@/constants/providers";
import { streamChatMessage } from "@/services/ai";
import ChatBubble from "@/components/ChatBubble";
import MessageInput from "@/components/MessageInput";
import ModelSelector from "@/components/ModelSelector";
import EmptyState from "@/components/EmptyState";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export default function ChatScreen() {
  const [modelSelectorVisible, setModelSelectorVisible] = useState(false);
  const { activeProvider, providers } = useSettingsStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const active = providers.find((p) => p.id === activeProvider);
  const providerDef = getProvider(activeProvider);
  const modelLabel = active?.model || providerDef?.defaultModel || "Setup";
  const ready = active?.enabled && active?.apiKey;

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      let assistantText = "";
      const assistantId = `assistant-${Date.now()}`;

      const stream = streamChatMessage(text, { mode: "chat" });

      for await (const chunk of stream) {
        assistantText += chunk;
        setMessages((prev) => {
          const next = [...prev];
          const idx = next.findIndex((m) => m.id === assistantId);
          if (idx >= 0) {
            next[idx] = { ...next[idx], content: assistantText };
          } else {
            next.push({ id: assistantId, role: "assistant", content: assistantText });
          }
          return next;
        });
      }

      if (!assistantText) {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "No response received from provider.",
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: err instanceof Error ? err.message : "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Sonderr</Text>
            <Text style={styles.subtitle}>
              {ready ? `${providerDef?.name} · ${modelLabel}` : "No provider active"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.modelButton}
            onPress={() => setModelSelectorVisible(true)}
          >
            <Text style={styles.modelButtonLabel}>Model</Text>
            <Text style={styles.modelButtonValue} numberOfLines={1}>
              {ready ? modelLabel : "Setup"}
            </Text>
            <Text style={styles.modelButtonChevron}>▾</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        inverted
        renderItem={({ item }) => <ChatBubble message={item} />}
        ListEmptyComponent={
          <EmptyState
            title="Ready to build"
            subtitle="Pick a provider and model above, then start a conversation."
          />
        }
      />

      <MessageInput
        input={input}
        onInputChange={setInput}
        onSubmit={handleSend}
        disabled={!ready || loading}
        placeholder={
          ready ? "Ask Sonderr anything..." : "Add an API key in the model picker to start"
        }
      />

      <ModelSelector visible={modelSelectorVisible} onClose={() => setModelSelectorVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
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
  modelButton: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: "#111111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modelButtonLabel: {
    color: "#888888",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  modelButtonValue: {
    flex: 1,
    color: "#e0e0e0",
    fontSize: 13,
    fontWeight: "500",
  },
  modelButtonChevron: {
    color: "#888888",
    fontSize: 16,
    fontWeight: "600",
  },
  messages: {
    padding: 16,
    paddingBottom: 8,
  },
});
