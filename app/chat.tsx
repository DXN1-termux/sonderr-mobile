import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { useSettingsStore } from "@/services/storage";
import { PROVIDERS, getProvider, ProviderId } from "@/constants/providers";
import ModelSelector from "@/components/ModelSelector";

export default function ChatScreen() {
  const [modelSelectorVisible, setModelSelectorVisible] = useState(false);
  const { activeProvider, providers, updateProvider, save } = useSettingsStore();

  const active = providers.find((p) => p.id === activeProvider);
  const providerDef = getProvider(activeProvider);
  const modelLabel = active?.model || providerDef?.defaultModel || "Setup";
  const ready = active?.enabled && active?.apiKey;

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

      <View style={styles.content}>
        {ready ? (
          <View style={styles.readyState}>
            <Text style={styles.readyEmoji}>⚡</Text>
            <Text style={styles.readyTitle}>Ready</Text>
            <Text style={styles.readySubtitle}>
              {providerDef?.name} · {modelLabel}
            </Text>
            <Text style={styles.readyHint}>Chat UI and streaming will be wired up in the next pass.</Text>
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No provider active</Text>
            <Text style={styles.emptySubtitle}>
              Tap Model above, pick a provider, and add your API key to start.
            </Text>
          </View>
        )}
      </View>

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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  readyState: {
    alignItems: "center",
    gap: 8,
  },
  readyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  readyTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
  },
  readySubtitle: {
    color: "#cccccc",
    fontSize: 15,
  },
  readyHint: {
    color: "#666666",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  empty: {
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  emptySubtitle: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
