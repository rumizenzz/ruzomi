"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { MarketTrendPoint } from "@/lib/types";

const timeframes = ["6H", "24H", "7D"] as const;

export function MarketTrendChart({
  points,
  accent = "cyan",
  compact = false,
}: {
  points: MarketTrendPoint[];
  accent?: "cyan" | "rose";
  compact?: boolean;
}) {
  const chartRef = useRef<SVGSVGElement | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<(typeof timeframes)[number]>("24H");
  const framePoints = useMemo(() => {
    if (selectedFrame === "6H") {
      return points.slice(-4);
    }

    if (selectedFrame === "24H") {
      return points.slice(-6);
    }

    return points;
  }, [points, selectedFrame]);

  const [hoverIndex, setHoverIndex] = useState(Math.max(framePoints.length - 1, 0));

  useEffect(() => {
    setHoverIndex(Math.max(framePoints.length - 1, 0));
  }, [framePoints]);

  const chartPoints = useMemo(() => {
    if (!framePoints.length) {
      return [] as Array<{ x: number; y: number }>;
    }

    const max = Math.max(...framePoints.map((point) => point.value), 1);
    const min = Math.min(...framePoints.map((point) => point.value), 0);
    const range = Math.max(max - min, 1);

    return framePoints.map((point, index) => ({
      x: (index / Math.max(framePoints.length - 1, 1)) * 100,
      y: 100 - ((point.value - min) / range) * 100,
    }));
  }, [framePoints]);

  const activePoint = framePoints[hoverIndex] ?? framePoints[framePoints.length - 1];
  const activeChartPoint = chartPoints[hoverIndex] ?? chartPoints[chartPoints.length - 1];
  const path = chartPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const volumeMax = Math.max(...framePoints.map((point) => point.volume), 1);
  const spread = framePoints.length
    ? Math.max(...framePoints.map((point) => point.value)) - Math.min(...framePoints.map((point) => point.value))
    : 0;
  const valueMax = Math.max(...framePoints.map((point) => point.value), 1);
  const valueMin = Math.min(...framePoints.map((point) => point.value), 0);
  const yAxisTicks = [
    Math.round(valueMax),
    Math.round((valueMax + valueMin) / 2),
    Math.round(valueMin),
  ];

  function updateHoverFromPointer(clientX: number) {
    if (!chartRef.current || !framePoints.length) {
      return;
    }

    const bounds = chartRef.current.getBoundingClientRect();
    if (!bounds.width) {
      return;
    }

    const relative = Math.min(Math.max((clientX - bounds.left) / bounds.width, 0), 1);
    const index = Math.round(relative * Math.max(framePoints.length - 1, 1));
    setHoverIndex(index);
  }

  return (
    <div className={`trend-chart trend-chart-${accent} ${compact ? "trend-chart-compact" : ""}`}>
      <div className="trend-chart-toolbar">
        <div className="trend-chart-spotlight">
          <div className="surface-meta">
            <strong>{activePoint?.value ?? 0}%</strong>
            <span>{activePoint?.timestampLabel ?? `${activePoint?.label ?? "Now"} snapshot`}</span>
          </div>
          {!compact ? (
            <div className="trend-chart-stats">
              <div className="trend-chart-stat">
                <span className="mono-label">Signals</span>
                <strong>{activePoint?.volume ?? 0}</strong>
              </div>
              <div className="trend-chart-stat">
                <span className="mono-label">Spread</span>
                <strong>{spread}%</strong>
              </div>
              <div className="trend-chart-stat">
                <span className="mono-label">Reveal</span>
                <strong>{activePoint?.revealState === "revealed" ? "Exact dollars live" : "Reveal-safe view"}</strong>
              </div>
            </div>
          ) : null}
        </div>
        {!compact ? (
          <div className="trend-frame-group">
            {timeframes.map((frame) => (
              <button
                key={frame}
                className={`trend-frame ${selectedFrame === frame ? "is-active" : ""}`}
                onClick={() => setSelectedFrame(frame)}
                type="button"
              >
                {frame}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="trend-chart-body">
        {!compact ? (
          <div className="trend-chart-y-axis" aria-hidden="true">
            {yAxisTicks.map((tick) => (
              <span key={tick}>{tick}%</span>
            ))}
          </div>
        ) : null}
        <svg
          ref={chartRef}
          className="trend-chart-svg"
          onPointerLeave={() => setHoverIndex(Math.max(framePoints.length - 1, 0))}
          onPointerMove={(event) => updateHoverFromPointer(event.clientX)}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <rect
            className="trend-chart-hitbox"
            height="100"
            onPointerDown={(event) => updateHoverFromPointer(event.clientX)}
            width="100"
            x="0"
            y="0"
          />
        <path className="trend-chart-grid" d="M 0 20 L 100 20 M 0 50 L 100 50 M 0 80 L 100 80" />
        <path className="trend-chart-line" d={path || "M 0 50 L 100 50"} pathLength={100} />
        {activeChartPoint ? (
          <>
            <path
              className="trend-chart-crosshair"
              d={`M ${activeChartPoint.x} 0 L ${activeChartPoint.x} 100`}
            />
            <path
              className="trend-chart-crosshair"
              d={`M 0 ${activeChartPoint.y} L 100 ${activeChartPoint.y}`}
            />
          </>
        ) : null}
        {chartPoints.map((point, index) => (
          <circle
            key={`${point.x}-${point.y}`}
            className={hoverIndex === index ? "trend-point is-active" : "trend-point"}
            cx={point.x}
            cy={point.y}
            onMouseEnter={() => setHoverIndex(index)}
            onPointerEnter={() => setHoverIndex(index)}
            r={hoverIndex === index ? 2.4 : 1.5}
          />
        ))}
        </svg>
      </div>
      {!compact ? (
        <div className="trend-chart-volume-bars" aria-hidden="true">
          {framePoints.map((point, index) => (
            <div
              key={`${point.label}-${index}`}
              className={`trend-chart-volume-bar ${hoverIndex === index ? "is-active" : ""}`}
              style={{ height: `${Math.max(18, Math.round((point.volume / volumeMax) * 100))}%` }}
            />
          ))}
        </div>
      ) : null}
      {!compact && activePoint ? (
        <div className="trend-chart-detail-band">
          <div className="trend-chart-evidence">
            <span className="mono-label">Evidence card</span>
            <strong>{activePoint.truthAnchorTitle ?? "Ledger-linked activity"}</strong>
            <p className="detail-text">
              {activePoint.truthAnchorDetail ?? "Proof review, stake flow, and result timing stay aligned to the published market rules."}
            </p>
          </div>
          <div className="trend-chart-evidence-meta">
            <div className="trend-chart-stat">
              <span className="mono-label">Timestamp</span>
              <strong>{activePoint.timestampLabel ?? activePoint.label}</strong>
            </div>
            <div className="trend-chart-stat">
              <span className="mono-label">Activity pulse</span>
              <strong>{activePoint.pulseLabel ?? "Stake activity building"}</strong>
            </div>
          </div>
        </div>
      ) : null}
      {!compact ? (
        <div className="trend-chart-labels">
          {framePoints.map((point, index) => (
            <button
              key={point.label}
              className={`trend-chart-label ${hoverIndex === index ? "is-active" : ""}`}
              onClick={() => setHoverIndex(index)}
              type="button"
            >
              {point.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
