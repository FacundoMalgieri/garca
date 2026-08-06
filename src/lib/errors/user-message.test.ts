import { describe, expect, it } from "vitest";

import { ARCA_DEPENDENCY_NOTICE, getUserFacingError } from "./user-message";

describe("getUserFacingError", () => {
  it("devuelve null cuando no hay error", () => {
    expect(getUserFacingError(null, null)).toBeNull();
    expect(getUserFacingError("", null)).toBeNull();
  });

  it("aconseja con el código solo, sin mensaje", () => {
    // La tabla de /panel llama con error=null y sólo el código.
    expect(getUserFacingError(null, "TIMEOUT")).toMatch(/ARCA/);
    expect(getUserFacingError(null, "INVALID_CREDENTIALS")).toBeNull();
  });

  describe("Turnstile", () => {
    // 41 de 77 fallas en 60 días. Es la única familia que el usuario puede
    // resolver sola, y se resuelve recargando (token vencido o reusado).
    it("pide recargar cuando el token venció o se reusó", () => {
      const message = getUserFacingError(
        "Verificación fallida",
        "TURNSTILE_FAILED_timeout_or_duplicate"
      );
      expect(message).toMatch(/recarg/i);
    });

    it("cubre las demás variantes de Turnstile que el usuario puede resolver", () => {
      for (const code of ["TURNSTILE_FAILED", "TURNSTILE_MISSING"]) {
        expect(getUserFacingError("x", code)).toMatch(/recarg/i);
      }
    });

    it("NO le pide recargar cuando Turnstile está mal configurado en el server", () => {
      // TURNSTILE_NOT_CONFIGURED es un 503 por falta de claves en el entorno
      // (src/lib/security). Recargar no lo arregla nunca: el usuario quedaría
      // en un loop y el operador no se entera. El mensaje original ya dice
      // "Contactá al administrador".
      const original = "Servicio temporalmente no disponible. Contactá al administrador.";
      expect(getUserFacingError(original, "TURNSTILE_NOT_CONFIGURED")).toBe(original);
    });

    it("no le pide recargar a nadie más", () => {
      expect(getUserFacingError("x", "TIMEOUT")).not.toMatch(/recarg/i);
    });
  });

  describe("ARCA caído", () => {
    // Confirmado el 05/08/2026: monotributo.afip.gob.ar aceptaba la conexión
    // TCP y no respondía nunca. Recargar no arregla nada; hay que esperar.
    it("dice que es de ARCA y que se reintente más tarde", () => {
      for (const code of ["TIMEOUT", "NAVIGATION_ERROR", "SERVICE_UNAVAILABLE"]) {
        const message = getUserFacingError("Timeout", code);
        expect(message).toMatch(/ARCA/);
        expect(message).toMatch(/minutos/i);
      }
    });

    it("no culpa a las credenciales", () => {
      expect(getUserFacingError("Timeout", "TIMEOUT")).not.toMatch(/contraseñ|clave/i);
    });
  });

  describe("credenciales", () => {
    it("respeta el mensaje original del scraper", () => {
      const original = "CUIT o contraseña incorrectos";
      expect(getUserFacingError(original, "INVALID_CREDENTIALS")).toBe(original);
    });

    it("respeta el mensaje original de cuenta bloqueada", () => {
      const original = "Tu cuenta está bloqueada en ARCA";
      expect(getUserFacingError(original, "ACCOUNT_BLOCKED")).toBe(original);
    });
  });

  describe("conexión cortada", () => {
    // El síntoma que originó todo: el stream SSE muere y fetch tira un
    // TypeError. El mensaje crudo del browser está en inglés ("Failed to
    // fetch" / "Load failed") y no le dice nada a nadie.
    it("traduce NETWORK y CLIENT a algo legible", () => {
      for (const code of ["NETWORK", "CLIENT"]) {
        const message = getUserFacingError("Failed to fetch", code);
        expect(message).not.toMatch(/failed to fetch/i);
        expect(message).toMatch(/conexión|conexion/i);
      }
    });
  });

  it("cae al mensaje original cuando el código es desconocido o falta", () => {
    expect(getUserFacingError("Algo raro pasó", null)).toBe("Algo raro pasó");
    expect(getUserFacingError("Algo raro pasó", "UNKNOWN")).toBe("Algo raro pasó");
    expect(getUserFacingError("Algo raro pasó", "CODIGO_NUEVO")).toBe("Algo raro pasó");
  });

  it("expone el aviso de dependencia de ARCA para el formulario", () => {
    expect(ARCA_DEPENDENCY_NOTICE).toMatch(/ARCA/);
  });
});
