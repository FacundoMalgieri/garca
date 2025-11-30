/**
 * Script to generate favicons from SVG logo
 * Run with: node scripts/generate-favicons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const LOGO_SVG = path.join(PUBLIC_DIR, 'logo-icon.svg');
const OG_IMAGE_SVG = path.join(PUBLIC_DIR, 'og-image.svg');

async function generateFavicons() {
  console.log('Generating favicons from logo-icon.svg...\n');

  // Read the SVG file
  const svgBuffer = fs.readFileSync(LOGO_SVG);

  // Generate different sizes
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-192x192.png', size: 192 },
    { name: 'favicon-512x512.png', size: 512 },
  ];

  for (const { name, size } of sizes) {
    const outputPath = path.join(PUBLIC_DIR, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated ${name} (${size}x${size})`);
  }

  // Generate ICO file (we'll use the 32x32 PNG as base)
  // Note: sharp doesn't support ICO directly, so we'll just copy the 32x32
  console.log('\n✓ favicon.ico should be generated manually or use the 32x32 PNG');

  // Generate OG image PNG from SVG
  console.log('\nGenerating og-image.png from og-image.svg...');
  const ogSvgBuffer = fs.readFileSync(OG_IMAGE_SVG);
  await sharp(ogSvgBuffer)
    .resize(1200, 630)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'og-image.png'));
  console.log('✓ Generated og-image.png (1200x630)');

  console.log('\n✅ All favicons generated successfully!');
}

generateFavicons().catch(console.error);

