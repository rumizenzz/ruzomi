import type { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import { colors, shadows } from "@/lib/theme";

export function MobileScreen({ children }: PropsWithChildren) {
  return (
    <LinearGradient colors={[colors.bgDeep, colors.bg]} locations={[0, 1]} style={styles.screen}>
      <View pointerEvents="none" style={styles.aurora} />
      {children}
    </LinearGradient>
  );
}

export function GlassCard({
  title,
  eyebrow,
  children,
}: PropsWithChildren<{ title?: string; eyebrow?: string }>) {
  return (
    <BlurView intensity={26} style={styles.card}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  aurora: {
    position: "absolute",
    top: -120,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: "rgba(86, 227, 255, 0.16)",
    transform: [{ scaleX: 1.2 }],
  },
  card: {
    overflow: "hidden",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
    ...shadows.glow,
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
});
