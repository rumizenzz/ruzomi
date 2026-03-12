import { ScrollView, StyleSheet, Text, View } from "react-native";

import { GlassCard, MobileScreen } from "@/components/mobile-surface";
import { ruzomiFeed } from "@/lib/mobile-data";
import { colors } from "@/lib/theme";

export default function SocialScreen() {
  return (
    <MobileScreen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <GlassCard eyebrow="Ruzomi" title="Spark feed">
          <View style={styles.feed}>
            {ruzomiFeed.map((item) => (
              <View key={item.id} style={styles.post}>
                <Text style={styles.badge}>{item.badge}</Text>
                <Text style={styles.author}>
                  {item.author} <Text style={styles.handle}>{item.handle}</Text>
                </Text>
                <Text style={styles.body}>{item.body}</Text>
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
  feed: {
    gap: 12,
  },
  post: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: colors.panelStrong,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  badge: {
    color: colors.cyan,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  author: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  handle: {
    color: colors.textMuted,
    fontWeight: "500",
  },
  body: {
    color: colors.textMuted,
    lineHeight: 21,
  },
});
