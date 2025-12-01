/**
 * Monotributo category data.
 *
 * This data is updated twice a year (January and July) via GitHub Actions.
 * To update manually, run: npm run update-monotributo
 *
 * Source: https://www.arca.gob.ar/monotributo/categorias.asp
 * Last updated: 2025-12-01
 */

import type { MonotributoData } from "@/types/monotributo";

export const MONOTRIBUTO_DATA: MonotributoData = {
  categorias: [
    {
      categoria: "A",
      ingresosBrutos: 8992597.87,
      superficieAfectada: "Hasta 30 m2",
      energiaElectrica: "Hasta 3330 Kw",
      alquileres: 2091301.83,
      precioUnitarioMax: 536767.47,
      impuestoIntegrado: {
        servicios: 4182.6,
        venta: 4182.6,
      },
      aportesSIPA: 13663.17,
      aportesObraSocial: 19239.97,
      total: {
        servicios: 37085.74,
        venta: 37085.74,
      },
    },
    {
      categoria: "B",
      ingresosBrutos: 13175201.52,
      superficieAfectada: "Hasta 45 m2",
      energiaElectrica: "Hasta 5000 Kw",
      alquileres: 2091301.83,
      precioUnitarioMax: 536767.47,
      impuestoIntegrado: {
        servicios: 7946.95,
        venta: 7946.95,
      },
      aportesSIPA: 15029.49,
      aportesObraSocial: 19239.97,
      total: {
        servicios: 42216.41,
        venta: 42216.41,
      },
    },
    {
      categoria: "C",
      ingresosBrutos: 18473166.15,
      superficieAfectada: "Hasta 60 m2",
      energiaElectrica: "Hasta 6700 Kw",
      alquileres: 2858112.5,
      precioUnitarioMax: 536767.47,
      impuestoIntegrado: {
        servicios: 13663.17,
        venta: 12547.81,
      },
      aportesSIPA: 16532.44,
      aportesObraSocial: 19239.97,
      total: {
        servicios: 49435.58,
        venta: 48320.22,
      },
    },
    {
      categoria: "D",
      ingresosBrutos: 22934610.05,
      superficieAfectada: "Hasta 85 m2",
      energiaElectrica: "Hasta 10000 Kw",
      alquileres: 2858112.5,
      precioUnitarioMax: 536767.47,
      impuestoIntegrado: {
        servicios: 22307.22,
        venta: 20773.6,
      },
      aportesSIPA: 18185.68,
      aportesObraSocial: 22864.9,
      total: {
        servicios: 63357.8,
        venta: 61824.18,
      },
    },
    {
      categoria: "E",
      ingresosBrutos: 26977793.6,
      superficieAfectada: "Hasta 110 m2",
      energiaElectrica: "Hasta 13000 Kw",
      alquileres: 3624923.17,
      precioUnitarioMax: 536767.47,
      impuestoIntegrado: {
        servicios: 41826.04,
        venta: 33181.99,
      },
      aportesSIPA: 20004.25,
      aportesObraSocial: 27884.02,
      total: {
        servicios: 89714.31,
        venta: 81070.26,
      },
    },
    {
      categoria: "F",
      ingresosBrutos: 33809379.57,
      superficieAfectada: "Hasta 150 m2",
      energiaElectrica: "Hasta 16500 Kw",
      alquileres: 3624923.17,
      precioUnitarioMax: 536767.47,
      impuestoIntegrado: {
        servicios: 58835.29,
        venta: 43220.24,
      },
      aportesSIPA: 22004.67,
      aportesObraSocial: 32066.63,
      total: {
        servicios: 112906.59,
        venta: 97291.54,
      },
    },
    {
      categoria: "G",
      ingresosBrutos: 40431835.35,
      superficieAfectada: "Hasta 200 m2",
      energiaElectrica: "Hasta 20000 Kw",
      alquileres: 4322023.77,
      precioUnitarioMax: 536767.47,
      impuestoIntegrado: {
        servicios: 107074.65,
        venta: 53537.32,
      },
      aportesSIPA: 30806.54,
      aportesObraSocial: 34576.19,
      total: {
        servicios: 172457.38,
        venta: 118920.05,
      },
    },
    {
      categoria: "H",
      ingresosBrutos: 61344853.64,
      superficieAfectada: "Hasta 200 m2",
      energiaElectrica: "Hasta 20000 Kw",
      alquileres: 6273905.49,
      precioUnitarioMax: 536767.47,
      impuestoIntegrado: {
        servicios: 306724.27,
        venta: 153362.13,
      },
      aportesSIPA: 43129.16,
      aportesObraSocial: 41547.19,
      total: {
        servicios: 391400.62,
        venta: 238038.48,
      },
    },
    {
      categoria: "I",
      ingresosBrutos: 68664410.05,
      superficieAfectada: "Hasta 200 m2",
      energiaElectrica: "Hasta 20000 Kw",
      alquileres: 6273905.49,
      precioUnitarioMax: 536767.47,
      impuestoIntegrado: {
        servicios: 609963.03,
        venta: 243985.21,
      },
      aportesSIPA: 60380.82,
      aportesObraSocial: 51306.61,
      total: {
        servicios: 721650.46,
        venta: 355672.64,
      },
    },
    {
      categoria: "J",
      ingresosBrutos: 78632948.76,
      superficieAfectada: "Hasta 200 m2",
      energiaElectrica: "Hasta 20000 Kw",
      alquileres: 6273905.49,
      precioUnitarioMax: 536767.47,
      impuestoIntegrado: {
        servicios: 731955.63,
        venta: 292782.26,
      },
      aportesSIPA: 84533.15,
      aportesObraSocial: 57580.51,
      total: {
        servicios: 874069.29,
        venta: 434895.92,
      },
    },
    {
      categoria: "K",
      ingresosBrutos: 94805682.9,
      superficieAfectada: "Hasta 200 m2",
      energiaElectrica: "Hasta 20000 Kw",
      alquileres: 6273905.49,
      precioUnitarioMax: 536767.47,
      impuestoIntegrado: {
        servicios: 1024737.89,
        venta: 341579.3,
      },
      aportesSIPA: 118346.41,
      aportesObraSocial: 65806.3,
      total: {
        servicios: 1208890.6,
        venta: 525732.01,
      },
    },
  ],
  fechaVigencia: "1/12/2025",
};

