import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Contacts from "expo-contacts";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { LinearGradient } from "expo-linear-gradient";

import {
  activityRail,
  categories,
  featuredMarkets,
  hrsGraph,
  integrityFeed,
  referralChecklist,
  syncedContacts,
  type MobileTab,
} from "./src/data";
import { palette, radii } from "./src/theme";

function GlassPanel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <LinearGradient
      colors={["rgba(120,226,255,0.16)", "rgba(17,35,55,0.92)", "rgba(208,156,255,0.14)"]}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={[styles.glassPanel, style]}
    >
      {children}
    </LinearGradient>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function MetricSparkline({ bars }: { bars: readonly number[] }) {
  return (
    <View style={styles.sparklineRow}>
      {bars.map((bar, index) => (
        <View key={`${index}-${bar}`} style={styles.sparklineBarShell}>
          <LinearGradient
            colors={index > bars.length - 3 ? [palette.rose, palette.cyan] : [palette.cyan, "#58ffa6"]}
            start={{ x: 0.2, y: 1 }}
            end={{ x: 0.8, y: 0 }}
            style={[styles.sparklineBar, { height: Math.max(14, bar) }]}
          />
        </View>
      ))}
    </View>
  );
}

function TickCountdown({ expiresInDays }: { expiresInDays: number }) {
  const [seconds, setSeconds] = useState(expiresInDays * 24 * 60 * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((value) => (value > 0 ? value - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / 3600);

  return <Text style={styles.countdownText}>{days}d {hours}h left</Text>;
}

function parseHandoff(url: string | null) {
  if (!url) {
    return null;
  }

  const parsed = Linking.parse(url);
  const handoff = typeof parsed.queryParams?.handoff === "string" ? parsed.queryParams.handoff : null;
  const pool = typeof parsed.queryParams?.pool === "string" ? parsed.queryParams.pool : null;
  const stake =
    typeof parsed.queryParams?.stake === "string" && Number.isFinite(Number(parsed.queryParams.stake))
      ? Number(parsed.queryParams.stake)
      : null;

  if (!handoff || !pool || !stake) {
    return null;
  }

  return {
    handoff,
    pool,
    stakeCents: stake,
  };
}

function MobileApp() {
  const [activeTab, setActiveTab] = useState<MobileTab>("terminal");
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]>("Fitness");
  const [generationUnlocked, setGenerationUnlocked] = useState(false);
  const [contactStatus, setContactStatus] = useState<"unknown" | "granted" | "denied">("unknown");
  const [handoff, setHandoff] = useState<ReturnType<typeof parseHandoff>>(null);
  const glow = useRef(new Animated.Value(0)).current;
  const wave = useRef(new Animated.Value(0)).current;
  const incomingUrl = Linking.useURL();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.timing(wave, {
        toValue: 1,
        duration: 5200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [glow, wave]);

  useEffect(() => {
    const parsed = parseHandoff(incomingUrl);

    if (parsed) {
      setHandoff(parsed);
      setActiveTab("proof");
    }
  }, [incomingUrl]);

  const highlightedMarkets = useMemo(
    () => featuredMarkets.filter((market) => market.category === selectedCategory || selectedCategory === "Fitness").slice(0, 4),
    [selectedCategory],
  );

  const commandGlow = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(98,240,255,0.18)", "rgba(98,240,255,0.42)"],
  });

  async function handleTabChange(tab: MobileTab) {
    setActiveTab(tab);
    await Haptics.selectionAsync();
  }

  async function handleUnlockGenerate() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setGenerationUnlocked(true);
  }

  async function handleContactSync() {
    const permission = await Contacts.requestPermissionsAsync();

    if (permission.status !== "granted") {
      setContactStatus("denied");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setContactStatus("granted");
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  async function handleExternalShare() {
    const tags = (process.env.EXPO_PUBLIC_SHARE_CAMPAIGN_TAGS ?? "#DownloadPayToCommit").trim();
    await Share.share({
      message: `I locked my word on PayToCommit. Hardware-signed proof is mobile-only. ${tags}`.trim(),
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <NativeStatusBar barStyle="light-content" />
      <StatusBar style="light" />
      <LinearGradient
        colors={["#02060f", "#04111e", "#071b2e", "#03101e"]}
        locations={[0, 0.24, 0.76, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View pointerEvents="none" style={styles.backgroundOrbs}>
        <View style={styles.backgroundOrbLeft} />
        <View style={styles.backgroundOrbRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.wordmark}>PayToCommit</Text>
            <Text style={styles.topBarSubtitle}>Sovereign Commitment Terminal</Text>
          </View>
          <View style={styles.headerActions}>
            <GlassPanel style={styles.headerChip}>
              <Text style={styles.headerChipText}>My Portfolio</Text>
            </GlassPanel>
            <GlassPanel style={styles.headerChipPrimary}>
              <Text style={styles.headerChipPrimaryText}>Add Funds</Text>
            </GlassPanel>
          </View>
        </View>

        {handoff ? (
          <GlassPanel style={styles.handoffBanner}>
            <SectionLabel>Desktop handoff locked</SectionLabel>
            <Text style={styles.handoffHeadline}>Your funds are already staked.</Text>
            <Text style={styles.detailText}>
              {handoff.pool.replace(/-/g, " ")} is waiting for mobile-only proof. ${(handoff.stakeCents / 100).toFixed(0)} is locked
              under handoff {handoff.handoff.slice(0, 8)}.
            </Text>
          </GlassPanel>
        ) : null}

        <GlassPanel style={styles.commandShell}>
          <SectionLabel>Commitment Board</SectionLabel>
          <Text style={styles.commandHeadline}>Commit on anything</Text>
          <Animated.View
            style={[
              styles.commandInputShell,
              {
                shadowColor: palette.cyan,
                shadowOpacity: 0.32,
                borderColor: commandGlow,
              },
            ]}
          >
            <TextInput
              placeholder="Search live markets, fractal markets, and fresh opens"
              placeholderTextColor={palette.textMuted}
              style={styles.commandInput}
            />
            <View style={styles.modeStack}>
              <Pressable onPress={() => void Haptics.selectionAsync()} style={[styles.modePill, !generationUnlocked && styles.modePillActive]}>
                <Text style={styles.modePillText}>Search</Text>
              </Pressable>
              <Pressable onPress={handleUnlockGenerate} style={[styles.modePill, generationUnlocked && styles.modePillActive]}>
                <Text style={styles.modePillText}>{generationUnlocked ? "Generate" : "Locked"}</Text>
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.waveLine,
              {
                transform: [
                  {
                    translateX: wave.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-200, 180],
                    }),
                  },
                ],
              },
            ]}
          />

          <View style={styles.commandMetaRow}>
            <SectionLabel>{generationUnlocked ? "Generate unlocked" : "Search is active by default"}</SectionLabel>
            <TickCountdown expiresInDays={29} />
          </View>
        </GlassPanel>

        <ScrollView contentContainerStyle={styles.categoryRail} horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <Pressable
              key={category}
              onPress={() => {
                setSelectedCategory(category);
                void Haptics.selectionAsync();
              }}
              style={[styles.categoryPill, category === selectedCategory && styles.categoryPillActive]}
            >
              <Text style={styles.categoryPillText}>{category}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.mainGrid}>
          <GlassPanel style={styles.leftRail}>
            <SectionLabel>Live Integrity Feed</SectionLabel>
            {integrityFeed.map((item) => (
              <View key={item.id} style={styles.integrityRow}>
                <View style={styles.avatar} />
                <View style={styles.integrityBody}>
                  <Text style={styles.integrityName}>{item.name}</Text>
                  <Text style={styles.integrityMeta}>{item.note}</Text>
                  <Text style={styles.integrityRegion}>{item.region}</Text>
                </View>
                <View style={styles.integrityBadge} />
              </View>
            ))}
          </GlassPanel>

          <View style={styles.centerColumn}>
            {highlightedMarkets.map((market, index) => (
              <GlassPanel key={market.id} style={[styles.marketCard, index === 0 && styles.marketCardFeatured]}>
                <View style={styles.marketCardHeader}>
                  <Text style={styles.marketCategory}>{market.category}</Text>
                  <Text style={styles.marketDelta}>{market.delta}</Text>
                </View>
                <Text style={styles.marketTitle}>{market.title}</Text>
                <Text style={styles.marketProof}>{market.proof}</Text>
                <MetricSparkline bars={market.bars} />
                <View style={styles.marketPulseRow}>
                  <Text style={styles.marketActivity}>{market.activity}</Text>
                  <Text style={styles.marketStakeHint}>Stake hidden until reveal</Text>
                </View>
              </GlassPanel>
            ))}
          </View>

          <GlassPanel style={styles.rightRail}>
            <SectionLabel>Trending / Activity Rail</SectionLabel>
            {activityRail.map((event) => (
              <View key={event.id} style={styles.activityCard}>
                <Text style={styles.activityTitle}>{event.title}</Text>
                <Text style={styles.activityAge}>{event.age}</Text>
                <MetricSparkline bars={event.bars} />
              </View>
            ))}
          </GlassPanel>
        </View>

        {activeTab === "terminal" ? (
          <GlassPanel style={styles.detailPanel}>
            <SectionLabel>Proof stays mobile-only</SectionLabel>
            <Text style={styles.detailHeadline}>Stake on web. Prove on mobile.</Text>
            <Text style={styles.detailText}>
              The app holds proof capture, STP challenge-response, and final submission. Desktop discovery stays open and
              friction-light until a user actually locks the stake.
            </Text>
          </GlassPanel>
        ) : null}

        {activeTab === "vault" ? (
          <GlassPanel style={styles.detailPanel}>
            <SectionLabel>Sovereign Vault</SectionLabel>
            <Text style={styles.detailHeadline}>Choose how you fund and settle.</Text>
            <View style={styles.optionStack}>
              {["Apple Pay", "Google Pay", "Bank Account", "Debit / Credit", "PayPal / Venmo", "Crypto", "Wire"].map((method) => (
                <View key={method} style={styles.optionRow}>
                  <Text style={styles.optionTitle}>{method}</Text>
                  <Text style={styles.optionMeta}>{method === "Wire" ? "$1,000 min · $20 fee" : "Ready when identity is clear"}</Text>
                </View>
              ))}
            </View>
          </GlassPanel>
        ) : null}

        {activeTab === "hrs" ? (
          <GlassPanel style={styles.detailPanel}>
            <SectionLabel>HRS</SectionLabel>
            <Text style={styles.detailHeadline}>Reliability grows from verified follow-through.</Text>
            <Text style={styles.detailText}>
              Consent can expand opportunity access for enterprise lookups, but it does not artificially inflate the score.
              Legal-name matching stays consent-gated and auditable.
            </Text>
            <View style={styles.hrsGraphRow}>
              {hrsGraph.map((point) => (
                <View key={point.label} style={styles.hrsBarShell}>
                  <LinearGradient
                    colors={[palette.cyan, palette.violet]}
                    style={[styles.hrsBar, { height: `${Math.max(18, point.value * 100)}%` }]}
                  />
                  <Text style={styles.hrsLabel}>{point.label}</Text>
                </View>
              ))}
            </View>
          </GlassPanel>
        ) : null}

        {activeTab === "social" ? (
          <GlassPanel style={styles.detailPanel}>
            <SectionLabel>Ruzomi</SectionLabel>
            <Text style={styles.detailHeadline}>Sync contacts and run the referral loop.</Text>
            <Text style={styles.detailText}>
              Contact sync stays opt-in. Friends already on PayToCommit show up first with lifetime payout proof to create
              immediate signal before the invite goes out.
            </Text>
            <Pressable onPress={handleContactSync} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>{contactStatus === "granted" ? "Contacts synced" : "Sync contacts"}</Text>
            </Pressable>
            <View style={styles.referralShell}>
              {referralChecklist.map((step) => (
                <View key={step.id} style={styles.referralRow}>
                  <View style={[styles.referralDot, step.completed && styles.referralDotCompleted]} />
                  <Text style={styles.referralLabel}>{step.label}</Text>
                </View>
              ))}
              <TickCountdown expiresInDays={6} />
            </View>
            <View style={styles.contactList}>
              {syncedContacts.map((contact) => (
                <View key={contact.id} style={styles.contactRow}>
                  <View style={styles.avatarSmall} />
                  <View style={styles.contactCopy}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactMeta}>{contact.status}</Text>
                  </View>
                  <Text style={styles.contactPayout}>{contact.payout}</Text>
                </View>
              ))}
            </View>
          </GlassPanel>
        ) : null}

        {activeTab === "proof" ? (
          <GlassPanel style={styles.detailPanel}>
            <SectionLabel>STP proof</SectionLabel>
            <Text style={styles.detailHeadline}>Capture the proof that unlocks settlement.</Text>
            <Text style={styles.detailText}>
              Depth, vitality, and challenge-response stay native so proof cannot be faked from a desktop session.
            </Text>
            <View style={styles.optionStack}>
              <View style={styles.optionRow}>
                <Text style={styles.optionTitle}>Current queue</Text>
                <Text style={styles.optionMeta}>Run 5K Before Sunrise · ready for capture</Text>
              </View>
              <View style={styles.optionRow}>
                <Text style={styles.optionTitle}>Mode</Text>
                <Text style={styles.optionMeta}>GPS + vitality + challenge prompt</Text>
              </View>
              <View style={styles.optionRow}>
                <Text style={styles.optionTitle}>Desktop state</Text>
                <Text style={styles.optionMeta}>Funds are staked · mobile proof required</Text>
              </View>
            </View>
            <View style={styles.inlineActionRow}>
              <Pressable onPress={() => Alert.alert("STP capture", "Native proof capture is ready for the next production pass.")} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Begin STP proof</Text>
              </Pressable>
              <Pressable onPress={() => void handleExternalShare()} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Share victory intent</Text>
              </Pressable>
            </View>
          </GlassPanel>
        ) : null}
      </ScrollView>

      <View style={styles.bottomBar}>
        {([
          ["terminal", "Terminal"],
          ["vault", "Vault"],
          ["hrs", "HRS"],
          ["social", "Ruzomi"],
          ["proof", "Proof"],
        ] as const).map(([key, label]) => (
          <Pressable key={key} onPress={() => void handleTabChange(key)} style={styles.bottomTab}>
            <Text style={[styles.bottomTabText, activeTab === key && styles.bottomTabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

export default MobileApp;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 112,
    gap: 14,
  },
  backgroundOrbs: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundOrbLeft: {
    position: "absolute",
    top: 60,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(98,240,255,0.12)",
  },
  backgroundOrbRight: {
    position: "absolute",
    top: 220,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: "rgba(208,156,255,0.12)",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
  },
  wordmark: {
    color: palette.text,
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -1.3,
  },
  topBarSubtitle: {
    color: palette.textSoft,
    fontSize: 15,
    marginTop: 4,
  },
  headerActions: {
    gap: 10,
    alignItems: "stretch",
  },
  headerChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerChipPrimary: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderColor: "rgba(98,240,255,0.44)",
  },
  headerChipText: {
    color: palette.textSoft,
    fontSize: 13,
    fontWeight: "700",
  },
  headerChipPrimaryText: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "800",
  },
  glassPanel: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 16,
    shadowColor: palette.shadow,
    shadowOpacity: 0.42,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 16,
    },
    overflow: "hidden",
  },
  sectionLabel: {
    color: palette.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
  },
  commandShell: {
    paddingBottom: 24,
  },
  handoffBanner: {
    gap: 8,
  },
  handoffHeadline: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "800",
  },
  commandHeadline: {
    color: palette.text,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1.2,
    marginBottom: 14,
  },
  commandInputShell: {
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: "rgba(5, 16, 28, 0.68)",
    padding: 14,
    gap: 14,
    shadowRadius: 22,
    shadowOffset: {
      width: 0,
      height: 14,
    },
  },
  commandInput: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "600",
  },
  modeStack: {
    flexDirection: "row",
    gap: 10,
  },
  modePill: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.line,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(8, 21, 35, 0.64)",
  },
  modePillActive: {
    borderColor: palette.lineStrong,
    backgroundColor: "rgba(18, 41, 62, 0.92)",
  },
  modePillText: {
    color: palette.text,
    fontWeight: "700",
  },
  waveLine: {
    marginTop: 14,
    height: 6,
    width: "54%",
    borderRadius: radii.pill,
    backgroundColor: palette.cyan,
    opacity: 0.7,
  },
  commandMetaRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  countdownText: {
    color: palette.text,
    fontWeight: "700",
    fontSize: 14,
  },
  categoryRail: {
    gap: 10,
    paddingRight: 10,
  },
  categoryPill: {
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "rgba(7, 20, 34, 0.82)",
  },
  categoryPillActive: {
    borderColor: palette.lineStrong,
    backgroundColor: "rgba(14, 42, 62, 0.96)",
  },
  categoryPillText: {
    color: palette.text,
    fontWeight: "700",
  },
  mainGrid: {
    gap: 14,
  },
  leftRail: {
    gap: 12,
  },
  centerColumn: {
    gap: 12,
  },
  rightRail: {
    gap: 12,
  },
  integrityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(98,240,255,0.18)",
    borderWidth: 1,
    borderColor: palette.lineStrong,
  },
  integrityBody: {
    flex: 1,
    gap: 2,
  },
  integrityName: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "700",
  },
  integrityMeta: {
    color: palette.textSoft,
    fontSize: 13,
  },
  integrityRegion: {
    color: palette.textMuted,
    fontSize: 12,
  },
  integrityBadge: {
    width: 11,
    height: 11,
    borderRadius: 11,
    backgroundColor: palette.emerald,
  },
  marketCard: {
    gap: 10,
  },
  marketCardFeatured: {
    borderColor: "rgba(98,240,255,0.42)",
  },
  marketCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  marketCategory: {
    color: palette.textMuted,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  marketDelta: {
    color: palette.emerald,
    fontWeight: "800",
    fontSize: 13,
  },
  marketTitle: {
    color: palette.text,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "800",
  },
  marketProof: {
    color: palette.textSoft,
    fontSize: 14,
  },
  marketPulseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  marketActivity: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "700",
  },
  marketStakeHint: {
    color: palette.textMuted,
    fontSize: 12,
  },
  sparklineRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    minHeight: 84,
    paddingTop: 8,
  },
  sparklineBarShell: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sparklineBar: {
    width: "100%",
    borderRadius: 999,
    minHeight: 16,
  },
  activityCard: {
    gap: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(120,226,255,0.1)",
  },
  activityTitle: {
    color: palette.text,
    fontWeight: "700",
    fontSize: 14,
  },
  activityAge: {
    color: palette.textMuted,
    fontSize: 12,
  },
  detailPanel: {
    gap: 12,
    marginBottom: 10,
  },
  detailHeadline: {
    color: palette.text,
    fontWeight: "800",
    fontSize: 24,
    lineHeight: 29,
  },
  detailText: {
    color: palette.textSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  optionStack: {
    gap: 10,
  },
  optionRow: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "rgba(8, 20, 34, 0.64)",
    padding: 14,
    gap: 6,
  },
  optionTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "800",
  },
  optionMeta: {
    color: palette.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  hrsGraphRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    minHeight: 180,
    paddingTop: 16,
  },
  hrsBarShell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    minHeight: 180,
    gap: 8,
  },
  hrsBar: {
    width: "100%",
    borderRadius: radii.sm,
    minHeight: 22,
  },
  hrsLabel: {
    color: palette.textMuted,
    fontSize: 11,
  },
  primaryButton: {
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "rgba(19, 201, 240, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(98,240,255,0.42)",
  },
  primaryButtonText: {
    color: palette.text,
    fontWeight: "800",
    fontSize: 15,
  },
  secondaryButton: {
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "rgba(13, 28, 46, 0.76)",
    borderWidth: 1,
    borderColor: palette.line,
    flex: 1,
  },
  secondaryButtonText: {
    color: palette.textSoft,
    fontWeight: "700",
  },
  referralShell: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "rgba(8, 20, 34, 0.64)",
    padding: 14,
    gap: 10,
  },
  referralRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  referralDot: {
    width: 12,
    height: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.lineStrong,
    backgroundColor: "transparent",
  },
  referralDotCompleted: {
    backgroundColor: palette.emerald,
    borderColor: palette.emerald,
  },
  referralLabel: {
    color: palette.text,
    fontWeight: "700",
  },
  contactList: {
    gap: 10,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(208,156,255,0.18)",
    borderWidth: 1,
    borderColor: palette.lineStrong,
  },
  contactCopy: {
    flex: 1,
  },
  contactName: {
    color: palette.text,
    fontWeight: "700",
  },
  contactMeta: {
    color: palette.textMuted,
    fontSize: 12,
  },
  contactPayout: {
    color: palette.emerald,
    fontWeight: "700",
    fontSize: 12,
    maxWidth: 110,
    textAlign: "right",
  },
  inlineActionRow: {
    flexDirection: "row",
    gap: 10,
  },
  bottomBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.lineStrong,
    backgroundColor: "rgba(8, 18, 29, 0.94)",
    flexDirection: "row",
    padding: 8,
    gap: 6,
  },
  bottomTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  bottomTabText: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  bottomTabTextActive: {
    color: palette.text,
  },
});
