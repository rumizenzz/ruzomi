import type { Metadata } from "next";

import { PoolBoard } from "@/components/pool-board";
import { GlassPanel } from "@/components/surfaces";
import { getPoolCategories, listPools } from "@/lib/paytocommit-data";
import type { CommitmentPool } from "@/lib/types";

export const metadata: Metadata = {
  title: "Markets",
  description:
    "Browse live, opening, and settling commitment markets across fitness, work, home, learning, relationships, money, and daily life.",
};

function matchesPool(pool: CommitmentPool, query: string) {
  const haystack = [
    pool.title,
    pool.category,
    pool.summary,
    pool.status,
    pool.evidenceMode,
    pool.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export default async function PoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const searchTerm = Array.isArray(params.q) ? params.q[0] ?? "" : params.q ?? "";
  const query = searchTerm.trim().toLowerCase();
  const allPools = await listPools();
  const pools = query ? allPools.filter((pool) => matchesPool(pool, query)) : allPools;
  const categories = (await getPoolCategories()).map((category) => ({
    ...category,
    pools: pools.filter((pool) => pool.category === category.category),
  })).filter((category) => category.pools.length);
  const totals = {
    total: pools.length,
    live: pools.filter((pool) => pool.status === "live").length,
    upcoming: pools.filter((pool) => pool.status === "upcoming").length,
    settling: pools.filter((pool) => pool.status === "settling").length,
  };

  return (
    <>
      <h1 className="sr-only">Markets</h1>
      <section className="section-stack market-directory-stack">
        <div className="market-directory-bar">
          <div className="market-board-totals market-board-totals-wide">
            <div className="market-total-pill">
              <span>Markets</span>
              <strong>{totals.total}</strong>
            </div>
            <div className="market-total-pill">
              <span>Live</span>
              <strong>{totals.live}</strong>
            </div>
            <div className="market-total-pill">
              <span>Opening</span>
              <strong>{totals.upcoming}</strong>
            </div>
            <div className="market-total-pill">
              <span>Settling</span>
              <strong>{totals.settling}</strong>
            </div>
          </div>
          {query ? <div className="market-search-note">Showing results for {searchTerm}</div> : null}
        </div>

        <nav aria-label="Market categories" className="category-rail shell-category-rail category-rail-directory">
          {categories.map((category) => (
            <a key={category.anchor} className="category-rail-link" href={`#${category.anchor}`}>
              <span>{category.category}</span>
              <strong>{category.liveCount || category.totalCount}</strong>
            </a>
          ))}
        </nav>
      </section>

      <section className="section-stack market-shelf-stack">
        {categories.length ? (
          categories.map((category) => (
            <section key={category.anchor} className="category-section category-board-section" id={category.anchor}>
              <GlassPanel className="market-board category-board-panel">
                <div className="market-shelf-head">
                  <div className="market-shelf-title">
                    <span className="mono-label">{category.category}</span>
                    <h2 className="market-shelf-heading market-shelf-heading-small">
                      {category.liveCount} live · {category.upcomingCount} opening · {category.settlingCount} settling
                    </h2>
                  </div>
                </div>
                <PoolBoard
                  emptyMessage={`No ${category.category.toLowerCase()} markets are active right now.`}
                  pools={category.pools}
                />
              </GlassPanel>
            </section>
          ))
        ) : (
          <GlassPanel className="market-board category-board-panel">
            <div className="empty-state market-board-empty">No markets matched that search.</div>
          </GlassPanel>
        )}
      </section>
    </>
  );
}
