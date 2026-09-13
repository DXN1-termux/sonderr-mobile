import { View, Text, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { useSettingsStore } from "@/services/storage";
import ChatScreen from "./chat";
import ResearchScreen from "./research";
import SettingsScreen from "./settings";
import TabBar from "@/components/TabBar";

export type Tab = "chat" | "research" | "settings";

export default function RootLayout() {
  const [tab, setTab] = useState<Tab>("chat");
  const load = useSettingsStore((s) => s.load);

  useEffect(() => {
    load();
  }, [load]);

  const screen = tab === "chat" ? <ChatScreen /> : tab === "research" ? <ResearchScreen /> : <SettingsScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.screen}>{screen}</View>
      <TabBar active={tab} onChange={setTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  screen: {
    flex: 1,
  },
});
