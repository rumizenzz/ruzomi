import Link from "next/link";

import { BrandLockup } from "@/components/brand-mark";
import { getStatusSnapshot, type StatusLevel, type StatusPoint, type StatusSnapshot } from "@/lib/status-data";

import styles from "./status-screen.module.css";

function getStatusClass(status: StatusLevel) {
  if (status === "maintenance") {
    return styles.statusPillMaintenance;
  }

  if (status === "degraded") {
    return styles.statusPillDegraded;
  }

  return styles.statusPillOperational;
}

function getHistoryClass(point: StatusPoint) {
  return point.status === "degraded" ? styles.historyPointDegraded : styles.historyPointOperational;
}

export function StatusScreen({ snapshot = getStatusSnapshot() }: { snapshot?: StatusSnapshot }) {
  return (
    <section className={styles.page}>
      <div className={styles.wrap}>
        <header className={styles.header}>
          <Link aria-label="PayToCommit home" href="/" className={styles.backLink}>
            <BrandLockup />
          </Link>
          <div className={styles.headerActions}>
            <a className={styles.ghostLink} href="#incident-history">
              Incident history
            </a>
            <a className={styles.ghostLink} href="https://paytocommit.com/api/status" target="_blank" rel="noreferrer">
              Status JSON
            </a>
            <Link className={styles.pillLink} href="/help-center?article=funding-payouts">
              Subscribe to updates
            </Link>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroMain}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              Status
            </span>
            <h1 className={styles.title}>{snapshot.headline}</h1>
            <p className={styles.summary}>{snapshot.summary}</p>

            <div className={styles.statGrid}>
              <article className={styles.statCard}>
                <span className={styles.statLabel}>90-day uptime</span>
                <strong className={styles.statValue}>{snapshot.uptime90d}</strong>
                <span className={styles.statCopy}>Measured across the monitored public platform surfaces.</span>
              </article>
              <article className={styles.statCard}>
                <span className={styles.statLabel}>Monitored services</span>
                <strong className={styles.statValue}>{snapshot.monitoredServices}</strong>
                <span className={styles.statCopy}>Board, wallet, Ruzomi, Galactus, enterprise, and developer systems.</span>
              </article>
              <article className={styles.statCard}>
                <span className={styles.statLabel}>Subscribers</span>
                <strong className={styles.statValue}>{snapshot.activeSubscribers}</strong>
                <span className={styles.statCopy}>People receiving open, join-close, schedule, and incident notices.</span>
              </article>
              <article className={styles.statCard}>
                <span className={styles.statLabel}>Next maintenance</span>
                <strong className={styles.statValue}>{snapshot.nextMaintenance}</strong>
                <span className={styles.statCopy}>The current planned window affects only instant payout release.</span>
              </article>
            </div>
          </div>

          <aside className={styles.heroSide}>
            <article className={styles.maintenanceCard}>
              <div className={styles.maintenanceHeader}>
                <div>
                  <span className={styles.sectionLabel}>Current global state</span>
                  <div className={styles.maintenanceWindow}>{snapshot.headline}</div>
                </div>
                <span className={`${styles.statusPill} ${getStatusClass(snapshot.overallStatus)}`}>Operational</span>
              </div>
              <p className={styles.maintenanceCopy}>
                Join windows, proof review, notifications, and enterprise lookups are available. A short payout maintenance
                window is already scheduled and listed below.
              </p>
              <ul className={styles.maintenanceList}>
                <li>Stake and proof history remain available during the maintenance window.</li>
                <li>No live market data or commitment artifacts are expected to be delayed.</li>
                <li>Market-open and join-close reminders continue normally.</li>
              </ul>
            </article>
          </aside>
        </section>

        <div className={styles.grid}>
          <div className={styles.groups}>
            {snapshot.groups.map((group) => (
              <section key={group.id} className={styles.group}>
                <div className={styles.groupHead}>
                  <div>
                    <span className={styles.sectionLabel}>{group.title}</span>
                    <h2 className={styles.groupTitle}>{group.title}</h2>
                    <p className={styles.groupSummary}>{group.summary}</p>
                  </div>
                  <span className={`${styles.statusPill} ${styles.statusPillOperational}`}>Monitoring</span>
                </div>

                <div className={styles.componentList}>
                  {group.components.map((component) => (
                    <article key={component.id} className={styles.component}>
                      <div className={styles.componentTop}>
                        <div>
                          <h3 className={styles.componentName}>{component.name}</h3>
                          <p className={styles.componentSummary}>{component.summary}</p>
                        </div>
                        <span className={`${styles.statusPill} ${getStatusClass(component.status)}`}>
                          {component.status === "maintenance"
                            ? "Maintenance"
                            : component.status === "degraded"
                              ? "Degraded"
                              : "Operational"}
                        </span>
                      </div>
                      <div className={styles.componentMeta}>
                        <span>
                          <strong>90-day uptime</strong> {component.uptime90d}
                        </span>
                        <span>
                          <strong>Latest event</strong> {component.latestEvent}
                        </span>
                      </div>
                      <div className={styles.historyBand} aria-label={`${component.name} 30-point uptime history`}>
                        {component.history.map((point, index) => (
                          <span
                            key={`${component.id}-${index}`}
                            className={`${styles.historyPoint} ${getHistoryClass(point)}`}
                          />
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className={styles.sideRail} id="incident-history">
            <section className={styles.historyCard}>
              <div>
                <span className={styles.sectionLabel}>Recent events</span>
                <h2 className={styles.groupTitle}>Incident history</h2>
                <p className={styles.groupSummary}>
                  Every public update, scheduled maintenance window, and resolved service event lives here.
                </p>
              </div>
              <div className={styles.historyList}>
                {snapshot.incidents.map((incident) => (
                  <article key={incident.id} className={styles.incident}>
                    <div className={styles.incidentHead}>
                      <div>
                        <h3 className={styles.incidentTitle}>{incident.title}</h3>
                        <div className={styles.incidentWindow}>{incident.window}</div>
                      </div>
                      <span
                        className={`${styles.statusPill} ${
                          incident.state === "scheduled"
                            ? styles.statusPillMaintenance
                            : incident.impact === "major"
                              ? styles.statusPillDegraded
                              : styles.statusPillOperational
                        }`}
                      >
                        {incident.state === "scheduled" ? "Scheduled" : incident.state === "resolved" ? "Resolved" : "Monitoring"}
                      </span>
                    </div>
                    <p className={styles.incidentSummary}>{incident.summary}</p>
                    <div className={styles.tagRow}>
                      {incident.components.map((component) => (
                        <span key={component} className={styles.tag}>
                          {component}
                        </span>
                      ))}
                    </div>
                    <div className={styles.updateList}>
                      {incident.updates.map((update) => (
                        <div key={`${incident.id}-${update.timestamp}`} className={styles.update}>
                          <span className={styles.updateTime}>{update.timestamp}</span>
                          <span className={styles.updateTitle}>{update.title}</span>
                          <span className={styles.updateBody}>{update.body}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <footer className={styles.footer}>
          <span>Generated {new Date(snapshot.generatedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
          <div className={styles.footerLinks}>
            <Link className={styles.ghostLink} href="/security">
              Security
            </Link>
            <Link className={styles.ghostLink} href="/developers">
              Developers
            </Link>
            <Link className={styles.ghostLink} href="/help-center">
              Help Center
            </Link>
          </div>
        </footer>
      </div>
    </section>
  );
}
