import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, TextInput } from "react-native";
import { useSettingsStore, ProviderConfig } from "@/services/storage";
import { PROVIDERS, getProvider, ProviderId } from "@/constants/providers";
import { SafeAreaView } from "react-native-safe-area-context";

interface ModelSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export default function ModelSelector({ visible, onClose }: ModelSelectorProps) {
  const { providers, activeProvider, setActiveProvider, updateProvider } = useSettingsStore();
  const [editingProvider, setEditingProvider] = useState<ProviderId | null>(null);
  const [tempKey, setTempKey] = useState("");

  const active = providers.find((p) => p.id === activeProvider);

  const handleSaveKey = () => {
    if (!editingProvider) return;
    updateProvider(editingProvider, { apiKey: tempKey.trim(), enabled: true });
    setTempKey("");
    setEditingProvider(null);
  };

  const handleSelectProvider = (id: ProviderId) => {
    setActiveProvider(id);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Model</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={PROVIDERS}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => {
                const config = providers.find((p) => p.id === item.id);
                const isActive = activeProvider === item.id;
                const isEnabled = config?.enabled;

                return (
                  <View style={[styles.providerCard, isActive && styles.providerCardActive]}>
                    <TouchableOpacity
                      style={styles.providerHeader}
                      onPress={() => handleSelectProvider(item.id)}
                    >
                      <View style={styles.providerInfo}>
                        <Text style={[styles.providerName, isActive && styles.providerNameActive]}>
                          {item.name}
                        </Text>
                        <Text style={styles.providerModel}>{config?.model || item.defaultModel}</Text>
                      </View>
                      <View style={[styles.badge, isEnabled && styles.badgeEnabled]}>
                        <Text style={[styles.badgeText, isEnabled && styles.badgeTextEnabled]}>
                          {isEnabled ? "READY" : "OFF"}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {isActive && (
                      <View style={styles.providerBody}>
                        <TouchableOpacity
                          style={styles.configureButton}
                          onPress={() => {
                            setEditingProvider(item.id);
                            setTempKey(config?.apiKey || "");
                          }}
                        >
                          <Text style={styles.configureButtonText}>
                            {isEnabled ? "Edit API Key" : "Add API Key"}
                          </Text>
                        </TouchableOpacity>

                        <View style={styles.modelRow}>
                          <Text style={styles.modelLabel}>Model</Text>
                          <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={item.models}
                            keyExtractor={(m) => m}
                            contentContainerStyle={styles.modelList}
                            renderItem={({ item: model }) => {
                              const selected = config?.model === model;
                              return (
                                <TouchableOpacity
                                  style={[styles.modelChip, selected && styles.modelChipSelected]}
                                  onPress={() => {
                                    updateProvider(item.id, { model });
                                    if (!isEnabled) updateProvider(item.id, { enabled: true });
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
                            }}
                          />
                        </View>
                      </View>
                    )}
                  </View>
                );
              }}
            />

            {editingProvider && (
              <View style={styles.keyModal}>
                <Text style={styles.keyTitle}>
                  {active?.apiKey ? "Update" : "Add"} {getProvider(editingProvider)?.name} API Key
                </Text>
                <TextInput
                  style={styles.keyInput}
                  value={tempKey}
                  onChangeText={setTempKey}
                  placeholder="sk-..."
                  placeholderTextColor="#666666"
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                />
                <View style={styles.keyActions}>
                  <TouchableOpacity
                    style={[styles.keyButton, styles.keyButtonSecondary]}
                    onPress={() => {
                      setEditingProvider(null);
                      setTempKey("");
                    }}
                  >
                    <Text style={styles.keyButtonTextSecondary}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.keyButton, styles.keyButtonPrimary]}
                    onPress={handleSaveKey}
                  >
                    <Text style={styles.keyButtonTextPrimary}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  safeArea: {
    flex: 1,
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#0a0a0a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  close: {
    color: "#888888",
    fontSize: 22,
    fontWeight: "300",
  },
  list: {
    padding: 16,
    gap: 12,
  },
  providerCard: {
    backgroundColor: "#111111",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1a1a1a",
    overflow: "hidden",
  },
  providerCardActive: {
    borderColor: "#2563eb",
  },
  providerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    color: "#cccccc",
    fontSize: 16,
    fontWeight: "600",
  },
  providerNameActive: {
    color: "#ffffff",
  },
  providerModel: {
    color: "#666666",
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  badgeEnabled: {
    backgroundColor: "#065f46",
    borderColor: "#059669",
  },
  badgeText: {
    color: "#666666",
    fontSize: 11,
    fontWeight: "700",
  },
  badgeTextEnabled: {
    color: "#a7f3d0",
  },
  providerBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 12,
  },
  configureButton: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  configureButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  modelRow: {
    gap: 8,
  },
  modelLabel: {
    color: "#888888",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  modelList: {
    gap: 8,
  },
  modelChip: {
    backgroundColor: "#1a1a1a",
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
  keyModal: {
    backgroundColor: "#111111",
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  keyTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
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
    marginBottom: 12,
  },
  keyActions: {
    flexDirection: "row",
    gap: 10,
  },
  keyButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  keyButtonSecondary: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  keyButtonPrimary: {
    backgroundColor: "#2563eb",
  },
  keyButtonTextSecondary: {
    color: "#cccccc",
    fontWeight: "600",
    fontSize: 14,
  },
  keyButtonTextPrimary: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
});
