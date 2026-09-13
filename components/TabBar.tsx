import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import Markdown from "react-markdown";

type Tab = "chat" | "research" | "settings";

interface TabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: "chat", label: "Chat", icon: "💬" },
  { key: "research", label: "Research", icon: "🔎" },
  { key: "settings", label: "Settings", icon: "⚙️" },
];

export default function TabBar({ active, onChange }: TabBarProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const selected = active === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onChange(tab.key)}
          >
            <Text style={[styles.icon, selected && styles.iconActive]}>{tab.icon}</Text>
            <Text style={[styles.label, selected && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#0a0a0a",
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
    paddingBottom: 10,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  icon: {
    fontSize: 20,
    opacity: 0.6,
  },
  iconActive: {
    opacity: 1,
  },
  label: {
    fontSize: 11,
    color: "#666666",
    fontWeight: "500",
  },
  labelActive: {
    color: "#2563eb",
    fontWeight: "600",
  },
});
