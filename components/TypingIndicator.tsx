import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

interface TypingIndicatorProps {
  visible: boolean;
}

export default function TypingIndicator({ visible }: TypingIndicatorProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.role}>Sonderr</Text>
        <View style={styles.dots}>
          <View style={[styles.dot, { animationDelay: 0 }]} />
          <View style={[styles.dot, { animationDelay: 150 }]} />
          <View style={[styles.dot, { animationDelay: 300 }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    marginVertical: 6,
  },
  bubble: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  role: {
    color: "#888888",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dots: {
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#888888",
  },
});
