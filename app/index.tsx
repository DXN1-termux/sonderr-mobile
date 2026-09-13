import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useSettingsStore } from "@/services/storage";
import OnboardingScreen from "./onboarding";
import TabLayout from "./(tabs)/_layout";

export default function RootIndex() {
  const [ready, setReady] = useState(false);
  const load = useSettingsStore((s) => s.load);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await load();
      if (mounted) setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, [load]);

  if (!ready) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#2563eb" />
        <Text style={styles.loadingText}>Loading Sonderr</Text>
      </View>
    );
  }

  const hasProvider = useSettingsStore.getState().providers.some((p) => p.enabled && p.apiKey);

  if (!hasProvider) {
    return <OnboardingScreen />;
  }

  return <TabLayout />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#888888",
    fontSize: 14,
  },
});
