import Link from "next/link";

/**
 * Shared T&C content used in both the /terminos page and the inline modal.
 * When `compact` is true, headings and spacing are slightly reduced for modal display.
 */
export function TermsContent({ compact = false }: { compact?: boolean }) {
  const h2Class = compact
    ? "text-base font-semibold text-foreground mb-2"
    : "text-lg font-semibold text-foreground mb-3";
  const h3Class = compact
    ? "text-sm font-semibold text-foreground mt-3 mb-1"
    : "text-sm font-semibold text-foreground mt-4 mb-1.5";
  const gap = compact ? "space-y-5" : "space-y-8";

  return (
    <div className={`${gap} text-sm text-foreground leading-relaxed`}>
      <section>
        <h2 className={h2Class}>1. Aceptación de los Términos</h2>
        <p className="text-muted-foreground">
          Al acceder y utilizar GARCA (&quot;el Servicio&quot;), aceptás estos Términos y Condiciones en su totalidad.
          Si no estás de acuerdo con alguna parte de estos términos, no debés usar el Servicio.
          El uso del Servicio constituye aceptación vinculante de estos Términos.
        </p>
      </section>

      <section>
        <h2 className={h2Class}>2. Definiciones</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li><strong className="text-foreground">&quot;Servicio&quot;</strong>: la aplicación web GARCA, incluyendo todas sus funcionalidades, interfaces y componentes.</li>
          <li><strong className="text-foreground">&quot;Usuario&quot;</strong>: toda persona que acceda o utilice el Servicio.</li>
          <li><strong className="text-foreground">&quot;Desarrollador&quot;</strong>: el creador y mantenedor del Servicio.</li>
          <li><strong className="text-foreground">&quot;ARCA&quot;</strong>: Agencia de Recaudación y Control Aduanero de la República Argentina.</li>
          <li><strong className="text-foreground">&quot;Scraping&quot;</strong>: extracción automatizada de datos del portal de ARCA.</li>
          <li><strong className="text-foreground">&quot;Datos Locales&quot;</strong>: información almacenada en el localStorage del navegador del Usuario.</li>
        </ul>
      </section>

      <section>
        <h2 className={h2Class}>3. Descripción del Servicio</h2>
        <div className="space-y-3">
          <p className="text-muted-foreground">GARCA es una herramienta gratuita y de código abierto que permite:</p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Recuperar comprobantes desde el portal de ARCA mediante scraping.</li>
            <li>Visualizar y analizar datos de facturación.</li>
            <li>Calcular y proyectar categorías de Monotributo.</li>
            <li>Exportar datos en diferentes formatos (PDF, CSV, JSON).</li>
          </ul>
          <p className="text-muted-foreground">
            El Servicio funciona como intermediario entre el navegador del Usuario y el portal de ARCA,
            requiriendo credenciales de Clave Fiscal para operar. Los datos obtenidos se almacenan
            exclusivamente en el navegador del Usuario.
          </p>
        </div>
      </section>

      <section>
        <h2 className={h2Class}>4. Requisitos de Uso</h2>
        <div className="space-y-3">
          <h3 className={h3Class}>4.1 Elegibilidad</h3>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Debés ser mayor de 18 años o contar con autorización de un tutor legal.</li>
            <li>Debés tener una cuenta válida y activa en el portal de ARCA.</li>
            <li>Debés ser el titular legítimo de las credenciales que ingresás, o contar con autorización expresa del titular.</li>
          </ul>

          <h3 className={h3Class}>4.2 Uso Aceptable</h3>
          <p className="text-muted-foreground">Te comprometés a:</p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Proporcionar credenciales válidas y propias (o con autorización del titular).</li>
            <li>No intentar acceder a datos de terceros sin autorización.</li>
            <li>No realizar un uso excesivo que pueda afectar el funcionamiento del Servicio o del portal de ARCA.</li>
            <li>No intentar eludir las medidas de seguridad implementadas (Turnstile, rate limiting, etc.).</li>
            <li>Verificar la exactitud de los datos y cálculos obtenidos antes de tomar decisiones basadas en ellos.</li>
          </ul>

          <h3 className={h3Class}>4.3 Uso Prohibido</h3>
          <p className="text-muted-foreground">Está expresamente prohibido:</p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Usar el Servicio para actividades ilegales, fraudulentas o contrarias a la moral y las buenas costumbres.</li>
            <li>Intentar realizar ingeniería inversa del Servicio con fines maliciosos.</li>
            <li>Usar bots, scripts automatizados o herramientas de scraping sobre el propio Servicio para abusar de él.</li>
            <li>Compartir acceso al Servicio con fines comerciales sin autorización.</li>
            <li>Usar el Servicio para ofrecer un servicio competidor o derivado sin cumplir con la licencia MIT.</li>
            <li>Intentar sobrecargar intencionalmente los servidores del Servicio o del portal de ARCA.</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className={h2Class}>5. Credenciales y Seguridad</h2>
        <div className="space-y-3">
          <h3 className={h3Class}>5.1 Responsabilidad del Usuario</h3>
          <p className="text-muted-foreground">
            Sos el único responsable de mantener la confidencialidad de tus credenciales de ARCA.
            El Servicio no almacena tus contraseñas en ningún servidor, pero debés asegurarte de usar
            el Servicio en dispositivos seguros y redes confiables. No nos hacemos responsables
            por el acceso no autorizado a tus credenciales debido a negligencia del Usuario.
          </p>

          <h3 className={h3Class}>5.2 Encriptación y Transmisión</h3>
          <p className="text-muted-foreground">
            Las credenciales se encriptan con AES-256 antes de transmitirse al servidor de scraping.
            La comunicación utiliza HTTPS/TLS. Sin embargo, ningún sistema de encriptación es infalible.
            Usás el Servicio bajo tu propio riesgo y asumís la responsabilidad de evaluar
            si las medidas de seguridad son adecuadas para tus necesidades.
          </p>

          <h3 className={h3Class}>5.3 Clave Fiscal</h3>
          <p className="text-muted-foreground">
            Al ingresar tu Clave Fiscal, autorizás expresamente al Servicio a utilizarla para acceder
            al portal de ARCA en tu nombre y recuperar los comprobantes disponibles en tu cuenta.
            Esta autorización se limita exclusivamente a la consulta de comprobantes y no incluye
            ninguna otra operación en el portal de ARCA.
          </p>
        </div>
      </section>

      <section>
        <h2 className={h2Class}>6. Privacidad y Datos</h2>
        <p className="text-muted-foreground">
          El uso del Servicio está sujeto a nuestra{" "}
          <Link href="/privacidad" className="text-primary dark:text-primary-foreground underline underline-offset-2 hover:opacity-80 transition-opacity">
            Política de Privacidad
          </Link>
          , que describe en detalle cómo se procesa, almacena y protege tu información.
          La Política de Privacidad forma parte integral de estos Términos.
        </p>
      </section>

      <section>
        <h2 className={h2Class}>7. Propiedad Intelectual</h2>
        <div className="space-y-3">
          <h3 className={h3Class}>7.1 Licencia del Software</h3>
          <p className="text-muted-foreground">
            GARCA es software de código abierto distribuido bajo la{" "}
            <a href="https://github.com/FacundoMalgieri/garca/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-primary dark:text-primary-foreground underline underline-offset-2 hover:opacity-80 transition-opacity">
              Licencia MIT
            </a>.
            Podés usar, modificar y distribuir el código según los términos de dicha licencia.
          </p>

          <h3 className={h3Class}>7.2 Marcas y Nombres</h3>
          <p className="text-muted-foreground">
            &quot;GARCA&quot; y el logo asociado son propiedad del Desarrollador.
            ARCA es una marca registrada de la Agencia de Recaudación y Control Aduanero de Argentina.
            El uso de estas marcas en el Servicio es puramente referencial y no implica afiliación ni respaldo.
          </p>

          <h3 className={h3Class}>7.3 Contenido del Usuario</h3>
          <p className="text-muted-foreground">
            Los datos de comprobantes y demás información que procesás a través del Servicio son de tu propiedad.
            El Servicio no reclama ningún derecho sobre tus datos.
          </p>
        </div>
      </section>

      <section>
        <h2 className={h2Class}>8. Exactitud de los Datos y Cálculos</h2>
        <div className="space-y-3">
          <h3 className={h3Class}>8.1 Datos de ARCA</h3>
          <p className="text-muted-foreground">
            Los datos recuperados del portal de ARCA se presentan tal como fueron obtenidos.
            No garantizamos que sean completos, precisos o actualizados.
            ARCA puede modificar la estructura o contenido de su portal en cualquier momento,
            lo que podría afectar la exactitud de los datos recuperados.
          </p>

          <h3 className={h3Class}>8.2 Cálculos y Proyecciones</h3>
          <p className="text-muted-foreground">
            Las categorías de Monotributo, proyecciones de facturación, tipos de cambio manuales
            y cualquier otro cálculo provisto por el Servicio son <strong className="text-foreground">orientativos y no constituyen
            asesoramiento fiscal, contable ni legal</strong>. Siempre debés consultar con un profesional
            habilitado (contador, abogado, etc.) antes de tomar decisiones basadas en estos datos.
          </p>

          <h3 className={h3Class}>8.3 No Constituye Asesoramiento Profesional</h3>
          <p className="text-muted-foreground">
            El Servicio es una herramienta de visualización y análisis. La información presentada
            no reemplaza el asesoramiento de un contador público, abogado u otro profesional habilitado.
            El Desarrollador no es responsable por decisiones tomadas en base a la información del Servicio.
          </p>
        </div>
      </section>

      <section>
        <h2 className={h2Class}>9. Limitación de Responsabilidad</h2>
        <div className="space-y-3">
          <h3 className={h3Class}>9.1 Sin Garantías</h3>
          <p className="text-muted-foreground">
            El Servicio se proporciona &quot;TAL CUAL&quot; (&quot;AS IS&quot;) y &quot;SEGÚN DISPONIBILIDAD&quot; (&quot;AS AVAILABLE&quot;),
            sin garantías de ningún tipo, expresas o implícitas, incluyendo pero no limitándose a garantías
            de comerciabilidad, idoneidad para un propósito particular, disponibilidad o no infracción.
          </p>

          <h3 className={h3Class}>9.2 Exclusión de Responsabilidad</h3>
          <p className="text-muted-foreground">En la máxima medida permitida por la ley aplicable, en ningún caso el Desarrollador será responsable por:</p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Pérdida de datos, información o ingresos.</li>
            <li>Daños directos, indirectos, incidentales, especiales, consecuentes o punitivos.</li>
            <li>Interrupciones, demoras o errores del Servicio.</li>
            <li>Acciones tomadas por ARCA o cualquier organismo gubernamental debido al uso del Servicio.</li>
            <li>Inexactitudes, omisiones o errores en los datos recuperados o cálculos realizados.</li>
            <li>Problemas derivados de la modificación del portal de ARCA.</li>
            <li>Decisiones fiscales, contables o legales tomadas en base a los datos del Servicio.</li>
            <li>Acceso no autorizado a los datos almacenados en tu navegador.</li>
            <li>Pérdida de datos por fallos del navegador o del dispositivo.</li>
          </ul>

          <h3 className={h3Class}>9.3 Uso Bajo tu Propio Riesgo</h3>
          <p className="text-muted-foreground">Reconocés y aceptás que:</p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>El scraping puede violar los términos de servicio de ARCA, y asumís ese riesgo.</li>
            <li>ARCA puede cambiar su portal sin previo aviso, afectando parcial o totalmente el funcionamiento del Servicio.</li>
            <li>Los datos recuperados pueden contener errores o estar incompletos.</li>
            <li>El Servicio puede dejar de funcionar en cualquier momento sin previo aviso.</li>
            <li>Los cálculos son orientativos y no reemplazan el trabajo de un profesional.</li>
          </ul>

          <h3 className={h3Class}>9.4 Límite de Responsabilidad</h3>
          <p className="text-muted-foreground">
            En cualquier caso, la responsabilidad total del Desarrollador por cualquier concepto
            no excederá la suma que hayas pagado por el uso del Servicio (que, al ser gratuito, es cero).
          </p>
        </div>
      </section>

      <section>
        <h2 className={h2Class}>10. Indemnización</h2>
        <p className="text-muted-foreground">
          Aceptás indemnizar, defender y mantener indemne al Desarrollador, sus colaboradores y contribuidores
          de cualquier reclamo, demanda, daño, pérdida, responsabilidad, costo o gasto (incluyendo honorarios
          legales razonables) que surja directa o indirectamente de:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground mt-2">
          <li>Tu uso del Servicio.</li>
          <li>Tu violación de estos Términos.</li>
          <li>Tu violación de los derechos de terceros.</li>
          <li>Tu violación de los términos de servicio de ARCA.</li>
          <li>Cualquier contenido o dato que proceses a través del Servicio.</li>
        </ul>
      </section>

      <section>
        <h2 className={h2Class}>11. Disponibilidad del Servicio</h2>
        <div className="space-y-3">
          <p className="text-muted-foreground">
            No garantizamos que el Servicio esté disponible de forma ininterrumpida, segura o libre de errores.
            El Servicio puede experimentar interrupciones por:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Mantenimiento programado o no programado.</li>
            <li>Cambios en el portal de ARCA.</li>
            <li>Problemas de infraestructura o red.</li>
            <li>Fuerza mayor o eventos fuera de nuestro control.</li>
          </ul>
          <p className="text-muted-foreground">
            Nos reservamos el derecho de modificar, suspender o discontinuar el Servicio (o cualquier parte del mismo)
            en cualquier momento, temporal o permanentemente, con o sin previo aviso.
          </p>
        </div>
      </section>

      <section>
        <h2 className={h2Class}>12. Modificaciones de los Términos</h2>
        <div className="space-y-3">
          <p className="text-muted-foreground">
            Podemos actualizar estos Términos ocasionalmente para reflejar cambios en el Servicio,
            en la legislación aplicable o por cualquier otra razón que consideremos apropiada.
          </p>
          <p className="text-muted-foreground">
            Los cambios entrarán en vigencia al publicarse en esta página con una nueva fecha de
            &quot;Última actualización&quot;. El uso continuado del Servicio después de la publicación
            de los cambios constituye aceptación de los nuevos Términos.
          </p>
          <p className="text-muted-foreground">
            Para cambios sustanciales, haremos un esfuerzo razonable por notificar a los usuarios
            a través del repositorio de GitHub.
          </p>
        </div>
      </section>

      <section>
        <h2 className={h2Class}>13. Terminación</h2>
        <div className="space-y-3">
          <p className="text-muted-foreground">
            Podemos suspender o terminar tu acceso al Servicio en cualquier momento, por cualquier motivo,
            con o sin causa, con o sin previo aviso. En particular, podemos restringir el acceso si
            detectamos uso abusivo, violación de estos Términos o actividad sospechosa.
          </p>
          <p className="text-muted-foreground">
            Podés dejar de usar el Servicio en cualquier momento. Los datos almacenados en tu navegador
            permanecerán hasta que los elimines manualmente.
          </p>
          <p className="text-muted-foreground">
            Las cláusulas de Limitación de Responsabilidad, Indemnización y Descargo de Responsabilidad
            sobrevivirán a la terminación de estos Términos.
          </p>
        </div>
      </section>

      <section>
        <h2 className={h2Class}>14. Ley Aplicable y Jurisdicción</h2>
        <p className="text-muted-foreground">
          Estos Términos se rigen e interpretan de acuerdo con las leyes de la República Argentina.
          Para cualquier controversia derivada de estos Términos o del uso del Servicio,
          las partes se someten a la jurisdicción exclusiva de los tribunales ordinarios competentes
          de la Ciudad Autónoma de Buenos Aires, renunciando expresamente a cualquier otro fuero que
          pudiera corresponderles.
        </p>
      </section>

      <section>
        <h2 className={h2Class}>15. Divisibilidad</h2>
        <p className="text-muted-foreground">
          Si alguna disposición de estos Términos se considera inválida, ilegal o inaplicable
          por un tribunal competente, dicha invalidez no afectará la validez de las restantes disposiciones,
          que permanecerán en pleno vigor y efecto. La disposición inválida será reemplazada por una
          disposición válida que se aproxime lo más posible a la intención original.
        </p>
      </section>

      <section>
        <h2 className={h2Class}>16. Renuncia</h2>
        <p className="text-muted-foreground">
          La omisión o demora del Desarrollador en ejercer cualquier derecho bajo estos Términos
          no constituirá una renuncia a dicho derecho. Ninguna renuncia será efectiva salvo que
          sea por escrito y firmada por el Desarrollador.
        </p>
      </section>

      <section>
        <h2 className={h2Class}>17. Acuerdo Completo</h2>
        <p className="text-muted-foreground">
          Estos Términos, junto con la{" "}
          <Link href="/privacidad" className="text-primary dark:text-primary-foreground underline underline-offset-2 hover:opacity-80 transition-opacity">
            Política de Privacidad
          </Link>
          , constituyen el acuerdo completo entre vos y el Desarrollador
          respecto al uso del Servicio y reemplazan cualquier acuerdo previo, oral o escrito,
          relacionado con el mismo.
        </p>
      </section>

      <section>
        <h2 className={h2Class}>18. Contacto</h2>
        <div className="space-y-3">
          <p className="text-muted-foreground">Para consultas, sugerencias o reclamos sobre estos Términos:</p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Abrí un issue en{" "}
              <a href="https://github.com/FacundoMalgieri/garca/issues" target="_blank" rel="noopener noreferrer" className="text-primary dark:text-primary-foreground underline underline-offset-2 hover:opacity-80 transition-opacity">
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className={h2Class}>19. Descargo de Responsabilidad</h2>
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-foreground font-medium">
            GARCA no está afiliado, asociado, autorizado, respaldado por, o de ninguna manera oficialmente
            conectado con ARCA (Agencia de Recaudación y Control Aduanero), AFIP, ni con ningún organismo
            gubernamental argentino. Todos los nombres de productos y empresas son marcas registradas
            de sus respectivos propietarios.
          </p>
          <p className="text-muted-foreground mt-2">
            El uso de esta herramienta es bajo tu propia y exclusiva responsabilidad.
            Asegurate de cumplir con los términos de servicio de ARCA y con toda la legislación
            fiscal y tributaria aplicable. El Servicio no reemplaza el asesoramiento profesional.
          </p>
        </div>
      </section>
    </div>
  );
}
