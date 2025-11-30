# Política de Privacidad

**Última actualización:** Noviembre 2025

## Resumen

GARCA es una herramienta que funciona **100% en tu navegador**. No recopilamos, almacenamos ni transmitimos tus datos personales a ningún servidor externo.

---

## Información que Procesamos

### Credenciales de ARCA (CUIT y Contraseña)

- **Uso:** Solo se utilizan para autenticarte en el portal de ARCA durante la consulta.
- **Transmisión:** Se encriptan con AES-256 antes de enviarse al servidor de scraping.
- **Almacenamiento:** **NO** se almacenan. Se descartan inmediatamente después de la consulta.
- **Acceso:** Solo se usan para el proceso de scraping y nunca se guardan en logs ni bases de datos.

### Datos de Comprobantes

- **Almacenamiento:** Se guardan **únicamente** en el `localStorage` de tu navegador.
- **Transmisión:** **NO** se envían a ningún servidor externo.
- **Control:** Podés eliminarlos en cualquier momento usando el botón "Limpiar Datos".
- **Persistencia:** Permanecen en tu dispositivo hasta que los elimines o limpies los datos del navegador.

### Información de la Empresa

- **Uso:** El nombre y CUIT de tu empresa se extraen para mostrarlos en la interfaz y en las exportaciones.
- **Almacenamiento:** Solo en el `localStorage` de tu navegador.

---

## Información que NO Recopilamos

- ❌ Contraseñas (se descartan después de cada consulta)
- ❌ Datos personales identificables
- ❌ Historial de navegación
- ❌ Cookies de seguimiento
- ❌ Información de ubicación
- ❌ Datos de uso o analytics
- ❌ Contenido de tus comprobantes en nuestros servidores

---

## Seguridad

### Encriptación
- Las credenciales se encriptan con **AES-256** antes de transmitirse.
- La comunicación con el servidor usa **HTTPS**.

### Protección Anti-Bot
- Implementamos **Cloudflare Turnstile** para proteger contra ataques automatizados.
- Rate limiting de **30 requests por minuto** por IP.

### Código Abierto
- Todo el código es **open source** y está disponible en [GitHub](https://github.com/FacundoMalgieri/garca).
- Podés auditar exactamente qué hace la aplicación.

---

## Servicios de Terceros

### ARCA (Agencia de Recaudación y Control Aduanero)
- Nos conectamos al portal de ARCA para recuperar tus comprobantes.
- Esta conexión está sujeta a los términos y condiciones de ARCA.

### Cloudflare Turnstile
- Utilizamos Turnstile para verificación anti-bot.
- [Política de Privacidad de Cloudflare](https://www.cloudflare.com/privacypolicy/)

### Render (Hosting)
- La aplicación está alojada en Render.
- [Política de Privacidad de Render](https://render.com/privacy)

---

## Tus Derechos

Tenés derecho a:

- **Acceder** a tus datos (están en tu navegador, podés verlos en cualquier momento)
- **Eliminar** tus datos (botón "Limpiar Datos" o limpiando el localStorage)
- **Exportar** tus datos (funciones de exportación a PDF, CSV, JSON)
- **No usar** el servicio si no estás de acuerdo con esta política

---

## Cambios a esta Política

Podemos actualizar esta política ocasionalmente. Los cambios se publicarán en esta página con una nueva fecha de "Última actualización".

---

## Contacto

Si tenés preguntas sobre esta política de privacidad, podés:

- Abrir un issue en [GitHub](https://github.com/FacundoMalgieri/garca/issues)
- Contactarme en [Buy Me a Coffee](https://buymeacoffee.com/facundo.malgieri)

---

## Jurisdicción

Esta política se rige por las leyes de la República Argentina.

