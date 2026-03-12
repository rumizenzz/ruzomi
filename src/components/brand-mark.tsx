import Image from "next/image";
import clsx from "clsx";

export function BrandMark() {
  return (
    <span aria-hidden="true" className="brand-mark">
      <span className="brand-mark-aura" />
      <Image
        alt=""
        className="brand-mark-image"
        height={56}
        priority
        src="/icon.png"
        width={56}
      />
    </span>
  );
}

export function BrandLockup({
  compact = false,
  subtitle,
}: {
  compact?: boolean;
  subtitle?: string;
}) {
  return (
    <span className={clsx("brand-lockup", compact && "brand-lockup-compact")}>
      <BrandMark />
      <span className="brand-wordmark">
        <span aria-label="PayToCommit" className="brand-title">
          <span className="brand-title-main">PAY</span>
          <span className="brand-title-accent">TO</span>
          <span className="brand-title-main">COMMIT</span>
        </span>
        {subtitle ? <span className="brand-subtitle">{subtitle}</span> : null}
      </span>
    </span>
  );
}
