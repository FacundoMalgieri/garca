import { describe, expect, it } from "vitest"

import { getLastRecategorizacionDate, getNextRecategorizacionDates } from "@/lib/projection"

import { computeCobertura } from "./cobertura"

/** 11/08/2026: el día de la sesión que expuso el bug. */
const TODAY = new Date(2026, 7, 11)

/** Ventana vigente ese día: Jul 2025 - Jun 2026 (recategorización de Julio 2026). */
const VENTANA_VIGENTE = getLastRecategorizacionDate(TODAY).ventana
/** Ventana en curso ese día: Ene - Dic 2026 (recategorización de Enero 2027). */
const VENTANA_PROXIMA = getNextRecategorizacionDates(TODAY)[0].ventana

describe("computeCobertura", () => {
  it("marca la ventana como completa cuando la consulta la cubre entera", () => {
    const cobertura = computeCobertura(VENTANA_VIGENTE, { from: "2025-07-01", to: "2026-06-30" }, TODAY)

    expect(cobertura.estado).toBe("completa")
    expect(cobertura.mesesCubiertos).toBe(12)
    expect(cobertura.mesesCerrados).toBe(12)
    expect(cobertura.faltantes).toEqual([])
  })

  it("detecta el hueco del rango por defecto: 12 meses hacia atrás NO cubren la ventana vigente", () => {
    // getDefaultDateRange() el 11/08/2026 → 11/08/2025 a 11/08/2026.
    // Julio 2025 nunca se consultó y Agosto 2025 quedó cortado al día 11.
    const cobertura = computeCobertura(VENTANA_VIGENTE, { from: "2025-08-11", to: "2026-08-11" }, TODAY)

    expect(cobertura.estado).toBe("parcial")
    expect(cobertura.faltantes).toEqual(["2025-07", "2025-08"])
    expect(cobertura.mesesCubiertos).toBe(10)
  })

  it("un mes consultado a medias no cuenta como cubierto", () => {
    // Sólo falta el último día de Junio: el total de ese mes queda corto igual.
    const cobertura = computeCobertura(VENTANA_VIGENTE, { from: "2025-07-01", to: "2026-06-29" }, TODAY)

    expect(cobertura.estado).toBe("parcial")
    expect(cobertura.faltantes).toEqual(["2026-06"])
  })

  it("cuenta los bordes exactos del mes como cubiertos", () => {
    const cobertura = computeCobertura(["2026-02"], { from: "2026-02-01", to: "2026-02-28" }, TODAY)

    expect(cobertura.estado).toBe("completa")
    expect(cobertura.faltantes).toEqual([])
  })

  it("ignora los meses de la ventana que todavía no cerraron", () => {
    // Ventana en curso: sólo Ene-Jul 2026 cerraron. Ago-Dic 2026 no pueden
    // estar cubiertos por una consulta que termina hoy, y no deben contar.
    const cobertura = computeCobertura(VENTANA_PROXIMA, { from: "2025-08-11", to: "2026-08-11" }, TODAY)

    expect(cobertura.estado).toBe("completa")
    expect(cobertura.mesesCerrados).toBe(7)
    expect(cobertura.mesesCubiertos).toBe(7)
    expect(cobertura.faltantes).toEqual([])
  })

  it("reporta cobertura desconocida cuando no se sabe qué rango se consultó", () => {
    // Sesiones guardadas por versiones anteriores: no persistían el rango.
    const cobertura = computeCobertura(VENTANA_VIGENTE, null, TODAY)

    expect(cobertura.estado).toBe("desconocida")
    expect(cobertura.faltantes).toEqual([])
  })
})
