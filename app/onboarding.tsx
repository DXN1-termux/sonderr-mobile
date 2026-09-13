import { StyleSheet, Text, View, TouchableOpacity, TextInput } from "react-native";
import { useState } from "react";
import { PROVIDERS, getProvider, ProviderId } from "@/constants/providers";
import { useSettingsStore } from "@/services/storage";

export default function OnboardingScreen() {
  const { activeProvider, setActiveProvider, updateProvider, save } = useSettingsStore();
  const [apiKeys, setApiKeys] = useState<Record<ProviderId, string>>({
    openai: "",
    anthropic: "",
    gemini: "",
  });

  const handleContinue = async () => {
    try {
      (Object.keys(apiKeys) as ProviderId[]).forEach((id) => {
        const trimmed = apiKeys[id].trim();
        updateProvider(id, {
          apiKey: trimmed,
          enabled: trimmed.length > 0,
          model: getProvider(id)?.defaultModel ?? "",
        });
      });
      await save();
    } catch (err) {
      console.error("Onboarding save failed:", err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>⚡</Text>
        <Text style={styles.title}>Sonderr</Text>
        <Text style={styles.subtitle}>
          Chat-first AI with research mode. Bring your own keys, run on your models.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose your default provider</Text>
          <View style={styles.row}>
            {PROVIDERS.map((p) => {
              const selected = activeProvider === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.pill, selected && styles.pillActive]}
                  onPress={() => setActiveProvider(p.id)}
                >
                  <Text style={[styles.pillText, selected && styles.pillTextActive]}>{p.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API keys</Text>
          <Text style={styles.hint}>Optional now. You can add keys later in Settings.</Text>

          {PROVIDERS.map((p) => (
            <View key={p.id} style={styles.keyRow}>
              <Text style={styles.keyLabel}>{p.name}</Text>
              <TextInput
                style={styles.keyInput}
                value={apiKeys[p.id]}
                onChangeText={(text) =>
                  setApiKeys((prev) => ({ ...prev, [p.id]: text }))
                }
                placeholder="sk-..."
                placeholderTextColor="#666666"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 24,
    gap: 16,
  },
  emoji: {
    fontSize: 48,
    textAlign: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#888888",
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    marginTop: 8,
    gap: 10,
  },
  sectionTitle: {
    color: "#cccccc",
    fontSize: 14,
    fontWeight: "600",
  },
  hint: {
    color: "#666666",
    fontSize: 13,
    marginBottom: 6,
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
  keyRow: {
    gap: 6,
  },
  keyLabel: {
    color: "#888888",
    fontSize: 13,
    fontWeight: "500",
  },
  keyInput: {
    backgroundColor: "#111111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1a1a1a",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#ffffff",
    fontSize: 15,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
