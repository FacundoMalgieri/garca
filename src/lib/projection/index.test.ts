import { describe, expect,it } from "vitest"

import { MONOTRIBUTO_DATA } from "@/data/monotributo-categorias"

import {
  addMonths,
  calculateProjection,
  distributeEvenly,
  formatMonthKey,
  getAutoTargetCategory,
  getCategoriaByLetter,
  getCategoriaForTotal,
  getCurrentMonth,
  getFutureMonths,
  getMonthLabel,
  getMonthShortLabel,
  getNextRecategorizacionDates,
  getRecategorizacionWindow,
  getRecommendedMonthlyAmount,
  isMonthCurrentOrFuture,
  isMonthInPast,
  parseMonthKey,
  roundToNearest,
  sumWindow,
} from "./index"

describe("projection utilities", () => {
  describe("formatMonthKey", () => {
    it("formats date to YYYY-MM", () => {
      expect(formatMonthKey(new Date(2026, 0, 15))).toBe("2026-01")
      expect(formatMonthKey(new Date(2026, 11, 1))).toBe("2026-12")
    })
  })

  describe("parseMonthKey", () => {
    it("parses YYYY-MM to Date", () => {
      const date = parseMonthKey("2026-07")
      expect(date.getFullYear()).toBe(2026)
      expect(date.getMonth()).toBe(6) // July is 6 (0-indexed)
    })
  })

  describe("addMonths", () => {
    it("adds months correctly", () => {
      expect(addMonths("2026-01", 3)).toBe("2026-04")
      expect(addMonths("2026-11", 2)).toBe("2027-01")
      expect(addMonths("2026-07", -6)).toBe("2026-01")
    })
  })

  describe("getMonthLabel", () => {
    it("returns Spanish month label", () => {
      expect(getMonthLabel("2026-01")).toBe("Enero 2026")
      expect(getMonthLabel("2026-07")).toBe("Julio 2026")
      expect(getMonthLabel("2026-12")).toBe("Diciembre 2026")
    })
  })

  describe("getMonthShortLabel", () => {
    it("returns short month label", () => {
      expect(getMonthShortLabel("2026-01")).toBe("Ene '26")
      expect(getMonthShortLabel("2026-07")).toBe("Jul '26")
    })
  })

  describe("getNextRecategorizacionDates", () => {
    it("returns correct dates when in first half of year", () => {
      const today = new Date(2026, 1, 15) // Feb 2026
      const dates = getNextRecategorizacionDates(today)
      
      expect(dates.length).toBe(4)
      expect(dates[0].month).toBe("2026-07") // July 2026
      expect(dates[0].label).toBe("Julio 2026")
      expect(dates[1].month).toBe("2027-01") // January 2027
    })

    it("returns correct dates when in second half of year", () => {
      const today = new Date(2026, 7, 15) // Aug 2026
      const dates = getNextRecategorizacionDates(today)
      
      expect(dates[0].month).toBe("2027-01") // January 2027
      expect(dates[1].month).toBe("2027-07") // July 2027
    })

    it("includes 12-month window for each date", () => {
      const today = new Date(2026, 1, 15)
      const dates = getNextRecategorizacionDates(today)
      
      expect(dates[0].ventana.length).toBe(12)
      expect(dates[0].ventana[0]).toBe("2025-07") // July 2025
      expect(dates[0].ventana[11]).toBe("2026-06") // June 2026
    })
  })

  describe("getRecategorizacionWindow", () => {
    it("returns 12 months before target", () => {
      const window = getRecategorizacionWindow("2026-07")
      
      expect(window.length).toBe(12)
      expect(window[0]).toBe("2025-07")
      expect(window[11]).toBe("2026-06")
    })
  })

  describe("getCurrentMonth", () => {
    it("returns current month key", () => {
      const today = new Date(2026, 1, 15)
      expect(getCurrentMonth(today)).toBe("2026-02")
    })
  })

  describe("getFutureMonths", () => {
    it("returns months from current to target (exclusive)", () => {
      const today = new Date(2026, 1, 15) // Feb 2026
      const months = getFutureMonths("2026-07", today)
      
      expect(months.length).toBe(5)
      expect(months[0]).toBe("2026-02")
      expect(months[4]).toBe("2026-06")
    })
  })

  describe("isMonthInPast", () => {
    it("correctly identifies past months", () => {
      const today = new Date(2026, 5, 15) // June 2026
      
      expect(isMonthInPast("2026-01", today)).toBe(true)
      expect(isMonthInPast("2026-06", today)).toBe(false)
      expect(isMonthInPast("2026-07", today)).toBe(false)
    })
  })

  describe("isMonthCurrentOrFuture", () => {
    it("correctly identifies current and future months", () => {
      const today = new Date(2026, 5, 15) // June 2026
      
      expect(isMonthCurrentOrFuture("2026-01", today)).toBe(false)
      expect(isMonthCurrentOrFuture("2026-06", today)).toBe(true)
      expect(isMonthCurrentOrFuture("2026-07", today)).toBe(true)
    })
  })

  describe("getCategoriaForTotal", () => {
    it("returns correct category for income", () => {
      const categorias = MONOTRIBUTO_DATA.categorias
      
      // Under category A limit
      const catA = getCategoriaForTotal(5000000, categorias)
      expect(catA?.categoria).toBe("A")
      
      // Under category B limit but over A
      const catB = getCategoriaForTotal(12000000, categorias)
      expect(catB?.categoria).toBe("B")
      
      // High income
      const catH = getCategoriaForTotal(65000000, categorias)
      expect(catH?.categoria).toBe("H")
    })

    it("returns highest category when exceeding all limits", () => {
      const categorias = MONOTRIBUTO_DATA.categorias
      const cat = getCategoriaForTotal(999999999999, categorias)
      expect(cat?.categoria).toBe("K")
    })
  })

  describe("getCategoriaByLetter", () => {
    it("finds category by letter", () => {
      const categorias = MONOTRIBUTO_DATA.categorias
      
      const catH = getCategoriaByLetter("H", categorias)
      expect(catH?.categoria).toBe("H")
      expect(catH?.ingresosBrutos).toBeGreaterThan(0)
    })

    it("returns null for invalid letter", () => {
      const categorias = MONOTRIBUTO_DATA.categorias
      expect(getCategoriaByLetter("Z", categorias)).toBeNull()
    })
  })

  describe("sumWindow", () => {
    it("sums historical and projected amounts", () => {
      const today = new Date(2026, 5, 15) // June 2026
      const ventana = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07"]
      const historical = [
        { month: "2026-01", totalArs: 1000000, invoiceCount: 2 },
        { month: "2026-02", totalArs: 1500000, invoiceCount: 3 },
        { month: "2026-03", totalArs: 2000000, invoiceCount: 4 },
      ]
      const projections = {
        "2026-06": 3000000,
        "2026-07": 2500000,
      }
      
      const result = sumWindow(ventana, historical, projections, today)
      
      expect(result.historico).toBe(4500000) // Jan + Feb + Mar
      expect(result.proyectado).toBe(5500000) // Jun + Jul
      expect(result.total).toBe(10000000)
    })
  })

  describe("getAutoTargetCategory", () => {
    it("returns the category that fits the historical income", () => {
      const categorias = MONOTRIBUTO_DATA.categorias
      
      // Income fits in A → target should be A (stay in current)
      const target = getAutoTargetCategory(5000000, categorias)
      expect(target?.categoria).toBe("A")
    })

    it("returns highest category when exceeding all limits", () => {
      const categorias = MONOTRIBUTO_DATA.categorias
      
      const target = getAutoTargetCategory(999999999999, categorias)
      expect(target?.categoria).toBe("K")
    })

    it("returns A when income is exactly at A limit", () => {
      const categorias = MONOTRIBUTO_DATA.categorias
      const catA = getCategoriaByLetter("A", categorias)
      if (!catA) return
      
      const target = getAutoTargetCategory(catA.ingresosBrutos, categorias)
      expect(target?.categoria).toBe("A")
    })

    it("returns the minimum category that accommodates the income", () => {
      const categorias = MONOTRIBUTO_DATA.categorias
      
      // 40M exceeds F (38.6M) but fits in G (46.2M) → target is G
      const target = getAutoTargetCategory(40000000, categorias)
      expect(target?.categoria).toBe("G")
    })

    it("targets H when historical income is in H range", () => {
      const categorias = MONOTRIBUTO_DATA.categorias
      
      // 55M exceeds G (46.2M) but fits in H (70.1M) → stay in H
      const target = getAutoTargetCategory(55000000, categorias)
      expect(target?.categoria).toBe("H")
    })
  })

  describe("getRecommendedMonthlyAmount", () => {
    it("calculates correct recommendation", () => {
      const categorias = MONOTRIBUTO_DATA.categorias
      const targetCat = getCategoriaByLetter("H", categorias)
      const margen = 200000
      const mesesFuturos = 5
      const totalHistorico = 50000000
      
      const recommended = getRecommendedMonthlyAmount(
        targetCat,
        margen,
        mesesFuturos,
        totalHistorico,
        categorias
      )
      
      // Expected: (70113407.33 - 200000 - 50000000) / 5 = ~3982681
      expect(recommended).toBeGreaterThan(0)
      expect(recommended).toBeLessThan(5000000)
    })

    it("returns 0 when already over limit", () => {
      const categorias = MONOTRIBUTO_DATA.categorias
      const targetCat = getCategoriaByLetter("A", categorias)
      const margen = 200000
      const mesesFuturos = 5
      const totalHistorico = 15000000 // Way over A limit
      
      const recommended = getRecommendedMonthlyAmount(
        targetCat,
        margen,
        mesesFuturos,
        totalHistorico,
        categorias
      )
      
      expect(recommended).toBe(0)
    })
  })

  describe("calculateProjection", () => {
    it("calculates full projection result", () => {
      const today = new Date(2026, 1, 15) // Feb 2026
      const ventana = getRecategorizacionWindow("2026-07")
      const historical = [
        { month: "2025-07", totalArs: 4000000, invoiceCount: 5 },
        { month: "2025-08", totalArs: 4500000, invoiceCount: 6 },
        { month: "2025-09", totalArs: 5000000, invoiceCount: 7 },
        { month: "2025-10", totalArs: 5500000, invoiceCount: 8 },
        { month: "2025-11", totalArs: 6000000, invoiceCount: 9 },
        { month: "2025-12", totalArs: 6500000, invoiceCount: 10 },
        { month: "2026-01", totalArs: 7000000, invoiceCount: 11 },
      ]
      const projections = {
        "2026-02": 7500000,
        "2026-03": 8000000,
        "2026-04": 8500000,
        "2026-05": 9000000,
        "2026-06": 9500000,
      }
      const categorias = MONOTRIBUTO_DATA.categorias
      
      const result = calculateProjection(
        ventana,
        historical,
        projections,
        null, // no target category
        200000,
        categorias,
        today
      )
      
      expect(result.totalVentana).toBeGreaterThan(0)
      expect(result.totalHistorico).toBe(38500000)
      expect(result.totalProyectado).toBe(42500000)
      expect(result.categoriaResultante).toBeDefined()
      expect(result.mesesFuturos).toBe(5)
      expect(result.ventana.length).toBe(12)
    })
  })

  describe("distributeEvenly", () => {
    it("distributes amount across months", () => {
      const months = ["2026-02", "2026-03", "2026-04", "2026-05", "2026-06"]
      const result = distributeEvenly(10000000, months)
      
      expect(Object.keys(result).length).toBe(5)
      expect(result["2026-02"]).toBe(2000000)
      expect(result["2026-06"]).toBe(2000000)
    })

    it("returns empty object for no months", () => {
      expect(distributeEvenly(10000000, [])).toEqual({})
    })
  })

  describe("roundToNearest", () => {
    it("rounds to nearest increment", () => {
      expect(roundToNearest(123456, 10000)).toBe(120000)
      expect(roundToNearest(125000, 10000)).toBe(130000)
      expect(roundToNearest(1234567, 100000)).toBe(1200000)
    })
  })
})


