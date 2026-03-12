const BLOCKED_GIF_URLS = new Set([
  "https://media.tenor.com/7pXG8M4d8r4AAAAC/cleaning-dishes.gif",
]);

export function getRenderableGifUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  return BLOCKED_GIF_URLS.has(url) ? null : url;
}
