import type { Metadata } from "next";

import { OnboardingScreen } from "@/components/onboarding-screen";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Choose what you want to follow first, save your discovery preferences, and open the Commitment Board.",
};

export default function OnboardingPage() {
  return <OnboardingScreen />;
}
