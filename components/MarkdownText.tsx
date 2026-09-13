import { Text, StyleSheet, TextProps } from "react-native";

interface MarkdownTextProps extends TextProps {
  content: string;
}

export default function MarkdownText({ content, style, ...rest }: MarkdownTextProps) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    if (line.startsWith("# ")) {
      elements.push(
        <Text key={index} style={styles.h1}>{line.slice(2)}</Text>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <Text key={index} style={styles.h2}>{line.slice(3)}</Text>
      );
    } else if (line.startsWith("- ")) {
      elements.push(
        <Text key={index} style={styles.bullet}>• {line.slice(2)}</Text>
      );
    } else if (line.trim().length > 0) {
      elements.push(
        <Text key={index} style={[styles.p, style]}>
          {line}
        </Text>
      );
    } else {
      elements.push(<Text key={index} style={styles.spacer} />);
    }
  });

  return <>{elements}</>;
}

const styles = StyleSheet.create({
  h1: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 4,
  },
  h2: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 4,
  },
  p: {
    color: "#e0e0e0",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  bullet: {
    color: "#e0e0e0",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
    paddingLeft: 12,
  },
  spacer: {
    height: 8,
  },
});
