/**
 * IndexNow ping script.
 *
 * Notifies participating search engines (Bing, Yandex, Seznam, Naver) that our URLs
 * have been updated so they can crawl them faster.
 * Google does not support IndexNow as of 2026, so we rely on sitemap crawling for Google.
 *
 * Ref: https://www.indexnow.org/documentation
 *
 * Run manually:
 *   npx tsx scripts/ping-indexnow.ts
 *
 * Or as a post-deploy step (see .github/workflows/deploy.yml).
 */

import { MONOTRIBUTO_DATA } from "../src/data/monotributo-categorias";

const HOST = process.env.INDEXNOW_HOST || "garca.app";
const KEY = process.env.INDEXNOW_KEY || "7c3e9a2b4d5f6a1b8c0d2e4f6a8b0c3e";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITE_URL = `https://${HOST}`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

const STATIC_PATHS = [
  "/",
  "/about",
  "/calculadora-monotributo",
  "/monotributo",
  "/monotributo/guias",
  "/monotributo/recategorizacion",
  "/monotributo/servicios-vs-bienes",
  "/monotributo/que-pasa-si-me-paso",
  "/monotributo/vs-responsable-inscripto",
  "/privacidad",
  "/terminos",
];

function buildUrlList(): Array<string> {
  const categoriaPaths = MONOTRIBUTO_DATA.categorias.flatMap((cat) => {
    const letra = cat.categoria.toLowerCase();
    return [
      `/monotributo/categoria/${letra}`,
      `/monotributo/cuanto-puedo-facturar-por-mes/${letra}`,
    ];
  });

  return [...STATIC_PATHS, ...categoriaPaths].map((p) => `${SITE_URL}${p}`);
}

async function main() {
  const urlList = buildUrlList();

  console.log(`[IndexNow] Host: ${HOST}`);
  console.log(`[IndexNow] URLs to submit: ${urlList.length}`);

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const body = await response.text();

    if (response.status === 200 || response.status === 202) {
      console.log(`[IndexNow] OK (status ${response.status})`);
      return;
    }

    console.error(`[IndexNow] Non-success status: ${response.status}`);
    if (body) console.error(`[IndexNow] Response: ${body}`);

    if (response.status === 400 || response.status === 403 || response.status === 422) {
      process.exit(1);
    }

    console.warn("[IndexNow] Transient error, not failing the build.");
  } catch (error) {
    console.error("[IndexNow] Network error:", error);
    console.warn("[IndexNow] Not failing the build.");
  }
}

main();
