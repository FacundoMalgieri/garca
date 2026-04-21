import Link from "next/link";

export default function PrivacidadPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-2">Política de Privacidad</h1>
      <p className="text-sm text-muted-foreground mb-8">Última actualización: Abril 2026</p>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mb-8">
        <p className="text-base font-medium text-primary dark:text-white leading-relaxed">
          GARCA no tiene base de datos ni retiene tus credenciales. Tu clave fiscal se{" "}
          <strong>cifra en el navegador con AES-256</strong> antes de enviarse al servidor de scraping,
          se usa únicamente para conectarse a ARCA en tu nombre y se descarta al terminar la consulta.
          Los comprobantes que devuelve la consulta se guardan solo en el localStorage de tu navegador.
        </p>
      </div>

      <div className="space-y-8 text-sm text-foreground leading-relaxed">
        <Section title="1. Alcance y Aceptación">
          <p className="text-muted-foreground">
            Esta Política de Privacidad se aplica a todos los usuarios del servicio GARCA (&quot;el Servicio&quot;).
            Al utilizar el Servicio, aceptás las prácticas descritas en esta política.
            Si no estás de acuerdo, no debés utilizar el Servicio.
          </p>
          <p className="text-muted-foreground">
            Esta política complementa nuestros{" "}
            <Link href="/terminos" className="text-primary dark:text-primary-foreground underline underline-offset-2 hover:opacity-80 transition-opacity">
              Términos y Condiciones
            </Link>. En caso de conflicto, prevalecerán los Términos.
          </p>
        </Section>

        <Section title="2. Requisito de Edad">
          <p className="text-muted-foreground">
            El Servicio está destinado a usuarios mayores de 18 años o que cuenten con autorización de un tutor legal.
            No recopilamos deliberadamente información de menores de edad. Si creés que un menor accedió al Servicio
            sin autorización, contactanos a través de los canales indicados en la sección de Contacto.
          </p>
        </Section>

        <Section title="3. Información que Procesamos">
          <H3>3.1 Credenciales de ARCA (CUIT y Contraseña)</H3>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li><strong className="text-foreground">Uso:</strong> Solo se utilizan para autenticarte en el portal de ARCA durante la consulta.</li>
            <li><strong className="text-foreground">Transmisión:</strong> Se encriptan con AES-256 antes de enviarse al servidor de scraping.</li>
            <li><strong className="text-foreground">Almacenamiento:</strong> <strong className="text-foreground">NO</strong> se almacenan en ningún servidor. Se descartan inmediatamente después de completar la consulta.</li>
            <li><strong className="text-foreground">Acceso:</strong> Solo se usan para el proceso de scraping y nunca se guardan en logs ni bases de datos.</li>
            <li><strong className="text-foreground">CUIT (opcional):</strong> Si activás &quot;Recordar mi CUIT&quot;, el número se guarda exclusivamente en el localStorage de tu navegador.</li>
          </ul>

          <H3>3.2 Datos de Comprobantes</H3>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li><strong className="text-foreground">Almacenamiento:</strong> Se guardan <strong className="text-foreground">únicamente</strong> en el localStorage de tu navegador.</li>
            <li><strong className="text-foreground">Transmisión:</strong> <strong className="text-foreground">NO</strong> se envían a ningún servidor externo después de obtenidos.</li>
            <li><strong className="text-foreground">Control:</strong> Podés eliminarlos en cualquier momento usando el botón &quot;Limpiar Datos&quot;.</li>
            <li><strong className="text-foreground">Persistencia:</strong> Permanecen en tu dispositivo hasta que los elimines o limpies los datos del navegador.</li>
            <li><strong className="text-foreground">Límite:</strong> El localStorage tiene un límite de ~5-10 MB según el navegador. Datos que excedan este límite podrían no guardarse correctamente.</li>
          </ul>

          <H3>3.3 Información de la Empresa</H3>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li><strong className="text-foreground">Uso:</strong> El nombre y CUIT de tu empresa se extraen para mostrarlos en la interfaz y en las exportaciones.</li>
            <li><strong className="text-foreground">Almacenamiento:</strong> Solo en el localStorage de tu navegador.</li>
          </ul>

          <H3>3.4 Tipos de Cambio Manuales</H3>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li><strong className="text-foreground">Almacenamiento:</strong> Los tipos de cambio que ingresás manualmente se guardan en el localStorage de tu navegador.</li>
            <li><strong className="text-foreground">Transmisión:</strong> <strong className="text-foreground">NO</strong> se envían a ningún servidor.</li>
          </ul>
        </Section>

        <Section title="4. Información que NO Recopilamos">
          <p className="text-muted-foreground mb-2">No recopilamos, almacenamos ni procesamos:</p>
          <ul className="space-y-1.5 text-muted-foreground">
            <li>&#10060; Contraseñas (se descartan después de cada consulta)</li>
            <li>&#10060; Datos personales identificables en nuestros servidores</li>
            <li>&#10060; Historial de navegación o actividad dentro del Servicio</li>
            <li>&#10060; Cookies de seguimiento o marketing</li>
            <li>&#10060; Información de ubicación o geolocalización</li>
            <li>&#10060; Datos de uso, analytics o telemetría</li>
            <li>&#10060; Contenido de tus comprobantes en nuestros servidores</li>
            <li>&#10060; Información financiera más allá de lo que devuelve ARCA</li>
            <li>&#10060; Datos de dispositivo (modelo, sistema operativo, etc.)</li>
          </ul>
        </Section>

        <Section title="5. Almacenamiento Local (localStorage)">
          <p className="text-muted-foreground mb-2">
            El Servicio utiliza la API de localStorage del navegador para persistir datos entre sesiones.
            Es importante que entiendas cómo funciona:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li><strong className="text-foreground">Ubicación:</strong> Los datos se almacenan exclusivamente en tu dispositivo, dentro del almacenamiento del navegador.</li>
            <li><strong className="text-foreground">No se sincroniza:</strong> Los datos NO se sincronizan entre dispositivos ni navegadores.</li>
            <li><strong className="text-foreground">Eliminación:</strong> Podés borrar todos los datos usando &quot;Limpiar Datos&quot;, limpiando los datos del sitio en tu navegador, o usando el modo incógnito.</li>
            <li><strong className="text-foreground">Riesgo:</strong> Cualquier persona con acceso físico a tu dispositivo y navegador podría ver los datos almacenados. Usá el Servicio en dispositivos de confianza.</li>
            <li><strong className="text-foreground">Sin encriptación local:</strong> Los datos en localStorage no están encriptados. El navegador los protege con su política de mismo origen (same-origin policy).</li>
          </ul>
        </Section>

        <Section title="6. Seguridad">
          <H3>6.1 Encriptación en Tránsito</H3>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Las credenciales se encriptan con <strong className="text-foreground">AES-256</strong> antes de transmitirse al servidor de scraping.</li>
            <li>Toda la comunicación entre tu navegador y nuestros servidores usa <strong className="text-foreground">HTTPS/TLS</strong>.</li>
            <li>La comunicación entre el servidor de scraping y ARCA también usa HTTPS.</li>
          </ul>

          <H3>6.2 Protección Anti-Bot</H3>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Implementamos <strong className="text-foreground">Cloudflare Turnstile</strong> para proteger contra ataques automatizados.</li>
            <li>Rate limiting de <strong className="text-foreground">30 requests por minuto</strong> por IP para prevenir abuso.</li>
          </ul>

          <H3>6.3 Servidor de Scraping</H3>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>El servidor de scraping actúa como intermediario entre tu navegador y ARCA.</li>
            <li><strong className="text-foreground">No almacena</strong> credenciales, comprobantes ni datos personales.</li>
            <li>Los logs del servidor pueden registrar temporalmente direcciones IP y timestamps de las solicitudes con fines de seguridad y debugging, pero <strong className="text-foreground">nunca incluyen credenciales ni datos de comprobantes</strong>.</li>
            <li>Los logs se rotan periódicamente y no se utilizan para identificar usuarios individuales.</li>
          </ul>

          <H3>6.4 Código Abierto</H3>
          <p className="text-muted-foreground">
            Todo el código fuente es <strong className="text-foreground">open source</strong> y está disponible en{" "}
            <ExtLink href="https://github.com/FacundoMalgieri/garca">GitHub</ExtLink>.
            Podés auditar exactamente qué hace la aplicación en cualquier momento.
          </p>

          <H3>6.5 Notificación de Incidentes</H3>
          <p className="text-muted-foreground">
            En caso de detectar una vulnerabilidad de seguridad o brecha que pudiera afectar a los usuarios,
            nos comprometemos a notificarlo a través del repositorio de GitHub lo antes posible
            y tomar las medidas correctivas necesarias.
          </p>
        </Section>

        <Section title="7. Servicios de Terceros">
          <p className="text-muted-foreground mb-3">
            El Servicio interactúa con los siguientes servicios de terceros. Cada uno tiene sus propias políticas de privacidad:
          </p>

          <H3>7.1 ARCA (Agencia de Recaudación y Control Aduanero)</H3>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Nos conectamos al portal de ARCA para recuperar tus comprobantes.</li>
            <li>Esta conexión está sujeta a los términos y condiciones de ARCA.</li>
            <li>ARCA puede registrar el acceso a su portal según sus propias políticas.</li>
          </ul>

          <H3>7.2 Cloudflare Turnstile</H3>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Utilizamos Turnstile para verificación anti-bot. No usa cookies de tracking.</li>
            <li>Cloudflare puede procesar datos técnicos mínimos (como la dirección IP) para su funcionamiento.</li>
            <li>Más información:{" "}
              <ExtLink href="https://www.cloudflare.com/privacypolicy/">Política de Privacidad de Cloudflare</ExtLink>
            </li>
          </ul>

          <H3>7.3 Proveedor de Alojamiento</H3>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>El sitio se sirve por HTTPS a través de un proveedor de alojamiento.</li>
            <li>El proveedor puede registrar datos técnicos de acceso (dirección IP, user-agent, timestamps) según su propia política de privacidad.</li>
            <li>No tenemos control directo sobre estos logs del proveedor.</li>
          </ul>
        </Section>

        <Section title="8. Cookies y Tecnologías de Rastreo">
          <p className="text-muted-foreground mb-2">
            GARCA <strong className="text-foreground">no utiliza cookies</strong> propias de ningún tipo (ni de sesión, ni persistentes, ni de tracking).
          </p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>No usamos cookies de analytics (Google Analytics, etc.).</li>
            <li>No usamos cookies de marketing o publicidad.</li>
            <li>No usamos píxeles de seguimiento ni web beacons.</li>
            <li>Cloudflare Turnstile puede establecer cookies técnicas necesarias para su funcionamiento anti-bot, las cuales están sujetas a la{" "}
              <ExtLink href="https://www.cloudflare.com/cookie-policy/">Política de Cookies de Cloudflare</ExtLink>.
            </li>
          </ul>
        </Section>

        <Section title="9. Transferencia Internacional de Datos">
          <p className="text-muted-foreground">
            Dado que tus datos de comprobantes se almacenan localmente en tu navegador, no se produce transferencia
            internacional de datos personales. Sin embargo, la comunicación con el servidor de scraping y con
            servicios de terceros (Cloudflare, proveedor de hosting) puede transitar por servidores ubicados
            fuera de la República Argentina. Estas comunicaciones están protegidas por encriptación HTTPS/TLS.
          </p>
        </Section>

        <Section title="10. Tus Derechos">
          <p className="text-muted-foreground mb-2">
            De acuerdo con la Ley 25.326 de Protección de Datos Personales de Argentina y normativa aplicable, tenés derecho a:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li><strong className="text-foreground">Acceder</strong> a tus datos — están en tu navegador, podés verlos en cualquier momento a través del Servicio o inspeccionando el localStorage.</li>
            <li><strong className="text-foreground">Eliminar</strong> tus datos — usando el botón &quot;Limpiar Datos&quot; del Servicio, limpiando el localStorage del navegador, o desinstalando la PWA si la hubieras instalado.</li>
            <li><strong className="text-foreground">Exportar</strong> tus datos — mediante las funciones de exportación a PDF, CSV y JSON.</li>
            <li><strong className="text-foreground">Rectificar</strong> tus datos — dado que los datos provienen directamente de ARCA, cualquier corrección debe realizarse en el portal de ARCA.</li>
            <li><strong className="text-foreground">Revocar consentimiento</strong> — podés dejar de usar el Servicio en cualquier momento y eliminar todos tus datos locales.</li>
            <li><strong className="text-foreground">No ser objeto de decisiones automatizadas</strong> — el Servicio no toma decisiones automatizadas sobre vos. Las proyecciones y cálculos son orientativos.</li>
          </ul>
          <p className="text-muted-foreground mt-2">
            Dado que no almacenamos datos personales en nuestros servidores, la mayoría de estos derechos se ejercen
            directamente desde tu navegador sin necesidad de contactarnos.
          </p>
        </Section>

        <Section title="11. Retención de Datos">
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li><strong className="text-foreground">Datos locales:</strong> Permanecen en tu navegador hasta que los elimines manualmente.</li>
            <li><strong className="text-foreground">Credenciales:</strong> Se descartan inmediatamente después de cada consulta. No se retienen en ningún momento.</li>
            <li><strong className="text-foreground">Logs del servidor:</strong> Los logs técnicos (IP, timestamps) se rotan periódicamente y no se retienen más de lo necesario para fines de seguridad.</li>
          </ul>
        </Section>

        <Section title="12. Cambios a esta Política">
          <p className="text-muted-foreground">
            Podemos actualizar esta política ocasionalmente para reflejar cambios en el Servicio o en la legislación aplicable.
            Los cambios se publicarán en esta página con una nueva fecha de &quot;Última actualización&quot;.
            El uso continuado del Servicio después de la publicación de cambios constituye aceptación de la política actualizada.
          </p>
          <p className="text-muted-foreground">
            Para cambios sustanciales, haremos un esfuerzo razonable por notificar a los usuarios
            a través del repositorio de GitHub.
          </p>
        </Section>

        <Section title="13. Contacto">
          <p className="text-muted-foreground mb-2">Si tenés preguntas, sugerencias o inquietudes sobre esta política de privacidad:</p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Abrí un issue en <ExtLink href="https://github.com/FacundoMalgieri/garca/issues">GitHub</ExtLink></li>
          </ul>
        </Section>

        <Section title="14. Jurisdicción y Legislación Aplicable">
          <p className="text-muted-foreground">
            Esta política se rige por las leyes de la República Argentina, en particular la Ley 25.326 de Protección
            de Datos Personales y su normativa complementaria. Cualquier controversia será sometida a la jurisdicción
            de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.
          </p>
        </Section>

        <div className="pt-8 border-t border-border">
          <Link href="/" className="text-primary dark:text-primary-foreground hover:underline text-sm">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-foreground mt-4 mb-1.5">{children}</h3>;
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary dark:text-primary-foreground underline underline-offset-2 hover:opacity-80 transition-opacity"
    >
      {children}
    </a>
  );
}
