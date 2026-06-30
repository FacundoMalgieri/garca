# Rediseño de la landing (`/`) — Diseño

> Fecha: 2026-06-30 · Branch: `feat/landing-redesign` (desde `main`)

## Problema

La landing actual "parece hecha con IA": logo centrado sobre fondo plano, hero
genérico ("Bienvenido a GARCA"), 6 feature cards sueltas en grid, paleta
blue/cyan/violet genérica que no usa los tokens de marca. Falta marketing, UI,
UX e identidad.

Contexto de negocio (Umami/GSC, ~30d): ~620 pageviews/mes, ~98% tráfico
orgánico (SEO de nicho fiscal/freelancer), 73% Argentina, bounce ~69%. La home
debe **convertir** ese tráfico de SEO mejor.

## Dirección elegida

**Fintech de confianza** (tipo Wise/Mercury): jerarquía tipográfica fuerte,
mucho aire, el producto real a la vista, data viz, la privacidad como argumento
de venta. Serio pero moderno.

### Decisiones tomadas en brainstorming

- **Colores**: mantener la paleta actual por ahora (el color de marca no
  contrasta bien en fondos oscuros y ya está afinado para ser legible). El
  juego de color queda **abierto** para explorar durante el rediseño de layout,
  no es un color-overhaul ahora. Foco: layout, estructura, jerarquía.
- **Hero**: split — copy + CTAs + señal de privacidad a la izquierda; mockup
  real del panel (construido en JSX, no screenshot) a la derecha.
- **Conversión**: dos caminos con igual peso — Calculadora (sin login,
  low-friction) e Ingresar (la app).
- **Privacidad**: señal fuerte en el hero **y** sección propia dedicada.
- **Animaciones**: conservar la coreografía de scroll existente
  (scroll/IntersectionObserver de `HomeSections.tsx`), solo afinar
  timing/intensidad. No reescribir la mecánica.
- **Secciones**: replantear el inventario desde cero (algunas se fusionan,
  reordenan o bajan de jerarquía).

## Inventario de secciones (orden = embudo)

| # | Sección | Qué es / por qué |
|---|---------|------------------|
| 1 | **Hero split** | Izq: titular orientado a beneficio + subtítulo + 2 CTAs de igual peso (Calculadora / Ingresar) + badge de privacidad ("100% en tu browser · AES-256"). Der: mockup del panel en JSX (barra de progreso de categoría Monotributo + mini-gráfico + fila de comprobantes), datos mock, micro-animado. |
| 2 | **Privacidad / confianza** | Sección dedicada — el diferenciador. 3 pilares: cifrado AES-256 client-side · sin base de datos (nada se guarda) · open source (link GitHub). |
| 3 | **Qué hace / cómo funciona** | Fusiona las 6 feature cards + multi-moneda en una narrativa clara de capacidades agrupadas (recuperar comprobantes, análisis visual, categoría, proyección, multi-moneda, export). Menos "AI grid". |
| 4 | **Guías y recursos** | Más peso que hoy: la guía pilar de Monotributo + lecturas cortas + "ver todas". Es lo que rankea y trae el tráfico SEO → lo capitalizamos arriba en el embudo. |
| 5 | **Calculadora (sin login)** | CTA fuerte a `/calculadora-monotributo`. Gancho low-friction para el lector SEO. |
| 6 | **FAQ** | Mantener (bueno para SEO/JSON-LD), repintar. |
| 7 | **Apoyá el proyecto** | Donaciones, más discreto y abajo (no compite con la conversión). |

Cambios clave vs hoy:
- Privacidad sube a sección propia (#2).
- Multi-moneda deja de ser sección entera (se absorbe en #3).
- **Guías suben antes de la calculadora** (#4 antes de #5) — el lector SEO ve
  contenido familiar primero, luego la herramienta.
- Donaciones bajan a #7.

## Plan técnico

- **Mockup del panel**: componente JSX nuevo (no imagen) → nítido, themeable
  dark/light, animable. Reutiliza tokens/estilos reales del panel donde aplique.
- **Animaciones**: conservar el sistema scroll/IntersectionObserver de
  `HomeSections.tsx`; afinar timing/intensidad. No reescribir la mecánica.
- **Refactor**: dividir `HomeSections.tsx` (915 líneas, hace demasiado) en
  componentes por sección bajo `src/components/landing/sections/`. Cada sección
  = un componente con una responsabilidad clara.
- **Funnel/tracking intacto**: `TrackedLandingCtaLink` con evento
  `funnel_landing_cta` (`{target: 'ingresar'|'calculadora'}`) y
  `funnel_landing_demo_open` se mantienen en los CTAs equivalentes.
- **SEO intacto**: metadata + JSON-LD de la home sin degradar (ver
  `src/lib/seo/page-schemas.ts`); FAQ sigue presente para el FAQ schema.
- **Ads**: `NativeAd` queda al fondo, fuera del flujo de conversión.
- **Server/Client**: mantener el hero como contenido server-rendered (LCP) con
  los trozos interactivos (parallax, demo, scroll) como Client Components,
  igual que hoy.

## Restricciones / no romper

- Funnel ni eventos Umami.
- Posicionamiento de privacidad (100% en browser, AES-256, nada se guarda).
- SEO (metadata + JSON-LD).
- Soporte dark/light (`ThemeProvider`).
- En `localhost` el iframe de `NativeAd` tira error CSP — es dev-only, ignorar.

## Fuera de alcance (YAGNI)

- Color-overhaul / re-tematización completa (queda para explorar después).
- Tocar `/panel`, `/calculadora-monotributo` u otras páginas.
- Cambios de copy en guías existentes.
- Cerrar el branch de guías (`feat/guias-cobro-exterior`) — independiente.
