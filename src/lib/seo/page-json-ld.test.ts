import { existsSync,readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

import { getSchemasForPath } from "@/lib/seo/page-schemas";

const APP_DIR = join(process.cwd(), "src/app");

function findPages(dir: string): Array<string> {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "api" ? [] : findPages(full);
    return entry.name === "page.tsx" ? [full] : [];
  });
}

// Una ruta con schemas tiene que renderizar <PageJsonLd> con su propio path
// (en la page o en su layout). Si falta, la página pierde el JSON-LD sin aviso.
describe("PageJsonLd por ruta", () => {
  const pages = findPages(APP_DIR).map((file) => {
    const segments = relative(APP_DIR, dirname(file)).split(sep).filter(Boolean);
    const route = `/${segments.join("/")}`;
    return {
      file,
      route,
      sampleRoute: route.replace(/\[letra\]/g, "a"),
      expectedPath: route.includes("[letra]") ? `{\`${route.replace("[letra]", "${letra}")}\`}` : `"${route}"`,
    };
  });

  it.each(pages.filter((p) => getSchemasForPath(p.sampleRoute).length > 0))(
    "$route renderiza PageJsonLd con su path",
    ({ file, expectedPath }) => {
      const layout = join(dirname(file), "layout.tsx");
      const sources = [readFileSync(file, "utf8"), existsSync(layout) ? readFileSync(layout, "utf8") : ""];
      expect(sources.some((src) => src.includes(`<PageJsonLd path=${expectedPath} />`))).toBe(true);
    },
  );
});
