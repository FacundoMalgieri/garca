---
name: og-image
description: Use when creating or updating an Open Graph (social share) image for a GARCA page or guide — generates a 1200×630 PNG that matches the existing brand set in public/og/. Triggers on "OG image", "imagen OG", "social card", or step 5 of the SEO checklist for a new /monotributo guide.
---

# GARCA OG image generation

GARCA's OG images are bespoke **flat-vector illustrations** on a shared brand frame, rendered SVG→PNG with `sharp` (already a dependency). This skill is the recipe so you never have to re-derive it.

Every guide page references `buildArticleImage("<slug>")` → the file MUST be `public/og/<slug>.png` (1200×630), where `<slug>` is the route segment (e.g. `factura-e`, `crs-arca`).

## Brand tokens (do not change — this is what keeps the set consistent)
- Background: navy radial gradient `#2E3A66` → `#222B4D` (base brand navy `#262F55`).
- Cyan accent: `#64D3DE`. Coral accent: `#FF6B5C`.
- Illustration fills: white / very light `#F5F8FF`, with cyan edges/strokes and one coral highlight.
- Style: flat vector, slight isometric tilt, soft glow halo behind the subject, a soft navy ground-shadow ellipse, subtle depth. **No text on the card** (the title comes from page metadata).

## Workflow
1. **Look first.** View 2–3 existing files in `public/og/` (e.g. `factura-e.png`, `arca-vs-afip.png`) to match the polish and proportions.
2. **Pick an illustration concept** for the topic — one clear, simple subject, placed center / center-right (around `cx≈690, cy≈315`; for a 3-way comparison center it at `cx≈600` and spread wider). Keep it conceptually distinct from existing OGs.
3. **Author the SVG.** Start from `frame.svg` in this skill folder (the shared bg gradient + glow + 3 accent dots) and insert your illustration into the `<!-- ILLUSTRATION SLOT -->`. Keep the frame elements identical.
4. **Render** with the helper:
   ```bash
   node .claude/skills/og-image/render.cjs /tmp/<slug>.svg public/og/<slug>.png
   ```
   (Write your composed SVG to a temp file, then run the command. It outputs exactly 1200×630 and prints the verified dimensions. If a `NODE_OPTIONS` preload error appears, prepend `export NODE_OPTIONS="--max-old-space-size=4096"`.)
5. **QC:** view the resulting PNG and confirm it reads cleanly at small sizes and matches the set.

## Hard rules
- Exactly **1200×630**, output to `public/og/<slug>.png`, slug matching `buildArticleImage(...)` in `src/lib/seo/page-schemas.ts`.
- **No real company logos, brand marks, or trademarked names** in the artwork (use generic abstract shapes — e.g. a plain card with a chip, not a Visa/Wise logo).
- Don't put title text on the card.

## Tips
- A "chip" = a small rounded square split in 4; avoid making it look like a real OS/brand logo.
- For crisp line-art, use `stroke-width` ~3–6 at this canvas size.
- Reuse motifs already in the set for cohesion (the globe in `factura-e.png`, the shield silhouette in `arca-vs-afip.png`).
- Parallelizable: if generating several at once, dispatch one subagent per image but give each the SAME `frame.svg` so they stay consistent.
