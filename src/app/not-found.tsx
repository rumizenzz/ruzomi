import Link from "next/link";

export default function NotFound() {
  return (
    <div className="content-wrap page-stack">
      <section className="glass-panel empty-state">
        <p className="eyebrow">Not found</p>
        <h1 className="section-title">That surface does not exist.</h1>
        <p className="section-copy">
          The route may have moved, or the pool may no longer be available.
        </p>
        <div className="button-row" style={{ justifyContent: "center" }}>
          <Link className="action-primary" href="/">
            Return home
          </Link>
          <Link className="action-secondary" href="/pools">
            Explore markets
          </Link>
        </div>
      </section>
    </div>
  );
}
