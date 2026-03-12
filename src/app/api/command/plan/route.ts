import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { getGalactusLockedPayload } from "@/lib/galactus-access";
import { getGenerationEligibilityStateForSession } from "@/lib/paytocommit-data";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";
import type { MarketDraftConversation, MarketQuestion, MarketQuestionOption } from "@/lib/types";

function inferDurationOptions(prompt: string): MarketQuestionOption[] {
  const normalized = prompt.toLowerCase();
  const recommended =
    normalized.includes("60") || normalized.includes("two month") || normalized.includes("8 week")
      ? "60_days"
      : normalized.includes("14") || normalized.includes("2 week")
        ? "14_days"
        : "30_days";

  return [
    {
      id: "14_days",
      label: "14 days",
      description: "Good for short resets and quick proof cycles.",
      recommended: recommended === "14_days",
    },
    {
      id: "30_days",
      label: "30 days",
      description: "Best for habit markets that need repeat proof.",
      recommended: recommended === "30_days",
    },
    {
      id: "60_days",
      label: "60 days",
      description: "Best for heavier goals that need a longer runway.",
      recommended: recommended === "60_days",
    },
  ];
}

function inferCadenceOptions(prompt: string): MarketQuestionOption[] {
  const normalized = prompt.toLowerCase();
  const recommended =
    normalized.includes("weekday") || normalized.includes("workday")
      ? "weekdays"
      : normalized.includes("every")
        ? "daily"
        : "custom";

  return [
    {
      id: "daily",
      label: "Daily",
      description: "Use the same check-in every day.",
      recommended: recommended === "daily",
    },
    {
      id: "weekdays",
      label: "Weekdays",
      description: "Skip weekends and keep the workweek cadence.",
      recommended: recommended === "weekdays",
    },
    {
      id: "custom",
      label: "Custom cadence",
      description: "Define the exact schedule in your own words.",
      recommended: recommended === "custom",
    },
  ];
}

function inferProofOptions(prompt: string): MarketQuestionOption[] {
  const normalized = prompt.toLowerCase();

  if (/(run|walk|steps|weight|fitness|gym|sleep)/.test(normalized)) {
    return [
      {
        id: "health_sync",
        label: "Health data",
        description: "Use device or app data plus a final check-in.",
        recommended: true,
      },
      {
        id: "video",
        label: "Video proof",
        description: "Use a short video or live capture window.",
      },
      {
        id: "photo",
        label: "Photo proof",
        description: "Use a timestamped image or artifact upload.",
      },
    ];
  }

  if (/(write|read|ship|publish|study|build|code|feature)/.test(normalized)) {
    return [
      {
        id: "artifact",
        label: "Artifact upload",
        description: "Use a screenshot, export, or completed file.",
        recommended: true,
      },
      {
        id: "photo",
        label: "Photo proof",
        description: "Use a timestamped image or completed task photo.",
      },
      {
        id: "video",
        label: "Video proof",
        description: "Use a short walkthrough or final-state video.",
      },
    ];
  }

  return [
    {
      id: "photo",
      label: "Photo proof",
      description: "Use a timestamped image or visible artifact.",
      recommended: true,
    },
    {
      id: "video",
      label: "Video proof",
      description: "Use a short video or live capture window.",
    },
    {
      id: "artifact",
      label: "Artifact upload",
      description: "Use a screenshot, export, or completed file.",
    },
  ];
}

function buildPlan(prompt: string): MarketDraftConversation {
  const questions: MarketQuestion[] = [
    {
      id: randomUUID(),
      prompt: "How long should this market stay open?",
      status: "awaiting_response",
      options: inferDurationOptions(prompt),
    },
    {
      id: randomUUID(),
      prompt: "How often should participants prove progress?",
      status: "awaiting_response",
      options: inferCadenceOptions(prompt),
    },
    {
      id: randomUUID(),
      prompt: "Which proof mode should carry the result?",
      status: "awaiting_response",
      options: inferProofOptions(prompt),
    },
  ];

  return {
    id: randomUUID(),
    prompt,
    status: "planning",
    messages: [
      {
        id: randomUUID(),
        role: "assistant",
        body: "I can draft this market. Answer a few questions and I’ll lock the schedule, proof mode, and result timing before you open it.",
      },
    ],
    plan: {
      summary: `Drafting a commitment market for "${prompt}".`,
      questions,
      implementationSteps: [
        "Lock the run length and join window.",
        "Choose the proof mode that can settle the result cleanly.",
        "Set result timing and open the market when you are ready.",
      ],
    },
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as { prompt?: string };
  const prompt = body.prompt?.trim();

  if (!prompt) {
    return NextResponse.json({ error: "prompt is required." }, { status: 400 });
  }

  const viewer = await getAuthenticatedSupabaseUser();
  const sessionToken = viewer ? toAuthenticatedAppSessionToken(viewer.id) : null;
  const generationEligibilityState = await getGenerationEligibilityStateForSession(sessionToken);

  if (generationEligibilityState.eligibility !== "unlocked") {
    const locked = getGalactusLockedPayload(generationEligibilityState, "generate", "/app?mode=generate");
    return NextResponse.json(
      {
        ...locked.payload,
        generationEligibility: generationEligibilityState.eligibility,
        generationEligibilityState,
      },
      { status: locked.status },
    );
  }

  return NextResponse.json({
    conversation: buildPlan(prompt),
    generationEligibility: generationEligibilityState.eligibility,
  });
}
