import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Markdown from "react-markdown";

interface ChatBubbleProps {
  message: {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
  };
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userBubble : styles.assistantBubble,
      ]}
    >
      <Text style={[styles.role, isUser ? styles.userRole : styles.assistantRole]}>
        {isUser ? "You" : "Sonderr"}
      </Text>
      <View style={styles.content}>
        <Markdown
          style={{
            body: { color: isUser ? "#ffffff" : "#e0e0e0", fontSize: 15, lineHeight: 22 },
            strong: { color: "#ffffff", fontWeight: "600" },
            code: {
              backgroundColor: "#1a1a1a",
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
              fontFamily: "monospace",
              fontSize: 13,
              color: "#ff9f43",
            },
            pre: {
              backgroundColor: "#1a1a1a",
              padding: 12,
              borderRadius: 8,
              marginVertical: 8,
            },
            a: { color: "#4da6ff" },
          }}
        >
          {message.content}
        </Markdown>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: "85%",
    marginVertical: 6,
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#2563eb",
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  role: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  userRole: {
    color: "#93c5fd",
  },
  assistantRole: {
    color: "#888888",
  },
  content: {
    flex: 1,
  },
});
