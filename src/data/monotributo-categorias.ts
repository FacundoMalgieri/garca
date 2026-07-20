/**
 * Monotributo category data.
 *
 * This data is updated twice a year (January and July) via GitHub Actions.
 * To update manually, run: npm run update-monotributo
 *
 * Source: https://www.arca.gob.ar/monotributo/categorias.asp
 * Last updated: 2026-07-20
 */

import type { MonotributoData } from "@/types/monotributo";

export const MONOTRIBUTO_DATA: MonotributoData = {
  categorias: [
    {
      categoria: "A",
      ingresosBrutos: 12009410.45,
      superficieAfectada: "Hasta 30 m2",
      energiaElectrica: "Hasta 3330 Kw",
      alquileres: 2792886.15,
      precioUnitarioMax: 716840.77,
      impuestoIntegrado: {
        servicios: 5585.77,
        venta: 5585.77
      },
      aportesSIPA: 18246.86,
      aportesObraSocial: 25694.55,
      total: {
        servicios: 49527.18,
        venta: 49527.18
      }
    },
    {
      categoria: "B",
      ingresosBrutos: 17595182.74,
      superficieAfectada: "Hasta 45 m2",
      energiaElectrica: "Hasta 5000 Kw",
      alquileres: 2792886.15,
      precioUnitarioMax: 716840.77,
      impuestoIntegrado: {
        servicios: 10612.98,
        venta: 10612.98
      },
      aportesSIPA: 20071.55,
      aportesObraSocial: 25694.55,
      total: {
        servicios: 56379.08,
        venta: 56379.08
      }
    },
    {
      categoria: "C",
      ingresosBrutos: 24670494.31,
      superficieAfectada: "Hasta 60 m2",
      energiaElectrica: "Hasta 6700 Kw",
      alquileres: 3816944.41,
      precioUnitarioMax: 716840.77,
      impuestoIntegrado: {
        servicios: 18246.86,
        venta: 16757.32
      },
      aportesSIPA: 22078.71,
      aportesObraSocial: 25694.55,
      total: {
        servicios: 66020.12,
        venta: 64530.58
      }
    },
    {
      categoria: "D",
      ingresosBrutos: 30628651.43,
      superficieAfectada: "Hasta 85 m2",
      energiaElectrica: "Hasta 10000 Kw",
      alquileres: 3816944.41,
      precioUnitarioMax: 716840.77,
      impuestoIntegrado: {
        servicios: 29790.79,
        venta: 27742.67
      },
      aportesSIPA: 24286.58,
      aportesObraSocial: 30535.56,
      total: {
        servicios: 84612.93,
        venta: 82564.81
      }
    },
    {
      categoria: "E",
      ingresosBrutos: 36028231.33,
      superficieAfectada: "Hasta 110 m2",
      energiaElectrica: "Hasta 13000 Kw",
      alquileres: 4841002.66,
      precioUnitarioMax: 716840.77,
      impuestoIntegrado: {
        servicios: 55857.73,
        venta: 44313.79
      },
      aportesSIPA: 26715.24,
      aportesObraSocial: 37238.48,
      total: {
        servicios: 119811.45,
        venta: 108267.51
      }
    },
    {
      categoria: "F",
      ingresosBrutos: 45151659.41,
      superficieAfectada: "Hasta 150 m2",
      energiaElectrica: "Hasta 16500 Kw",
      alquileres: 4841002.66,
      precioUnitarioMax: 716840.77,
      impuestoIntegrado: {
        servicios: 78573.2,
        venta: 57719.64
      },
      aportesSIPA: 29386.76,
      aportesObraSocial: 42824.25,
      total: {
        servicios: 150784.21,
        venta: 129930.65
      }
    },
    {
      categoria: "G",
      ingresosBrutos: 53995798.87,
      superficieAfectada: "Hasta 200 m2",
      energiaElectrica: "Hasta 20000 Kw",
      alquileres: 5771964.69,
      precioUnitarioMax: 716840.77,
      impuestoIntegrado: {
        servicios: 142995.76,
        venta: 71497.87
      },
      aportesSIPA: 41141.46,
      aportesObraSocial: 46175.72,
      total: {
        servicios: 230312.94,
        venta: 158815.05
      }
    },
    {
      categoria: "H",
      ingresosBrutos: 81924660.37,
      superficieAfectada: "Hasta 200 m2",
      energiaElectrica: "Hasta 20000 Kw",
      alquileres: 8378658.45,
      precioUnitarioMax: 716840.77,
      impuestoIntegrado: {
        servicios: 409623.31,
        venta: 204811.64
      },
      aportesSIPA: 57598.04,
      aportesObraSocial: 55485.33,
      total: {
        servicios: 522706.68,
        venta: 317895.01
      }
    },
    {
      categoria: "I",
      ingresosBrutos: 91699761.9,
      superficieAfectada: "Hasta 200 m2",
      energiaElectrica: "Hasta 20000 Kw",
      alquileres: 8378658.45,
      precioUnitarioMax: 716840.77,
      impuestoIntegrado: {
        servicios: 814591.79,
        venta: 325836.71
      },
      aportesSIPA: 80637.26,
      aportesObraSocial: 68518.81,
      total: {
        servicios: 963747.86,
        venta: 474992.78
      }
    },
    {
      categoria: "J",
      ingresosBrutos: 105012519.2,
      superficieAfectada: "Hasta 200 m2",
      energiaElectrica: "Hasta 20000 Kw",
      alquileres: 8378658.45,
      precioUnitarioMax: 716840.77,
      impuestoIntegrado: {
        servicios: 977510.14,
        venta: 391004.07
      },
      aportesSIPA: 112892.16,
      aportesObraSocial: 76897.46,
      total: {
        servicios: 1167299.76,
        venta: 580793.69
      }
    },
    {
      categoria: "K",
      ingresosBrutos: 126610838.75,
      superficieAfectada: "Hasta 200 m2",
      energiaElectrica: "Hasta 20000 Kw",
      alquileres: 8378658.45,
      precioUnitarioMax: 716840.77,
      impuestoIntegrado: {
        servicios: 1368514.2,
        venta: 456171.4
      },
      aportesSIPA: 158049.02,
      aportesObraSocial: 87882.82,
      total: {
        servicios: 1614446.04,
        venta: 702103.24
      }
    }
  ],
  fechaVigencia: "1/08/2026",
  lastUpdated: "2026-07-20"
};

/**
 * Año vigente del régimen, derivado de la data (no del reloj): cuando GitHub
 * Actions actualiza `lastUpdated` al refrescar las categorías, este año se
 * mueve solo y arrastra todos los labels/SEO que lo referencian. Usar esto en
 * lugar de hardcodear el año en copy, títulos o metadata.
 */
export const MONOTRIBUTO_YEAR = Number(
  (MONOTRIBUTO_DATA.lastUpdated || new Date().toISOString()).slice(0, 4),
);
