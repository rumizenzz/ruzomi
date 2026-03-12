import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getPublicEnv, hasSupabaseEnv } from "@/lib/env";

let cachedClient: SupabaseClient | null | undefined;

export function createSupabaseReadClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  if (cachedClient) {
    return cachedClient;
  }

  const publicEnv = getPublicEnv();

  cachedClient = createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}
