"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getPublicEnv, hasSupabaseEnv } from "@/lib/env";

export function createSupabaseBrowserClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const env = getPublicEnv();

  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
