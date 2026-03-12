type PublicEnv = {
  appUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  stripePublishableKey: string;
};

declare global {
  interface Window {
    __PAYTOCOMMIT_PUBLIC_ENV__?: Partial<PublicEnv>;
  }
}

function readServerPublicEnv(): PublicEnv {
  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "http://127.0.0.1:3000",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? "",
    stripePublishableKey:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? process.env.STRIPE_PUBLISHABLE_KEY ?? "",
  };
}

const serverEnv = {
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFrom: process.env.RESEND_FROM ?? "no-reply@paytocommit.com",
  supportInbox: process.env.SUPPORT_INBOX ?? "support@paytocommit.com",
  billingInbox: process.env.BILLING_INBOX ?? "billing@paytocommit.com",
  tenorApiKey: process.env.TENOR_API_KEY ?? process.env.TENOR_KEY ?? "",
  tenorClientKey: process.env.TENOR_CLIENT_KEY ?? "paytocommit-web",
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  openAiBaseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
  openAiModel: process.env.OPENAI_MODEL ?? "gpt-5.4",
  openAiModelSnapshot: process.env.OPENAI_MODEL_SNAPSHOT ?? "",
  openAiReasoningEffort: process.env.OPENAI_REASONING_EFFORT ?? "medium",
  openAiMaxOutputTokens: Number(process.env.OPENAI_MAX_OUTPUT_TOKENS ?? "1600"),
  twelveLabsApiKey: process.env.TWELVE_LABS_API_KEY ?? "",
  twelveLabsBaseUrl: process.env.TWELVE_LABS_BASE_URL ?? "https://api.twelvelabs.io/v1.3",
  twelveLabsIndexName: process.env.TWELVE_LABS_INDEX_NAME ?? "paytocommit-proof-runtime",
};

export function hasSupabaseEnv() {
  const publicEnv = getPublicEnv();
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
}

export function hasSupabaseAdminEnv() {
  const publicEnv = getPublicEnv();
  return Boolean(publicEnv.supabaseUrl && serverEnv.supabaseServiceRoleKey);
}

export function hasStripeServerEnv() {
  return Boolean(serverEnv.stripeSecretKey);
}

export function hasOpenAiServerEnv() {
  return Boolean(serverEnv.openAiApiKey);
}

export function hasTwelveLabsServerEnv() {
  return Boolean(serverEnv.twelveLabsApiKey);
}

export function hasTenorServerEnv() {
  return Boolean(serverEnv.tenorApiKey);
}

export function getPublicEnv() {
  const serverPublicEnv = readServerPublicEnv();

  if (typeof window === "undefined") {
    return serverPublicEnv;
  }

  const runtimePublicEnv = window.__PAYTOCOMMIT_PUBLIC_ENV__ ?? {};

  return {
    appUrl: runtimePublicEnv.appUrl ?? serverPublicEnv.appUrl,
    supabaseUrl: runtimePublicEnv.supabaseUrl ?? serverPublicEnv.supabaseUrl,
    supabaseAnonKey: runtimePublicEnv.supabaseAnonKey ?? serverPublicEnv.supabaseAnonKey,
    stripePublishableKey:
      runtimePublicEnv.stripePublishableKey ?? serverPublicEnv.stripePublishableKey,
  };
}

export function getServerEnv() {
  return serverEnv;
}
