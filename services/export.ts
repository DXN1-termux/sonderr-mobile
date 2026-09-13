import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";

export type ExportFormat = "markdown" | "json" | "txt" | "pdf";

export interface ExportOptions {
  filename?: string;
  format: ExportFormat;
  content: string;
  metadata?: Record<string, unknown>;
}

export async function exportFile({ filename, format, content, metadata }: ExportOptions) {
  const baseName = filename || `sonderr-export-${Date.now()}`;
  const fileUri = `${FileSystem.documentDirectory}${baseName}.${format}`;

  let body = content;
  if (format === "json" && metadata) {
    body = JSON.stringify({ content, metadata, exportedAt: new Date().toISOString() }, null, 2);
  }

  await FileSystem.writeAsStringAsync(fileUri, body, { encoding: FileSystem.EncodingType.UTF8 });

  if (await Sharing.isAvailableAsync()) {
    const mimeType =
      format === "markdown" ? "text/markdown" :
      format === "json" ? "application/json" :
      format === "pdf" ? "application/pdf" :
      "text/plain";

    await Sharing.shareAsync(fileUri, {
      mimeType,
      dialogTitle: `Export as ${format.toUpperCase()}`,
    });
  }

  return fileUri;
}

export async function pickDocument() {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["text/plain", "text/markdown", "application/json", "application/pdf"],
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) return null;

    const asset = result.assets[0];
    const content = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return {
      uri: asset.uri,
      name: asset.name,
      size: asset.size ?? 0,
      mimeType: asset.mimeType ?? "application/octet-stream",
      content,
    };
  } catch (err) {
    console.error("Document pick error:", err);
    return null;
  }
}
