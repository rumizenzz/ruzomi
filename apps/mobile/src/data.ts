export type MobileTab = "terminal" | "vault" | "hrs" | "social" | "proof";

export const categories = [
  "Fitness",
  "Work",
  "Learning",
  "Home",
  "Finance",
  "Social",
  "Health",
  "Enterprise",
] as const;

export const featuredMarkets = [
  {
    id: "run-5k",
    category: "Fitness",
    title: "Run 5K Before Sunrise",
    proof: "GPS + biometric check",
    activity: "$50 pulse verified",
    delta: "+$10",
    bars: [20, 26, 32, 44, 40, 56, 64, 78],
  },
  {
    id: "ship-feature",
    category: "Work",
    title: "Ship Feature by Friday",
    proof: "deploy tag + repo link",
    activity: "$100 staked",
    delta: "+$50",
    bars: [18, 18, 24, 30, 52, 58, 66, 72],
  },
  {
    id: "zero-sugar",
    category: "Health",
    title: "Zero Sugar Days",
    proof: "meal log + receipt proof",
    activity: "$10 pulse verified",
    delta: "+$10",
    bars: [44, 40, 34, 30, 26, 38, 42, 55],
  },
  {
    id: "deep-work",
    category: "Work",
    title: "Deep Work: 4 Hours",
    proof: "focus timer + screen log",
    activity: "$100 stake in motion",
    delta: "+$100",
    bars: [16, 24, 34, 38, 46, 44, 61, 74],
  },
  {
    id: "read-100",
    category: "Learning",
    title: "Read 100 Pages This Week",
    proof: "reading tracker + photo",
    activity: "$30 pulse verified",
    delta: "+$30",
    bars: [24, 28, 24, 32, 36, 48, 55, 68],
  },
] as const;

export const integrityFeed = [
  {
    id: "airzahoh",
    name: "Airzahoh.",
    note: "Verified user",
    region: "Global pulse active",
  },
  {
    id: "maramanner",
    name: "Maramanner.",
    note: "Verified user",
    region: "Hardware-signed streak",
  },
  {
    id: "clean-hanks",
    name: "Clean Hanks.",
    note: "Verified user",
    region: "Home market complete",
  },
] as const;

export const activityRail = [
  {
    id: "pulse-1",
    title: "$100 Stake in 'Ship Feature'",
    age: "2s ago",
    bars: [24, 30, 28, 38, 44, 46, 52, 68],
  },
  {
    id: "pulse-2",
    title: "$50 Stake in 'Deep Work'",
    age: "11s ago",
    bars: [18, 20, 22, 34, 36, 42, 58, 64],
  },
  {
    id: "pulse-3",
    title: "$10 Pulse in 'Zero Sugar'",
    age: "24s ago",
    bars: [22, 26, 20, 34, 32, 39, 47, 58],
  },
] as const;

export const referralChecklist = [
  { id: "signup", label: "Sign up", completed: true },
  { id: "fund", label: "Fund wallet", completed: true },
  { id: "stake", label: "Stake first market", completed: false },
  { id: "proof", label: "Submit STP proof", completed: false },
] as const;

export const syncedContacts = [
  { id: "1", name: "Mina C", status: "Already on PayToCommit", payout: "$1,280 lifetime" },
  { id: "2", name: "Sarah K", status: "Already on PayToCommit", payout: "$3,420 lifetime" },
  { id: "3", name: "Jordan T", status: "Invite ready", payout: "Earn $10 when they finish" },
] as const;

export const hrsGraph = [
  { label: "Start", value: 0.18 },
  { label: "Month 1", value: 0.32 },
  { label: "Month 2", value: 0.44 },
  { label: "Month 3", value: 0.52 },
  { label: "Month 4", value: 0.67 },
  { label: "Month 5", value: 0.74 },
  { label: "Now", value: 0.82 },
] as const;
