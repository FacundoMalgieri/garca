/**
 * Monotributo category data.
 *
 * This data is updated twice a year (January and July) via GitHub Actions.
 * To update manually, run: npm run update-monotributo
 *
 * Source: https://www.arca.gob.ar/monotributo/categorias.asp
 * Last updated: 2026-01-20
 */

import type { MonotributoData } from "@/types/monotributo";

export const MONOTRIBUTO_DATA: MonotributoData = {
  categorias: [
    {
      categoria: "A",
      ingresosBrutos: 10277988.13,
      superficieAfectada: "Hasta 30 m2",
      energiaElectrica: "Hasta 3330 Kw",
      alquileres: 2390229.8,
      precioUnitarioMax: 613492.31,
      impuestoIntegrado: {
        servicios: 4780.46,
        venta: 4780.46
      },
      aportesSIPA: 15616.17,
      aportesObraSocial: 21990.11,
      total: {
        servicios: 42386.74,
        venta: 42386.74
      }
    },
    {
      categoria: "B",
      ingresosBrutos: 15058447.71,
      superficieAfectada: "Hasta 45 m2",
      energiaElectrica: "Hasta 5000 Kw",
      alquileres: 2390229.8,
      precioUnitarioMax: 613492.31,
      impuestoIntegrado: {
        servicios: 9082.88,
        venta: 9082.88
      },
      aportesSIPA: 17177.79,
      aportesObraSocial: 21990.11,
      total: {
        servicios: 48250.78,
        venta: 48250.78
      }
    },
    {
      categoria: "C",
      ingresosBrutos: 21113696.52,
      superficieAfectada: "Hasta 60 m2",
      energiaElectrica: "Hasta 6700 Kw",
      alquileres: 3266647.39,
      precioUnitarioMax: 613492.31,
      impuestoIntegrado: {
        servicios: 15616.17,
        venta: 14341.38
      },
      aportesSIPA: 18895.57,
      aportesObraSocial: 21990.11,
      total: {
        servicios: 56501.85,
        venta: 55227.06
      }
    },
    {
      categoria: "D",
      ingresosBrutos: 26212853.42,
      superficieAfectada: "Hasta 85 m2",
      energiaElectrica: "Hasta 10000 Kw",
      alquileres: 3266647.39,
      precioUnitarioMax: 613492.31,
      impuestoIntegrado: {
        servicios: 25495.79,
        venta: 23742.95
      },
      aportesSIPA: 20785.13,
      aportesObraSocial: 26133.18,
      total: {
        servicios: 72414.1,
        venta: 70661.26
      }
    },
    {
      categoria: "E",
      ingresosBrutos: 30833964.37,
      superficieAfectada: "Hasta 110 m2",
      energiaElectrica: "Hasta 13000 Kw",
      alquileres: 4143064.98,
      precioUnitarioMax: 613492.31,
      impuestoIntegrado: {
        servicios: 47804.6,
        venta: 37924.98
      },
      aportesSIPA: 22863.64,
      aportesObraSocial: 31869.73,
      total: {
        servicios: 102537.97,
        venta: 92658.35
      }
    },
    {
      categoria: "F",
      ingresosBrutos: 38642048.36,
      superficieAfectada: "Hasta 150 m2",
      energiaElectrica: "Hasta 16500 Kw",
      alquileres: 4143064.98,
      precioUnitarioMax: 613492.31,
      impuestoIntegrado: {
        servicios: 67245.13,
        venta: 49398.08
      },
      aportesSIPA: 25150,
      aportesObraSocial: 36650.19,
      total: {
        servicios: 129045.32,
        venta: 111198.27
      }
    },
    {
      categoria: "G",
      ingresosBrutos: 46211109.37,
      superficieAfectada: "Hasta 200 m2",
      energiaElectrica: "Hasta 20000 Kw",
      alquileres: 4939808.23,
      precioUnitarioMax: 613492.31,
      impuestoIntegrado: {
        servicios: 122379.76,
        venta: 61189.87
      },
      aportesSIPA: 35210,
      aportesObraSocial: 39518.47,
      total: {
        servicios: 197108.23,
        venta: 135918.34
      }
    },
    {
      categoria: "H",
      ingresosBrutos: 70113407.33,
      superficieAfectada: "Hasta 200 m2",
      energiaElectrica: "Hasta 20000 Kw",
      alquileres: 7170689.39,
      precioUnitarioMax: 613492.31,
      impuestoIntegrado: {
        servicios: 350567.04,
        venta: 175283.51
      },
      aportesSIPA: 49294,
      aportesObraSocial: 47485.89,
      total: {
        servicios: 447346.93,
        venta: 272063.4
      }
    },
    {
      categoria: "I",
      ingresosBrutos: 78479211.62,
      superficieAfectada: "Hasta 200 m2",
      energiaElectrica: "Hasta 20000 Kw",
      alquileres: 7170689.39,
      precioUnitarioMax: 613492.31,
      impuestoIntegrado: {
        servicios: 697150.35,
        venta: 278860.14
      },
      aportesSIPA: 69011.6,
      aportesObraSocial: 58640.31,
      total: {
        servicios: 824802.26,
        venta: 406512.05
      }
    },
    {
      categoria: "J",
      ingresosBrutos: 89872640.3,
      superficieAfectada: "Hasta 200 m2",
      energiaElectrica: "Hasta 20000 Kw",
      alquileres: 7170689.39,
      precioUnitarioMax: 613492.31,
      impuestoIntegrado: {
        servicios: 836580.42,
        venta: 334632.18
      },
      aportesSIPA: 96616.24,
      aportesObraSocial: 65810.99,
      total: {
        servicios: 999007.65,
        venta: 497059.41
      }
    },
    {
      categoria: "K",
      ingresosBrutos: 108357084.05,
      superficieAfectada: "Hasta 200 m2",
      energiaElectrica: "Hasta 20000 Kw",
      alquileres: 7170689.39,
      precioUnitarioMax: 613492.31,
      impuestoIntegrado: {
        servicios: 1171212.59,
        venta: 390404.2
      },
      aportesSIPA: 135262.74,
      aportesObraSocial: 75212.57,
      total: {
        servicios: 1381687.9,
        venta: 600879.51
      }
    }
  ],
  fechaVigencia: ""
};
