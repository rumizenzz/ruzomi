export type GifSearchResult = {
  id: string;
  title: string;
  previewUrl: string;
  tags: string[];
  source: "catalog" | "tenor";
};

export const curatedGifCatalog: GifSearchResult[] = [
  {
    id: "catalog-run",
    title: "Locked in run",
    previewUrl: "https://media1.giphy.com/media/cZ7rmKfFYOvYI/200.gif",
    tags: ["run", "fitness", "lock in", "commitment", "energy"],
    source: "catalog",
  },
  {
    id: "catalog-hype",
    title: "Momentum",
    previewUrl: "https://media1.giphy.com/media/ICOgUNjpvO0PC/200.gif",
    tags: ["hype", "momentum", "celebrate", "spark", "win"],
    source: "catalog",
  },
  {
    id: "catalog-build",
    title: "Shipping work",
    previewUrl: "https://media1.giphy.com/media/3oEjI6SIIHBdRxXI40/200.gif",
    tags: ["typing", "work", "ship", "build", "focus"],
    source: "catalog",
  },
  {
    id: "catalog-yes",
    title: "Locked in yes",
    previewUrl: "https://media1.giphy.com/media/26u4lOMA8JKSnL9Uk/200.gif",
    tags: ["yes", "done", "win", "locked in", "share"],
    source: "catalog",
  },
  {
    id: "catalog-celebrate",
    title: "Celebrate",
    previewUrl: "https://media1.giphy.com/media/xUPGcguWZHRC2HyBRS/200.gif",
    tags: ["celebrate", "success", "victory", "completed", "fire"],
    source: "catalog",
  },
  {
    id: "catalog-thinking",
    title: "Thinking",
    previewUrl: "https://media1.giphy.com/media/5GoVLqeAOo6PK/200.gif",
    tags: ["thinking", "idea", "market", "draft", "question"],
    source: "catalog",
  },
];

export function searchCuratedGifs(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return curatedGifCatalog.slice(0, 6);
  }

  return curatedGifCatalog
    .filter((item) => {
      const haystack = [item.title, ...item.tags].join(" ").toLowerCase();
      return haystack.includes(normalized);
    })
    .slice(0, 12);
}
