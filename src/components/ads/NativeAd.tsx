"use client";

import { useEffect, useState } from "react";

/**
 * NativeAd — Adsterra "Native Banner", responsive, served from a cross-origin
 * iframe on ads.garca.app (same isolation as AdsterraBanner: the ad script runs
 * on the ads.garca.app origin and cannot read garca.app localStorage/DOM).
 *
 * The native banner is variable-height and width-responsive. Cross-origin
 * iframes don't auto-resize, so /ads/native.html postMessages its height and we
 * size the iframe to match.
 *
 * Works on iOS Safari (in-flow, not position:fixed). Mount ONLY on content
 * pages — never on /ingresar or /panel.
 */

const ADS_ORIGIN = process.env.NEXT_PUBLIC_ADS_ORIGIN ?? "https://ads.garca.app";

interface NativeAdProps {
  className?: string;
}

export function NativeAd({ className }: NativeAdProps) {
  // Arranca sin alto en px: el CSS reserva el alto que el anuncio termina teniendo
  // (medido: ~0.74 × ancho + 30px en mobile, 445px desde md). Con 260 fijo el
  // iframe crecía 40-180px al cargar y el contenido saltaba al scrollear.
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    function onMsg(e: globalThis.MessageEvent) {
      if (e.origin !== ADS_ORIGIN) return;
      const data = e.data as { type?: string; height?: number } | null;
      if (data?.type === "garca-ad-height" && typeof data.height === "number" && data.height > 0) {
        setHeight(Math.min(800, Math.max(120, Math.ceil(data.height))));
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  return (
    <div className={`mx-auto w-full max-w-3xl ${className ?? ""}`}>
      <span className="mb-1 block text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
        Publicidad
      </span>
      <iframe
        title="Publicidad"
        src={`${ADS_ORIGIN}/ads/native.html`}
        width="100%"
        height={height ?? undefined}
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        loading="lazy"
        scrolling="no"
        className={height == null ? "h-[min(calc(74vw+30px),445px)]" : undefined}
        style={{ border: 0, display: "block", width: "100%" }}
      />
    </div>
  );
}
