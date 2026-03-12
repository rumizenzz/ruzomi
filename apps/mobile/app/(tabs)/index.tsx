import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { GlassCard, MobileScreen } from "@/components/mobile-surface";
import { categories, featuredMarkets } from "@/lib/mobile-data";
import { colors } from "@/lib/theme";

export default function TerminalScreen() {
  const [activeCategory, setActiveCategory] = useState("Fitness");
  const [focusIndex, setFocusIndex] = useState(0);

  const filteredMarkets = useMemo(() => {
    const matching = featuredMarkets.filter((market) => market.category === activeCategory);
    return matching.length ? matching : featuredMarkets;
  }, [activeCategory]);

  const focusMarket = filteredMarkets[focusIndex % filteredMarkets.length] ?? featuredMarkets[0];

  return (
    <MobileScreen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.brand}>PayToCommit</Text>
          <Text style={styles.subhead}>Commitment Board</Text>
        </View>

        <GlassCard>
          <Text style={styles.commandTitle}>Commit on anything</Text>
          <View style={styles.commandWaveTrack}>
            <LinearGradient colors={[colors.cyanStrong, colors.violet, colors.mint]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.commandWave} />
          </View>
          <View style={styles.modeRow}>
            <View style={[styles.modeChip, styles.modeChipActive]}>
              <Text style={styles.modeChipActiveText}>Search</Text>
            </View>
            <View style={styles.modeChip}>
              <Text style={styles.modeChipText}>Generate unlocks after your first verified close</Text>
            </View>
          </View>
        </GlassCard>

        <ScrollView contentContainerStyle={styles.categoryRow} horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <Pressable key={category} onPress={() => setActiveCategory(category)} style={[styles.categoryChip, activeCategory === category && styles.categoryChipActive]}>
              <Text style={[styles.categoryChipText, activeCategory === category && styles.categoryChipTextActive]}>{category}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <GlassCard eyebrow={`${focusIndex + 1}/${filteredMarkets.length} in focus`} title={focusMarket.title}>
          <Text style={styles.marketMeta}>{focusMarket.category}</Text>
          <Text style={styles.marketProof}>{focusMarket.proof}</Text>
          <View style={styles.sparklineRow}>
            {focusMarket.trend.map((point, index) => (
              <View key={`${focusMarket.id}-${index}`} style={[styles.sparklineBar, { height: 20 + point }]} />
            ))}
          </View>
          <View style={styles.pulseRow}>
            <Text style={styles.pulseText}>Integrity pulse {focusMarket.pulse}</Text>
            <Pressable onPress={() => setFocusIndex((current) => (current + 1) % filteredMarkets.length)} style={styles.focusButton}>
              <Text style={styles.focusButtonText}>Next market</Text>
            </Pressable>
          </View>
        </GlassCard>

        <View style={styles.cardGrid}>
          {featuredMarkets.slice(0, 4).map((market, index) => (
            <Pressable key={market.id} onPress={() => setFocusIndex(index)} style={styles.gridCard}>
              <Text style={styles.gridCategory}>{market.category}</Text>
              <Text style={styles.gridTitle}>{market.title}</Text>
              <View style={styles.gridSparkline}>
                {market.trend.map((point, pointIndex) => (
                  <View key={`${market.id}-mini-${pointIndex}`} style={[styles.gridSparklineBar, { height: 10 + point / 2 }]} />
                ))}
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    gap: 16,
  },
  header: {
    gap: 4,
    paddingTop: 12,
  },
  brand: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "800",
  },
  subhead: {
    color: colors.textMuted,
    fontSize: 16,
  },
  commandTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 14,
  },
  commandWaveTrack: {
    height: 14,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(23, 36, 57, 0.7)",
    marginBottom: 14,
  },
  commandWave: {
    width: "100%",
    height: "100%",
  },
  modeRow: {
    gap: 10,
  },
  modeChip: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(10, 22, 35, 0.82)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeChipActive: {
    backgroundColor: "rgba(15, 39, 58, 0.95)",
  },
  modeChipText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  modeChipActiveText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  categoryRow: {
    gap: 10,
    paddingRight: 18,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(9, 22, 36, 0.78)",
  },
  categoryChipActive: {
    backgroundColor: "rgba(20, 44, 66, 0.94)",
  },
  categoryChipText: {
    color: colors.textMuted,
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: colors.text,
  },
  marketMeta: {
    color: colors.cyan,
    fontSize: 14,
    marginBottom: 4,
  },
  marketProof: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  sparklineRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 16,
    minHeight: 96,
  },
  sparklineBar: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: colors.cyanStrong,
  },
  pulseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  pulseText: {
    color: colors.mint,
    fontWeight: "700",
  },
  focusButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(19, 42, 60, 0.92)",
  },
  focusButtonText: {
    color: colors.text,
    fontWeight: "700",
  },
  cardGrid: {
    gap: 12,
  },
  gridCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(8, 22, 35, 0.82)",
    padding: 16,
    gap: 10,
  },
  gridCategory: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  gridTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  gridSparkline: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    minHeight: 52,
  },
  gridSparklineBar: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: colors.mint,
  },
});
