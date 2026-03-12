export function normalizePublicHandle(handle: string | null | undefined) {
  return handle?.trim().replace(/^@/, "") ?? null;
}

export function isLegacyAnonymousHandle(handle: string | null | undefined) {
  const normalized = normalizePublicHandle(handle);
  return Boolean(normalized && /^member(?:_[a-z0-9]+)?$/i.test(normalized));
}

export function getVisiblePublicHandle(handle: string | null | undefined) {
  const normalized = normalizePublicHandle(handle);

  if (!normalized || isLegacyAnonymousHandle(normalized)) {
    return null;
  }

  return normalized;
}

export function formatVisiblePublicHandle(handle: string | null | undefined) {
  const visibleHandle = getVisiblePublicHandle(handle);
  return visibleHandle ? `@${visibleHandle}` : null;
}
