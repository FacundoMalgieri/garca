# Política de Seguridad

## Versiones Soportadas

Solo la última versión desplegada en [garca.app](https://garca.app) recibe actualizaciones de seguridad.

## Reportar una Vulnerabilidad

**No abras un issue público para reportar vulnerabilidades de seguridad.**

En su lugar, enviá un reporte privado a través de [GitHub Security Advisories](https://github.com/FacundoMalgieri/garca/security/advisories/new).

Incluí en tu reporte:

- Descripción de la vulnerabilidad
- Pasos para reproducirla
- Impacto potencial
- Sugerencia de solución (si tenés una)

### Qué esperar

- **Confirmación** dentro de 48 horas
- **Evaluación inicial** dentro de 7 días
- **Resolución** según la severidad (críticas en 48-72h, altas en 1-2 semanas)
- **Crédito público** en el release que incluya el fix (salvo que prefieras anonimato)

## Alcance

Están dentro del alcance:

- Exposición de credenciales o datos del usuario
- Inyección de código (XSS, CSP bypass)
- Bypass de rate limiting o protecciones anti-bot
- Vulnerabilidades en dependencias que afecten a GARCA
- Problemas en el flujo de encriptación de credenciales

Fuera del alcance:

- Ataques de fuerza bruta contra ARCA (es responsabilidad de ARCA)
- Problemas que requieran acceso físico al dispositivo del usuario
- Ingeniería social

## Arquitectura de Seguridad

- **Credenciales**: encriptadas con AES-256-GCM antes de salir del navegador
- **Almacenamiento**: exclusivamente localStorage del navegador, sin base de datos en servidor
- **Servidor de scraping**: las credenciales se desencriptan en memoria y se descartan inmediatamente
- **Protección anti-bot**: Cloudflare Turnstile
- **Rate limiting**: 30 requests/minuto por IP
- **CSP**: Content Security Policy restrictiva configurada en headers
- **Código abierto**: completamente auditable en este repositorio
