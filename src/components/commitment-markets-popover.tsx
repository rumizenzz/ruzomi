"use client";

import clsx from "clsx";
import Link from "next/link";

import { buildAuthHref } from "@/lib/auth-flow";

type PopoverLink = {
  href: string;
  label: string;
};

type PopoverSection = {
  title: string;
  links: PopoverLink[];
};

const loggedInSections: PopoverSection[] = [
  {
    title: "Discover",
    links: [
      { href: "/pools", label: "All markets" },
      { href: "/#highway", label: "Live Commitment Highway" },
      { href: "/pools?sort=volume", label: "Top markets" },
      { href: "/pools?sort=new", label: "New markets" },
      { href: "/chains", label: "Habit chains" },
    ],
  },
  {
    title: "My commitments",
    links: [
      { href: "/app", label: "Active stakes" },
      { href: "/app/history", label: "Verifying now" },
      { href: "/app", label: "Completed cards" },
      { href: "/app/history", label: "Missed closes" },
      { href: "/app/profile", label: "Profile history" },
    ],
  },
  {
    title: "Creation Forge",
    links: [
      { href: "/app/pools/new", label: "Prompt new market" },
      { href: "/docs/rules", label: "Draft rules" },
      { href: "/docs/proof", label: "Set proof" },
      { href: "/app/pools/new", label: "Open market" },
    ],
  },
];

export function CommitmentMarketsPopover({
  liveCount,
  pathname,
  loggedIn = false,
}: {
  liveCount: number;
  pathname: string;
  loggedIn?: boolean;
}) {
  const isActive = pathname === "/" || pathname.startsWith("/pools") || pathname.startsWith("/chains");
  const loggedOutSections: PopoverSection[] = [
    {
      title: "Discover",
      links: [
        { href: "/pools", label: "All markets" },
        { href: "/#highway", label: "Live Commitment Highway" },
        { href: "/pools?sort=volume", label: "Top markets" },
        { href: "/pools?sort=new", label: "New markets" },
        { href: "/chains", label: "Habit chains" },
      ],
    },
    {
      title: "My commitments",
      links: [
        { href: buildAuthHref("login", "/app"), label: "Active stakes" },
        { href: buildAuthHref("login", "/app/history"), label: "Verifying now" },
        { href: buildAuthHref("login", "/app"), label: "Completed cards" },
        { href: buildAuthHref("login", "/app/history"), label: "Missed closes" },
      ],
    },
    {
      title: "Creation Forge",
      links: [
        { href: buildAuthHref("signup", "/app/pools/new?resumeDraft=1"), label: "Prompt new market" },
        { href: "/docs/rules", label: "Draft rules" },
        { href: "/docs/proof", label: "Set proof" },
        { href: buildAuthHref("signup", "/app/pools/new?resumeDraft=1"), label: "Open market" },
      ],
    },
  ];
  const sections = loggedIn ? loggedInSections : loggedOutSections;

  return (
    <details className="nav-market-popover">
      <summary className={clsx("nav-link", "nav-link-shell", "nav-market-popover-trigger", isActive && "is-active")}>
        <span>Commitment Markets</span>
        <span className="nav-link-count nav-link-count-live">{liveCount}</span>
      </summary>
      <div className="nav-market-popover-panel">
        <div className="nav-market-popover-grid">
          {sections.map((section) => (
            <div key={section.title} className="nav-market-popover-block">
              <span className="mono-label">{section.title}</span>
              <div className="nav-market-popover-links">
                {section.links.map((link) => (
                  <Link key={`${section.title}-${link.href}-${link.label}`} className="nav-market-popover-link" href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}
