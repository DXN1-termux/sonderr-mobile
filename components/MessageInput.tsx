import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Keyboard } from "react-native";
import * as DocumentPicker from "expo-document-picker";

interface MessageInputProps {
  input: string;
  onInputChange: (e: { target: { value: string } }) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  disabled: boolean;
  placeholder: string;
}

export default function MessageInput({
  input,
  onInputChange,
  onSubmit,
  disabled,
  placeholder,
}: MessageInputProps) {
  const [attachments, setAttachments] = useState<string[]>([]);

  const handleAttach = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const uris = result.assets.map((a) => a.uri);
        setAttachments((prev) => [...prev, ...uris]);
      }
    } catch (err) {
      console.error("Document picker error:", err);
    }
  };

  const handleFormSubmit = (e: any) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;
    Keyboard.dismiss();
    onSubmit(e);
    setAttachments([]);
  };

  return (
    <View style={styles.container}>
      {attachments.length > 0 && (
        <View style={styles.attachmentsRow}>
          {attachments.map((uri, i) => (
            <View key={i} style={styles.attachmentChip}>
              <Text style={styles.attachmentText} numberOfLines={1}>
                {uri.split("/").pop()}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.row}>
        <TouchableOpacity
          onPress={handleAttach}
          style={styles.attachButton}
          disabled={disabled}
        >
          <Text style={styles.attachIcon}>+</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={input}
          onChangeText={(text) => onInputChange({ target: { value: text } } as any)}
          placeholder={placeholder}
          placeholderTextColor="#666666"
          editable={!disabled}
          multiline
          maxLength={10000}
        />

        <TouchableOpacity
          onPress={handleFormSubmit as any}
          style={[styles.sendButton, disabled && styles.sendButtonDisabled]}
          disabled={disabled || (!input.trim() && attachments.length === 0)}
        >
          <Text style={styles.sendIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
    backgroundColor: "#0a0a0a",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 16,
  },
  attachmentsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  attachmentChip: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  attachmentText: {
    color: "#cccccc",
    fontSize: 12,
    maxWidth: 120,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
  },
  attachIcon: {
    color: "#888888",
    fontSize: 22,
    fontWeight: "300",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: "#111111",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "#ffffff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  sendIcon: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
  },
});
