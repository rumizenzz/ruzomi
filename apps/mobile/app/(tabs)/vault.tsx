import { ScrollView, StyleSheet, Text, View } from "react-native";

import { GlassCard, MobileScreen } from "@/components/mobile-surface";
import { vaultMethods } from "@/lib/mobile-data";
import { colors } from "@/lib/theme";

export default function VaultScreen() {
  return (
    <MobileScreen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <GlassCard eyebrow="Sovereign vault" title="Available balance $1,000.00">
          <Text style={styles.copy}>Funding, payout routing, and settlement stay here. Identity starts only when you fund or place a live stake.</Text>
        </GlassCard>

        <GlassCard eyebrow="Choose method" title="Deposit or withdraw">
          <View style={styles.methodList}>
            {vaultMethods.map((method) => (
              <View key={method} style={styles.methodCard}>
                <Text style={styles.methodTitle}>{method}</Text>
              </View>
            ))}
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
  },
  methodList: {
    gap: 10,
  },
  methodCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: colors.panelStrong,
    borderWidth: 1,
    borderColor: colors.border,
  },
  methodTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
});
