import type { SparkReactionName } from "@/lib/types";

export const defaultSparkReactions: Array<{
  name: SparkReactionName;
  glyph: string;
  label: string;
}> = [
  { name: "heart", glyph: "❤️", label: "Heart" },
  { name: "fire", glyph: "🔥", label: "Fire" },
  { name: "locked_in", glyph: "🔒", label: "Locked in" },
  { name: "want_this", glyph: "✨", label: "Want this" },
  { name: "watching", glyph: "👀", label: "Watching" },
];

export const sparkReactionPickerEmojis = [
  "❤️",
  "🔥",
  "👏",
  "😂",
  "😮",
  "👀",
  "💯",
  "✅",
  "🚀",
  "🎉",
  "🤝",
  "😍",
  "🙌",
  "⚡",
  "🌊",
  "🧠",
] as const;

const defaultReactionMap = new Map(defaultSparkReactions.map((reaction) => [reaction.name, reaction]));
const emojiSignal = /\p{Extended_Pictographic}/u;

export function isRenderableSparkReaction(reaction: string | null | undefined) {
  if (!reaction) {
    return false;
  }

  const value = reaction.trim();
  if (!value || value.length > 12) {
    return false;
  }

  return defaultReactionMap.has(value) || emojiSignal.test(value);
}

export function normalizeSparkReaction(reaction: string | null | undefined) {
  const value = reaction?.trim() ?? "";
  return isRenderableSparkReaction(value) ? value : null;
}

export function getSparkReactionDisplay(reaction: string) {
  const match = defaultReactionMap.get(reaction);
  if (match) {
    return match;
  }

  return {
    name: reaction,
    glyph: reaction,
    label: reaction,
  };
}
