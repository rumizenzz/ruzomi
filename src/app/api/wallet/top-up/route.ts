import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getPublicEnv } from "@/lib/env";
import { CARD_TOP_UP_FEE_RATE } from "@/lib/paytocommit-data";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";
import { getStripeClient } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();

  if (!stripe) {
    return NextResponse.json({ error: "Stripe server configuration is missing." }, { status: 503 });
  }

  const viewer = await getAuthenticatedSupabaseUser();
  if (!viewer) {
    return NextResponse.json({ error: "Log in or sign up to add funds." }, { status: 401 });
  }

  const sessionToken = toAuthenticatedAppSessionToken(viewer.id);

  const body = (await request.json()) as {
    amountCents?: number;
    method?:
      | "apple_pay"
      | "google_pay"
      | "bank_account"
      | "debit_card"
      | "paypal_venmo"
      | "crypto_zenhash"
      | "wire_transfer";
    returnTo?: string | null;
    poolSlug?: string | null;
    poolTitle?: string | null;
    desiredStakeCents?: number | null;
  };
  const amountCents = Math.max(body.amountCents ?? 0, 1000);
  const feeCents = Math.round(amountCents * CARD_TOP_UP_FEE_RATE);
  const env = getPublicEnv();
  const safeReturnTo = body.returnTo && body.returnTo.startsWith("/") ? body.returnTo : "/app/wallet";
  const successUrl = new URL(`${env.appUrl}/app/wallet`);
  successUrl.searchParams.set("funding", "success");
  if (safeReturnTo) successUrl.searchParams.set("returnTo", safeReturnTo);
  if (body.poolSlug) successUrl.searchParams.set("poolSlug", body.poolSlug);
  if (body.poolTitle) successUrl.searchParams.set("poolTitle", body.poolTitle);
  if (body.desiredStakeCents) successUrl.searchParams.set("stakeDollars", String(Math.round(body.desiredStakeCents / 100)));

  const cancelUrl = new URL(`${env.appUrl}/app/wallet`);
  cancelUrl.searchParams.set("funding", "cancelled");
  if (safeReturnTo) cancelUrl.searchParams.set("returnTo", safeReturnTo);
  if (body.poolSlug) cancelUrl.searchParams.set("poolSlug", body.poolSlug);
  if (body.poolTitle) cancelUrl.searchParams.set("poolTitle", body.poolTitle);
  if (body.desiredStakeCents) cancelUrl.searchParams.set("stakeDollars", String(Math.round(body.desiredStakeCents / 100)));

  if (body.method === "wire_transfer") {
    return NextResponse.json(
      {
        error:
          "ACH / wire setup is reviewed first. Use card or wallet funding here, or request wire instructions from the funding screen.",
      },
      { status: 400 },
    );
  }

  if (body.method === "crypto_zenhash") {
    return NextResponse.json(
      {
        error:
          "Crypto funding review is staged next. Use card, Apple Pay, Google Pay, or bank funding here while the Zenhash deposit flow is finalized.",
      },
      { status: 400 },
    );
  }

  if (body.method === "paypal_venmo") {
    return NextResponse.json(
      {
        error:
          "PayPal / Venmo funding is being staged next. Use card, Apple Pay, Google Pay, or bank funding here right now.",
      },
      { status: 400 },
    );
  }

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
      metadata: {
        session_token: sessionToken,
        top_up_amount_cents: String(amountCents),
        top_up_fee_cents: String(feeCents),
        funding_method: body.method ?? "debit_card",
        return_to: safeReturnTo,
        pool_slug: body.poolSlug ?? "",
        pool_title: body.poolTitle ?? "",
        desired_stake_cents: body.desiredStakeCents ? String(body.desiredStakeCents) : "",
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: "PayToCommit wallet top-up",
              description: "Wallet cash for live tickets and Chains.",
            },
          },
        },
      ],
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create top-up session." },
      { status: 400 },
    );
  }
}
