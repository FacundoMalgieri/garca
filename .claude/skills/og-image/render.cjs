#!/usr/bin/env node
/**
 * Render a 1200×630 OG PNG from an SVG file, using sharp (a project dependency).
 * Usage: node .claude/skills/og-image/render.cjs <input.svg> <output.png>
 * Always outputs exactly 1200×630 and prints the verified dimensions.
 */
const sharp = require("sharp");
const fs = require("fs");

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error("Usage: node render.cjs <input.svg> <output.png>");
  process.exit(1);
}

const svg = fs.readFileSync(inPath);

sharp(svg, { density: 144 })
  .resize(1200, 630, { fit: "fill" })
  .png()
  .toFile(outPath)
  .then(() => sharp(outPath).metadata())
  .then((m) => {
    console.log(`✓ ${outPath} — ${m.width}×${m.height}`);
    if (m.width !== 1200 || m.height !== 630) {
      console.error("WARN: expected 1200×630");
      process.exit(2);
    }
  })
  .catch((e) => {
    console.error("render failed:", e.message);
    process.exit(1);
  });
