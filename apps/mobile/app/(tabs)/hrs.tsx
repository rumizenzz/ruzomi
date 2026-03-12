import { ScrollView, StyleSheet, Text, View } from "react-native";

import { GlassCard, MobileScreen } from "@/components/mobile-surface";
import { colors } from "@/lib/theme";

export default function HrsScreen() {
  return (
    <MobileScreen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <GlassCard eyebrow="HRS" title="Human Reliability Score">
          <Text style={styles.score}>785</Text>
          <Text style={styles.copy}>
            Your record builds from verified follow-through over time. Consent can make that record usable for approved
            opportunities. It does not inflate the score by itself.
          </Text>
        </GlassCard>

        <GlassCard eyebrow="Enterprise access" title="Protected legal-name scope">
          <View style={styles.stack}>
            <Text style={styles.item}>No open people search</Text>
            <Text style={styles.item}>Legal-name-backed matching only with explicit consent</Text>
            <Text style={styles.item}>Usage-based billing and auditable requests</Text>
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
  score: {
    color: colors.mint,
    fontSize: 52,
    fontWeight: "800",
    marginBottom: 10,
  },
  copy: {
    color: colors.textMuted,
    lineHeight: 22,
  },
  stack: {
    gap: 12,
  },
  item: {
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.panelStrong,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
