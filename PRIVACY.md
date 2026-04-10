# Política de Privacidad

**Última actualización:** Abril 2026

GARCA es una herramienta que funciona **100% en tu navegador**. No recopilamos, almacenamos ni transmitimos tus datos personales a ningún servidor externo.

---

## 1. Alcance y Aceptación

Esta Política de Privacidad se aplica a todos los usuarios del servicio GARCA ("el Servicio"). Al utilizar el Servicio, aceptás las prácticas descritas en esta política. Si no estás de acuerdo, no debés utilizar el Servicio.

Esta política complementa nuestros [Términos y Condiciones](TERMS.md). En caso de conflicto, prevalecerán los Términos.

## 2. Requisito de Edad

El Servicio está destinado a usuarios mayores de 18 años o que cuenten con autorización de un tutor legal. No recopilamos deliberadamente información de menores de edad. Si creés que un menor accedió al Servicio sin autorización, contactanos a través de los canales indicados en la sección de Contacto.

## 3. Información que Procesamos

### 3.1 Credenciales de ARCA (CUIT y Contraseña)

- **Uso:** Solo se utilizan para autenticarte en el portal de ARCA durante la consulta.
- **Transmisión:** Se encriptan con AES-256 antes de enviarse al servidor de scraping.
- **Almacenamiento:** **NO** se almacenan en ningún servidor. Se descartan inmediatamente después de completar la consulta.
- **Acceso:** Solo se usan para el proceso de scraping y nunca se guardan en logs ni bases de datos.
- **CUIT (opcional):** Si activás "Recordar mi CUIT", el número se guarda exclusivamente en el localStorage de tu navegador.

### 3.2 Datos de Comprobantes

- **Almacenamiento:** Se guardan **únicamente** en el localStorage de tu navegador.
- **Transmisión:** **NO** se envían a ningún servidor externo después de obtenidos.
- **Control:** Podés eliminarlos en cualquier momento usando el botón "Limpiar Datos".
- **Persistencia:** Permanecen en tu dispositivo hasta que los elimines o limpies los datos del navegador.
- **Límite:** El localStorage tiene un límite de ~5-10 MB según el navegador. Datos que excedan este límite podrían no guardarse correctamente.

### 3.3 Información de la Empresa

- **Uso:** El nombre y CUIT de tu empresa se extraen para mostrarlos en la interfaz y en las exportaciones.
- **Almacenamiento:** Solo en el localStorage de tu navegador.

### 3.4 Tipos de Cambio Manuales

- **Almacenamiento:** Los tipos de cambio que ingresás manualmente se guardan en el localStorage de tu navegador.
- **Transmisión:** **NO** se envían a ningún servidor.

## 4. Información que NO Recopilamos

No recopilamos, almacenamos ni procesamos:

- ❌ Contraseñas (se descartan después de cada consulta)
- ❌ Datos personales identificables en nuestros servidores
- ❌ Historial de navegación o actividad dentro del Servicio
- ❌ Cookies de seguimiento o marketing
- ❌ Información de ubicación o geolocalización
- ❌ Datos de uso, analytics o telemetría
- ❌ Contenido de tus comprobantes en nuestros servidores
- ❌ Información financiera más allá de lo que devuelve ARCA
- ❌ Datos de dispositivo (modelo, sistema operativo, etc.)

## 5. Almacenamiento Local (localStorage)

El Servicio utiliza la API de localStorage del navegador para persistir datos entre sesiones. Es importante que entiendas cómo funciona:

- **Ubicación:** Los datos se almacenan exclusivamente en tu dispositivo, dentro del almacenamiento del navegador.
- **No se sincroniza:** Los datos NO se sincronizan entre dispositivos ni navegadores.
- **Eliminación:** Podés borrar todos los datos usando "Limpiar Datos", limpiando los datos del sitio en tu navegador, o usando el modo incógnito.
- **Riesgo:** Cualquier persona con acceso físico a tu dispositivo y navegador podría ver los datos almacenados. Usá el Servicio en dispositivos de confianza.
- **Sin encriptación local:** Los datos en localStorage no están encriptados. El navegador los protege con su política de mismo origen (same-origin policy).

## 6. Seguridad

### 6.1 Encriptación en Tránsito

- Las credenciales se encriptan con **AES-256** antes de transmitirse al servidor de scraping.
- Toda la comunicación entre tu navegador y nuestros servidores usa **HTTPS/TLS**.
- La comunicación entre el servidor de scraping y ARCA también usa HTTPS.

### 6.2 Protección Anti-Bot

- Implementamos **Cloudflare Turnstile** para proteger contra ataques automatizados.
- Rate limiting de **30 requests por minuto** por IP para prevenir abuso.

### 6.3 Servidor de Scraping

- El servidor de scraping actúa como intermediario entre tu navegador y ARCA.
- **No almacena** credenciales, comprobantes ni datos personales.
- Los logs del servidor pueden registrar temporalmente direcciones IP y timestamps de las solicitudes con fines de seguridad y debugging, pero **nunca incluyen credenciales ni datos de comprobantes**.
- Los logs se rotan periódicamente y no se utilizan para identificar usuarios individuales.

### 6.4 Código Abierto

Todo el código fuente es **open source** y está disponible en [GitHub](https://github.com/FacundoMalgieri/garca). Podés auditar exactamente qué hace la aplicación en cualquier momento.

### 6.5 Notificación de Incidentes

En caso de detectar una vulnerabilidad de seguridad o brecha que pudiera afectar a los usuarios, nos comprometemos a notificarlo a través del repositorio de GitHub lo antes posible y tomar las medidas correctivas necesarias.

## 7. Servicios de Terceros

El Servicio interactúa con los siguientes servicios de terceros. Cada uno tiene sus propias políticas de privacidad:

### 7.1 ARCA (Agencia de Recaudación y Control Aduanero)

- Nos conectamos al portal de ARCA para recuperar tus comprobantes.
- Esta conexión está sujeta a los términos y condiciones de ARCA.
- ARCA puede registrar el acceso a su portal según sus propias políticas.

### 7.2 Cloudflare Turnstile

- Utilizamos Turnstile para verificación anti-bot. No usa cookies de tracking.
- Cloudflare puede procesar datos técnicos mínimos (como la dirección IP) para su funcionamiento.
- Más información: [Política de Privacidad de Cloudflare](https://www.cloudflare.com/privacypolicy/)

### 7.3 Proveedor de Alojamiento

- El sitio se sirve por HTTPS a través de un proveedor de alojamiento.
- El proveedor puede registrar datos técnicos de acceso (dirección IP, user-agent, timestamps) según su propia política de privacidad.
- No tenemos control directo sobre estos logs del proveedor.

## 8. Cookies y Tecnologías de Rastreo

GARCA **no utiliza cookies** propias de ningún tipo (ni de sesión, ni persistentes, ni de tracking).

- No usamos cookies de analytics (Google Analytics, etc.).
- No usamos cookies de marketing o publicidad.
- No usamos píxeles de seguimiento ni web beacons.
- Cloudflare Turnstile puede establecer cookies técnicas necesarias para su funcionamiento anti-bot, las cuales están sujetas a la [Política de Cookies de Cloudflare](https://www.cloudflare.com/cookie-policy/).

## 9. Transferencia Internacional de Datos

Dado que tus datos de comprobantes se almacenan localmente en tu navegador, no se produce transferencia internacional de datos personales. Sin embargo, la comunicación con el servidor de scraping y con servicios de terceros (Cloudflare, proveedor de hosting) puede transitar por servidores ubicados fuera de la República Argentina. Estas comunicaciones están protegidas por encriptación HTTPS/TLS.

## 10. Tus Derechos

De acuerdo con la Ley 25.326 de Protección de Datos Personales de Argentina y normativa aplicable, tenés derecho a:

- **Acceder** a tus datos — están en tu navegador, podés verlos en cualquier momento a través del Servicio o inspeccionando el localStorage.
- **Eliminar** tus datos — usando el botón "Limpiar Datos" del Servicio, limpiando el localStorage del navegador, o desinstalando la PWA si la hubieras instalado.
- **Exportar** tus datos — mediante las funciones de exportación a PDF, CSV y JSON.
- **Rectificar** tus datos — dado que los datos provienen directamente de ARCA, cualquier corrección debe realizarse en el portal de ARCA.
- **Revocar consentimiento** — podés dejar de usar el Servicio en cualquier momento y eliminar todos tus datos locales.
- **No ser objeto de decisiones automatizadas** — el Servicio no toma decisiones automatizadas sobre vos. Las proyecciones y cálculos son orientativos.

Dado que no almacenamos datos personales en nuestros servidores, la mayoría de estos derechos se ejercen directamente desde tu navegador sin necesidad de contactarnos.

## 11. Retención de Datos

- **Datos locales:** Permanecen en tu navegador hasta que los elimines manualmente.
- **Credenciales:** Se descartan inmediatamente después de cada consulta. No se retienen en ningún momento.
- **Logs del servidor:** Los logs técnicos (IP, timestamps) se rotan periódicamente y no se retienen más de lo necesario para fines de seguridad.

## 12. Cambios a esta Política

Podemos actualizar esta política ocasionalmente para reflejar cambios en el Servicio o en la legislación aplicable. Los cambios se publicarán en esta página con una nueva fecha de "Última actualización". El uso continuado del Servicio después de la publicación de cambios constituye aceptación de la política actualizada.

Para cambios sustanciales, haremos un esfuerzo razonable por notificar a los usuarios a través del repositorio de GitHub.

## 13. Contacto

Si tenés preguntas, sugerencias o inquietudes sobre esta política de privacidad:

- Abrí un issue en [GitHub](https://github.com/FacundoMalgieri/garca/issues)

## 14. Jurisdicción y Legislación Aplicable

Esta política se rige por las leyes de la República Argentina, en particular la Ley 25.326 de Protección de Datos Personales y su normativa complementaria. Cualquier controversia será sometida a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.
