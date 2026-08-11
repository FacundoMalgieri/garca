import { describe, expect, it, vi } from "vitest"

import { scrapeMonotributoBestEffort } from "./best-effort"

const INFO = {
  categoria: "H",
  tipoActividad: "servicios" as const,
  actividadDescripcion: "LOCACIONES DE SERVICIOS",
  proximaRecategorizacion: "Enero 2027",
  nombreCompleto: "PEREZ JUAN CARLOS",
  cuit: "20301234563",
}

/**
 * Contexto falso de Playwright. Lo único que le interesa a este helper es que
 * abre UNA pestaña propia, la usa y la cierra pase lo que pase: `page` en el
 * flujo de comprobantes es la de RCEL y no se puede navegar sin romper la
 * sesión que usa el resto del scrape.
 */
function createFakeContext(options: { newPageThrows?: boolean } = {}) {
  const portalPage = {
    goto: vi.fn().mockResolvedValue(null),
    close: vi.fn().mockResolvedValue(undefined),
    setDefaultTimeout: vi.fn(),
  }
  const context = {
    portalPage,
    newPage: vi.fn().mockImplementation(() =>
      options.newPageThrows ? Promise.reject(new Error("sin memoria")) : Promise.resolve(portalPage)
    ),
  }
  return context
}

describe("scrapeMonotributoBestEffort", () => {
  it("devuelve la categoría cuando el step la trae", async () => {
    const context = createFakeContext()
    const scrape = vi.fn().mockResolvedValue({ success: true, info: INFO })

    const result = await scrapeMonotributoBestEffort(context as never, scrape)

    expect(result).toEqual(INFO)
  })

  it("abre su propia pestaña en el portal, no reusa la de RCEL", async () => {
    const context = createFakeContext()
    const scrape = vi.fn().mockResolvedValue({ success: true, info: INFO })

    await scrapeMonotributoBestEffort(context as never, scrape)

    expect(context.newPage).toHaveBeenCalled()
    expect(context.portalPage.goto).toHaveBeenCalledWith(
      "https://portalcf.cloud.afip.gob.ar/portal/app/",
      expect.objectContaining({ waitUntil: "domcontentloaded" })
    )
    expect(scrape).toHaveBeenCalledWith(context.portalPage, context)
  })

  it("cierra su pestaña cuando el step tuvo éxito", async () => {
    const context = createFakeContext()
    const scrape = vi.fn().mockResolvedValue({ success: true, info: INFO })

    await scrapeMonotributoBestEffort(context as never, scrape)

    expect(context.portalPage.close).toHaveBeenCalled()
  })

  it("devuelve null y cierra la pestaña si el step explota", async () => {
    // Best-effort de verdad: los comprobantes ya están extraídos y no puede
    // tirar abajo el resultado del scrape.
    const context = createFakeContext()
    const scrape = vi.fn().mockRejectedValue(new Error("ARCA se cayó"))

    const result = await scrapeMonotributoBestEffort(context as never, scrape)

    expect(result).toBeNull()
    expect(context.portalPage.close).toHaveBeenCalled()
  })

  it("devuelve null si el step no encontró la categoría", async () => {
    const context = createFakeContext()
    const scrape = vi.fn().mockResolvedValue({ success: false, info: null, error: "no responde" })

    expect(await scrapeMonotributoBestEffort(context as never, scrape)).toBeNull()
  })

  it("descarta la info si el step la reporta como fallida", async () => {
    // `success` es la señal, no la presencia de `info`: un step que falló a mitad
    // de camino puede volver con datos a medias, y guardarlos como categoría
    // vigente es peor que no tener nada. Sin este caso, borrar el chequeo de
    // `success` de la implementación no rompe ningún test.
    const context = createFakeContext()
    const scrape = vi.fn().mockResolvedValue({ success: false, info: INFO })

    expect(await scrapeMonotributoBestEffort(context as never, scrape)).toBeNull()
  })

  it("devuelve null si no se puede ni abrir la pestaña", async () => {
    const context = createFakeContext({ newPageThrows: true })
    const scrape = vi.fn().mockResolvedValue({ success: true, info: INFO })

    expect(await scrapeMonotributoBestEffort(context as never, scrape)).toBeNull()
    expect(scrape).not.toHaveBeenCalled()
  })
})
