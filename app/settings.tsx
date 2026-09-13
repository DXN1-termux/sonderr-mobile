import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, useEffect } from "react-native";
import { useState } from "react";
import { useSettingsStore } from "@/services/storage";
import { PROVIDERS, getProvider, ProviderId } from "@/constants/providers";

export default function SettingsScreen() {
  const [providerKeys, setProviderKeys] = useState<Record<ProviderId, string>>({
    openai: "",
    anthropic: "",
    gemini: "",
  });
  const [dirty, setDirty] = useState(false);
  const { providers, activeProvider, setActiveProvider, updateProvider, save } = useSettingsStore();

  useEffect(() => {
    setProviderKeys({
      openai: providers.find((p) => p.id === "openai")?.apiKey ?? "",
      anthropic: providers.find((p) => p.id === "anthropic")?.apiKey ?? "",
      gemini: providers.find((p) => p.id === "gemini")?.apiKey ?? "",
    });
  }, [providers]);

  const handleKeyChange = (id: ProviderId, value: string) => {
    setProviderKeys((prev) => ({ ...prev, [id]: value }));
    setDirty(true);
  };

  const persistKeys = async () => {
    try {
      (Object.keys(providerKeys) as ProviderId[]).forEach((id) => {
        const trimmed = providerKeys[id].trim();
        updateProvider(id, {
          apiKey: trimmed,
          enabled: trimmed.length > 0,
          model: getProvider(id)?.defaultModel ?? providers.find((p) => p.id === id)?.model ?? "",
        });
      });
      await save();
      setDirty(false);
    } catch (err) {
      Alert.alert("Save failed", err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>BYOK providers, model selection, exports</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active provider</Text>
        <View style={styles.row}>
          {PROVIDERS.map((p) => {
            const selected = activeProvider === p.id;
            const config = providers.find((c) => c.id === p.id);
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.pill, selected && styles.pillActive]}
                onPress={() => setActiveProvider(p.id)}
              >
                <Text style={[styles.pillText, selected && styles.pillTextActive]}>{p.name}</Text>
                <Text style={[styles.pillStatus, selected && styles.pillStatusActive]}>
                  {config?.enabled ? "Ready" : "Off"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>API keys</Text>
          {dirty && (
            <TouchableOpacity onPress={persistKeys}>
              <Text style={styles.saveAction}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.sectionHint}>Keys are stored on device using Expo SecureStore.</Text>

        {PROVIDERS.map((p) => {
          const config = providers.find((c) => c.id === p.id);
          const value = providerKeys[p.id] ?? config?.apiKey ?? "";
          return (
            <View key={p.id} style={styles.keyCard}>
              <View style={styles.keyHeader}>
                <View>
                  <Text style={styles.keyProvider}>{p.name}</Text>
                  <Text style={styles.keyModel}>{config?.model || p.defaultModel}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, config?.enabled && styles.toggleOn]}
                  onPress={() => {
                    const next = !config?.enabled;
                    updateProvider(p.id, { enabled: next });
                    if (next && !value.trim()) {
                      Alert.alert("Missing API key", `Enter an API key for ${p.name}.`);
                    }
                    save();
                  }}
                >
                  <View style={[styles.toggleKnob, config?.enabled && styles.toggleKnobOn]} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.keyInput}
                value={value}
                onChangeText={(text) => {
                  handleKeyChange(p.id, text);
                }}
                placeholder={`Paste ${p.name} API key`}
                placeholderTextColor="#666666"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />

              <View style={styles.modelRow}>
                <Text style={styles.modelLabel}>Model</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.modelChips}>
                    {p.models.map((model) => {
                      const selected = config?.model === model;
                      return (
                        <TouchableOpacity
                          key={model}
                          style={[styles.modelChip, selected && styles.modelChipSelected]}
                          onPress={() => {
                            updateProvider(p.id, { model, enabled: true });
                            save();
                          }}
                        >
                          <Text
                            style={[styles.modelChipText, selected && styles.modelChipTextSelected]}
                            numberOfLines={1}
                          >
                            {model}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Theme</Text>
        <View style={styles.row}>
          {(["dark", "light"] as const).map((t) => {
            const selected = useSettingsStore.getState().theme === t;
            return (
              <TouchableOpacity
                key={t}
                style={[styles.pill, selected && styles.pillActive]}
                onPress={() => useSettingsStore.getState().setTheme(t)}
              >
                <Text style={[styles.pillText, selected && styles.pillTextActive]}>
                  {t === "dark" ? "Dark" : "Light"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.item}>
          <Text style={styles.itemText}>Sonderr Mobile</Text>
          <Text style={styles.itemMeta}>Version 0.1.0 · MIT License</Text>
        </View>
      </View>
    </ScrollView>
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
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  sectionTitle: {
    color: "#888888",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionHint: {
    color: "#666666",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  pill: {
    flex: 1,
    backgroundColor: "#111111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1a1a1a",
    paddingVertical: 10,
    alignItems: "center",
    gap: 4,
  },
  pillActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  pillText: {
    color: "#888888",
    fontSize: 14,
    fontWeight: "600",
  },
  pillTextActive: {
    color: "#ffffff",
  },
  pillStatus: {
    fontSize: 11,
    color: "#666666",
    fontWeight: "500",
  },
  pillStatusActive: {
    color: "#a7f3d0",
  },
  item: {
    backgroundColor: "#111111",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1a1a1a",
    gap: 4,
  },
  itemText: {
    color: "#e0e0e0",
    fontSize: 15,
    fontWeight: "500",
  },
  itemMeta: {
    color: "#666666",
    fontSize: 13,
  },
  saveAction: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
  },
  keyCard: {
    backgroundColor: "#111111",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1a1a1a",
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  keyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  keyProvider: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  keyModel: {
    color: "#666666",
    fontSize: 13,
    marginTop: 2,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    padding: 3,
    justifyContent: "center",
  },
  toggleOn: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#888888",
  },
  toggleKnobOn: {
    backgroundColor: "#ffffff",
    transform: [{ translateX: 18 }],
  },
  keyInput: {
    backgroundColor: "#0a0a0a",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#ffffff",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  modelRow: {
    gap: 8,
  },
  modelLabel: {
    color: "#888888",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  modelChips: {
    flexDirection: "row",
    gap: 8,
  },
  modelChip: {
    backgroundColor: "#0a0a0a",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  modelChipSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  modelChipText: {
    color: "#888888",
    fontSize: 13,
    fontWeight: "500",
  },
  modelChipTextSelected: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
