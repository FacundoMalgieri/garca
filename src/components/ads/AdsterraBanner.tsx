"use client";

/**
 * AdsterraBanner — renders an Adsterra display banner inside a *cross-origin*
 * iframe served from a separate host (default https://ads.garca.app).
 *
 * Security model (the whole point of this component):
 * The Adsterra `invoke.js` loader runs inside an HTML page served from
 * `ads.garca.app` — a DIFFERENT origin than `garca.app`, even though the same
 * Next app serves both (origin = hostname). Because of the same-origin policy:
 *   - the ad CANNOT read `garca.app` localStorage (localStorage is per-origin,
 *     not shared across subdomains),
 *   - it CANNOT read the parent DOM,
 *   - it CANNOT call our API with the user's ambient credentials.
 * `allow-same-origin` is SAFE here: "same-origin" for the iframe means
 * `ads.garca.app`, so the ad can read its OWN cookies (which Adsterra needs)
 * without ever touching garca.app data.
 *
 * NEVER mount this on /ingresar or /panel — defense in depth (and those routes
 * keep an ad-free CSP via middleware).
 */

export type AdsterraFormat = "leaderboard" | "rectangle" | "mobile" | "skyscraper";

interface AdUnit {
  /** Static HTML file under <ADS_ORIGIN>/ads/ that hosts the Adsterra snippet. */
  file: string;
  width: number;
  height: number;
}

/** Central registry of the ad units. Reuse a format across many placements. */
const AD_UNITS: Record<AdsterraFormat, AdUnit> = {
  leaderboard: { file: "b-728x90.html", width: 728, height: 90 },
  rectangle: { file: "b-300x250.html", width: 300, height: 250 },
  mobile: { file: "b-320x50.html", width: 320, height: 50 },
  skyscraper: { file: "b-160x600.html", width: 160, height: 600 },
};

/** Separate origin that serves the ad HTML. Override via NEXT_PUBLIC_ADS_ORIGIN. */
const ADS_ORIGIN = process.env.NEXT_PUBLIC_ADS_ORIGIN ?? "https://ads.garca.app";

interface AdsterraBannerProps {
  format: AdsterraFormat;
  /** Optional extra classes on the outer wrapper. */
  className?: string;
  /** Hide the "Publicidad" label (default: shown). */
  hideLabel?: boolean;
}

export function AdsterraBanner({ format, className, hideLabel = false }: AdsterraBannerProps) {
  const unit = AD_UNITS[format];
  const src = `${ADS_ORIGIN}/ads/${unit.file}`;

  return (
    <div
      className={`mx-auto flex max-w-full flex-col items-center ${className ?? ""}`}
      // Reserve the slot's exact box so the ad can't shift layout (CLS).
      style={{ width: unit.width, maxWidth: "100%" }}
    >
      {!hideLabel && (
        <span className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
          Publicidad
        </span>
      )}
      <div
        className="overflow-hidden"
        style={{ width: unit.width, height: unit.height, maxWidth: "100%" }}
      >
        <iframe
          title="Publicidad"
          src={src}
          width={unit.width}
          height={unit.height}
          // Cross-origin host already isolates from garca.app data; allow-same-origin
          // lets the ad use its OWN (ads.garca.app) cookies, which Adsterra requires.
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          loading="lazy"
          scrolling="no"
          style={{ border: 0, display: "block" }}
        />
      </div>
    </div>
  );
}
