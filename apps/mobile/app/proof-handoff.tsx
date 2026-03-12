import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { GlassCard, MobileScreen } from "@/components/mobile-surface";
import { colors } from "@/lib/theme";

export default function ProofHandoffScreen() {
  const params = useLocalSearchParams<{ pool?: string; stake?: string }>();

  return (
    <MobileScreen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <GlassCard eyebrow="Proof handoff" title="Your stake is already locked">
          <Text style={styles.copy}>
            {params.pool ? `${params.pool} is live on your account.` : "The selected commitment is live on your account."}
          </Text>
          <Text style={styles.copy}>
            Final proof capture stays mobile-only. STP-sensitive submission runs here with depth, vitality, and
            challenge-response when the market requires it.
          </Text>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Stake</Text>
            <Text style={styles.metricValue}>{params.stake ? `$${params.stake}` : "Ready"}</Text>
          </View>
        </GlassCard>
      </ScrollView>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    gap: 16,
  },
  copy: {
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 10,
  },
  metric: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: colors.panelStrong,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricLabel: {
    color: colors.textMuted,
    marginBottom: 4,
  },
  metricValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
});
