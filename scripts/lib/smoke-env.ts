/**
 * Carga de credenciales para los smoke manuales.
 *
 * Pasarlas inline (`AFIP_PASS='clave' npx tsx ...`) las deja en el historial del
 * shell, así que el camino recomendado es un archivo `.env.smoke` en la raíz:
 * `.env*` ya está gitignoreado. El env del proceso sigue teniendo prioridad para
 * no romper usos existentes ni CI.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** Parseo mínimo de KEY=VALUE (sin dependencias): comillas y comentarios. */
function parseEnvFile(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rawLine of readFileSync(path, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) out[key] = value;
  }
  return out;
}

/** Lee `.env.smoke` y `.env` sin sobreescribir lo que ya venga en el env. */
export function loadEnvFiles(cwd = process.cwd()): void {
  for (const name of [".env.smoke", ".env"]) {
    const path = join(cwd, name);
    if (!existsSync(path)) continue;
    for (const [key, value] of Object.entries(parseEnvFile(path))) {
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}

export interface SmokeCredentials {
  cuit: string;
  password: string;
}

/**
 * Credenciales de ARCA para un smoke. Corta el proceso con instrucciones si
 * faltan — nunca imprime la clave.
 */
export function requireCredentials(scriptName: string): SmokeCredentials {
  loadEnvFiles();

  const cuit = process.env.AFIP_CUIT;
  const password = process.env.AFIP_PASS;

  if (!cuit || !password) {
    console.error(
      [
        `Faltan credenciales para ${scriptName}.`,
        "",
        "Recomendado (no queda en el historial del shell):",
        "  cat > .env.smoke <<'EOF'",
        "  AFIP_CUIT=20xxxxxxxx9",
        "  AFIP_PASS=tu-clave",
        "  EOF",
        `  npx tsx ${scriptName}`,
        "",
        "Alternativa (queda en el historial):",
        `  AFIP_CUIT=.. AFIP_PASS=.. npx tsx ${scriptName}`,
      ].join("\n")
    );
    process.exit(1);
  }

  return { cuit, password };
}

/** Cronómetro por etapas para los smoke (imprime y acumula). */
export function createStopwatch(label = "smoke") {
  const t0 = Date.now();
  let last = t0;
  const marks: Record<string, number> = {};

  return {
    mark(name: string) {
      const now = Date.now();
      marks[name] = now - last;
      last = now;
      console.log(`⏱ [${label}] ${name}: ${marks[name]}ms (total ${now - t0}ms)`);
      return marks[name];
    },
    total() {
      return Date.now() - t0;
    },
    marks,
  };
}
