import { View, Text, StyleSheet } from "react-native";
import { Stack } from "expo-router";

export default function TabLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Chat" }} />
      <Stack.Screen name="research" options={{ title: "Research" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({});
