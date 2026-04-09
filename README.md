# GARCA

[![CI & Deploy](https://github.com/FacundoMalgieri/garca/actions/workflows/deploy.yml/badge.svg)](https://github.com/FacundoMalgieri/garca/actions/workflows/deploy.yml)
[![codecov](https://codecov.io/gh/FacundoMalgieri/garca/branch/main/graph/badge.svg)](https://codecov.io/gh/FacundoMalgieri/garca)

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?logo=buy-me-a-coffee&logoColor=black&style=flat-square)](https://buymeacoffee.com/facundo.malgieri)
[![PayPal](https://img.shields.io/badge/PayPal-00457C?logo=paypal&logoColor=white&style=flat-square)](https://paypal.me/facundomalgieri)

**Gestor Automático de Recuperación de Comprobantes de ARCA**

Una herramienta gratuita, segura y open source para recuperar, visualizar y analizar tus comprobantes desde el portal de ARCA. Funciona completamente en tu navegador - **tus datos nunca salen de tu dispositivo**.

> **⭐ Si GARCA te ahorra tiempo, por favor dejá una estrella en el repo y considerá [invitarme un café](https://buymeacoffee.com/facundo.malgieri)!**

---

## ✨ Características

### 📄 Recuperación de Comprobantes
- **Scraping automático** del portal de ARCA con Playwright
- **Soporte multi-moneda**: ARS, USD, EUR, JPY y más
- **Extracción de XMLs** para facturas de exportación (Factura E) con tipo de cambio oficial
- **Rango de fechas personalizable** (hasta 1 año)
- **Multi-empresa**: seleccioná entre tus empresas asociadas al CUIT

### 📊 Análisis Financiero
- **Totales mensuales y anuales** con conversión automática de divisas
- **Cálculo de Monotributo**: categoría actual, progreso, límites y alertas
- **Gráficos interactivos**: progreso acumulado, distribución por moneda, ingresos mensuales

### 📋 Gestión de Datos
- **Tabla de facturas** con filtros avanzados y ordenamiento multi-columna
- **Exportación completa**: PDF profesional, CSV para Excel, JSON para integración
- **Almacenamiento local**: datos persistidos en localStorage
- **Tema claro/oscuro** automático

### 🔒 Privacidad y Seguridad
- **100% client-side**: los datos nunca salen de tu navegador
- **Encriptación AES-256** de credenciales antes del envío
- **Sin almacenamiento de contraseñas**: solo se usan durante la consulta
- **Rate limiting y protección anti-bot** integrados
- **Código abierto**: completamente auditable

---

## 🚀 Demo en Vivo

Probá GARCA sin necesidad de loguearte: **[Ver Demo →](https://garca.app)**

La demo usa datos ficticios para que explores todas las funcionalidades.

---

## 💻 Desarrollo Local

### Requisitos
- Node.js 22+
- npm

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/FacundoMalgieri/garca.git
cd garca

# Instalar dependencias
npm install

# Instalar navegador para Playwright
npx playwright install chromium

# Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en tu navegador.

### Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Ejecutar ESLint
npm run lint:fix     # ESLint con auto-fix
npm run typecheck    # Verificar tipos
npm run test         # Ejecutar tests
npm run test:coverage # Tests con coverage
```

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19 + React Compiler |
| **Styling** | Tailwind CSS 4 |
| **Charts** | Recharts |
| **Scraping** | Playwright |
| **Testing** | Vitest + React Testing Library |
| **Language** | TypeScript (strict mode) |
| **Deploy** | Docker + Render |

---

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/arca/          # API de scraping
│   ├── ingresar/          # Página de login
│   └── panel/             # Dashboard principal
├── components/            # Componentes React (arquitectura modular)
│   ├── ui/               # Componentes base (Card, Dropdown)
│   └── [Feature]/        # index.tsx + index.test.tsx
├── contexts/             # React Context (InvoiceContext)
├── hooks/                # Custom hooks
├── lib/                  # Lógica de negocio
│   ├── scrapers/        # Scrapers de ARCA
│   ├── security/        # Rate limiting, Turnstile, anti-bot
│   └── utils/           # Utilidades compartidas
└── types/               # Tipos TypeScript
```

---

## 🐳 Docker

```bash
# Build
docker build -t garca .

# Run
docker run -p 3000:3000 garca
```

---

## ⚠️ Limitaciones

- **Velocidad**: el scraping tarda 30-90 segundos dependiendo de la cantidad de comprobantes
- **CAPTCHA**: no puede resolver CAPTCHAs automáticamente
- **Dependencia del HTML**: si ARCA cambia su estructura, requiere actualización
- **Rate limiting de ARCA**: consultas muy frecuentes pueden ser bloqueadas temporalmente

---

## 🔐 Seguridad

- Las credenciales se encriptan con AES-256 antes de enviarse al servidor
- El servidor solo las usa para el scraping y las descarta inmediatamente
- Los datos de facturas se almacenan únicamente en localStorage del navegador
- No hay base de datos ni almacenamiento en servidor
- Protección anti-bot con Cloudflare Turnstile
- Rate limiting por IP (30 requests/minuto)

---

## ☕ Apoyá el Proyecto

Si GARCA te resulta útil, considerá apoyar el desarrollo:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?logo=buy-me-a-coffee&logoColor=black&style=for-the-badge)](https://buymeacoffee.com/facundo.malgieri)
[![PayPal](https://img.shields.io/badge/PayPal-00457C?logo=paypal&logoColor=white&style=for-the-badge)](https://paypal.me/facundomalgieri)

También podés:
- ⭐ Dejar una estrella en GitHub
- 🐛 Reportar bugs o sugerir mejoras
- 🔀 Contribuir con código

---

## 📄 Legal

- [Licencia MIT](LICENSE)
- [Política de Privacidad](PRIVACY.md)
- [Términos y Condiciones](TERMS.md)

---

## ⚠️ Disclaimer

Este software no está afiliado, asociado, autorizado, respaldado por, o de ninguna manera oficialmente conectado con ARCA (Agencia de Recaudación y Control Aduanero) ni con ningún organismo gubernamental argentino.

El uso de esta herramienta es bajo tu propia responsabilidad. Asegurate de cumplir con los términos de servicio de ARCA.

---

Hecho con ❤️ para la comunidad de desarrolladores y monotributistas argentinos 🇦🇷
