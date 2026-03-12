import Stripe from "stripe";

import { getServerEnv, hasStripeServerEnv } from "@/lib/env";

let cachedStripeClient: Stripe | null | undefined;

export function getStripeClient() {
  if (!hasStripeServerEnv()) {
    return null;
  }

  if (cachedStripeClient) {
    return cachedStripeClient;
  }

  const env = getServerEnv();
  cachedStripeClient = new Stripe(env.stripeSecretKey, {
    apiVersion: "2026-02-25.clover",
  });

  return cachedStripeClient;
}
