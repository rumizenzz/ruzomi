import type { IdentityStatus } from "@/lib/types";

export function buildAuthHref(
  mode: "login" | "signup",
  nextPath?: string | null,
  extras?: Record<string, string | null | undefined>,
) {
  const params = new URLSearchParams();

  if (nextPath && nextPath.startsWith("/")) {
    params.set("next", nextPath);
  }

  for (const [key, value] of Object.entries(extras ?? {})) {
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `/${mode}?${query}` : `/${mode}`;
}

export function buildFundingHref(options: {
  isAuthenticated: boolean;
  identityStatus?: IdentityStatus | null;
}) {
  if (!options.isAuthenticated) {
    return buildAuthHref("signup", "/app/wallet/fund");
  }

  if (options.identityStatus === "verified") {
    return "/app/wallet/fund";
  }

  return "/app/wallet/fund";
}
