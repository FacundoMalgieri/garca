import Link from "next/link";

export default function TerminosPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h1>Términos y Condiciones de Uso</h1>
        <p className="text-muted-foreground">Última actualización: Noviembre 2025</p>

        <h2>1. Aceptación de los Términos</h2>
        <p>
          Al acceder y utilizar GARCA (&quot;el Servicio&quot;), aceptás estos Términos y Condiciones. 
          Si no estás de acuerdo con alguna parte de estos términos, no debés usar el Servicio.
        </p>

        <h2>2. Descripción del Servicio</h2>
        <p>GARCA es una herramienta gratuita y de código abierto que permite:</p>
        <ul>
          <li>Recuperar comprobantes desde el portal de ARCA</li>
          <li>Visualizar y analizar datos de facturación</li>
          <li>Calcular categorías de Monotributo</li>
          <li>Exportar datos en diferentes formatos</li>
        </ul>
        <p>El Servicio funciona mediante scraping del portal de ARCA y requiere tus credenciales de acceso.</p>

        <h2>3. Uso del Servicio</h2>

        <h3>3.1 Requisitos</h3>
        <ul>
          <li>Debés ser mayor de 18 años o tener autorización de un tutor legal.</li>
          <li>Debés tener una cuenta válida en el portal de ARCA.</li>
          <li>Debés usar el Servicio solo para fines legales y personales.</li>
        </ul>

        <h3>3.2 Uso Aceptable</h3>
        <p>Te comprometés a:</p>
        <ul>
          <li>Proporcionar credenciales válidas y propias.</li>
          <li>No intentar acceder a datos de terceros sin autorización.</li>
          <li>No realizar un uso excesivo que pueda afectar el funcionamiento del Servicio.</li>
          <li>No intentar eludir las medidas de seguridad implementadas.</li>
        </ul>

        <h3>3.3 Uso Prohibido</h3>
        <p>Está prohibido:</p>
        <ul>
          <li>Usar el Servicio para actividades ilegales o fraudulentas.</li>
          <li>Intentar realizar ingeniería inversa del Servicio con fines maliciosos.</li>
          <li>Usar bots o scripts automatizados para abusar del Servicio.</li>
          <li>Compartir acceso al Servicio con fines comerciales sin autorización.</li>
        </ul>

        <h2>4. Credenciales y Seguridad</h2>

        <h3>4.1 Responsabilidad</h3>
        <p>
          Sos responsable de mantener la confidencialidad de tus credenciales de ARCA. 
          El Servicio no almacena tus contraseñas, pero debés asegurarte de usar el Servicio en dispositivos seguros.
        </p>

        <h3>4.2 Encriptación</h3>
        <p>
          Las credenciales se encriptan antes de transmitirse, pero ningún sistema es 100% seguro. 
          Usás el Servicio bajo tu propio riesgo.
        </p>

        <h2>5. Privacidad</h2>
        <p>
          El uso del Servicio está sujeto a nuestra{" "}
          <Link href="/privacidad" className="text-primary hover:underline">
            Política de Privacidad
          </Link>
          , que describe cómo manejamos tu información.
        </p>

        <h2>6. Propiedad Intelectual</h2>

        <h3>6.1 Licencia del Software</h3>
        <p>
          GARCA es software de código abierto distribuido bajo la{" "}
          <a href="https://github.com/FacundoMalgieri/garca/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
            Licencia MIT
          </a>
          . Podés usar, modificar y distribuir el código según los términos de dicha licencia.
        </p>

        <h3>6.2 Marcas</h3>
        <p>
          &quot;GARCA&quot; y el logo asociado son propiedad del desarrollador. 
          ARCA es una marca registrada de la Agencia de Recaudación y Control Aduanero de Argentina.
        </p>

        <h2>7. Limitación de Responsabilidad</h2>

        <h3>7.1 Sin Garantías</h3>
        <p>
          El Servicio se proporciona &quot;TAL CUAL&quot; y &quot;SEGÚN DISPONIBILIDAD&quot;, 
          sin garantías de ningún tipo, expresas o implícitas.
        </p>

        <h3>7.2 Exclusión de Responsabilidad</h3>
        <p>En ningún caso seremos responsables por:</p>
        <ul>
          <li>Pérdida de datos o información.</li>
          <li>Daños directos, indirectos, incidentales o consecuentes.</li>
          <li>Interrupciones del servicio o errores.</li>
          <li>Acciones tomadas por ARCA debido al uso del Servicio.</li>
          <li>Inexactitudes en los datos recuperados.</li>
        </ul>

        <h3>7.3 Uso Bajo tu Propio Riesgo</h3>
        <p>Reconocés que:</p>
        <ul>
          <li>El scraping puede violar los términos de servicio de ARCA.</li>
          <li>ARCA puede cambiar su portal sin previo aviso, afectando el funcionamiento del Servicio.</li>
          <li>Los datos recuperados pueden contener errores.</li>
        </ul>

        <h2>8. Indemnización</h2>
        <p>
          Aceptás indemnizar y mantener indemne al desarrollador de cualquier reclamo, daño, pérdida o gasto 
          (incluyendo honorarios legales) que surja de tu uso del Servicio o violación de estos Términos.
        </p>

        <h2>9. Modificaciones</h2>

        <h3>9.1 Del Servicio</h3>
        <p>
          Nos reservamos el derecho de modificar, suspender o discontinuar el Servicio en cualquier momento sin previo aviso.
        </p>

        <h3>9.2 De los Términos</h3>
        <p>
          Podemos actualizar estos Términos ocasionalmente. Los cambios entrarán en vigencia al publicarse en esta página. 
          El uso continuado del Servicio constituye aceptación de los nuevos Términos.
        </p>

        <h2>10. Terminación</h2>
        <p>
          Podemos suspender o terminar tu acceso al Servicio en cualquier momento, por cualquier motivo, sin previo aviso.
        </p>

        <h2>11. Ley Aplicable</h2>
        <p>
          Estos Términos se rigen por las leyes de la República Argentina. 
          Cualquier disputa se resolverá en los tribunales competentes de la Ciudad Autónoma de Buenos Aires.
        </p>

        <h2>12. Divisibilidad</h2>
        <p>
          Si alguna disposición de estos Términos se considera inválida o inaplicable, 
          las demás disposiciones permanecerán en pleno vigor y efecto.
        </p>

        <h2>13. Acuerdo Completo</h2>
        <p>
          Estos Términos, junto con la Política de Privacidad, constituyen el acuerdo completo entre vos y el desarrollador 
          respecto al uso del Servicio.
        </p>

        <h2>14. Contacto</h2>
        <p>Para consultas sobre estos Términos:</p>
        <ul>
          <li>
            GitHub:{" "}
            <a href="https://github.com/FacundoMalgieri/garca/issues" target="_blank" rel="noopener noreferrer">
              github.com/FacundoMalgieri/garca/issues
            </a>
          </li>
          <li>
            Buy Me a Coffee:{" "}
            <a href="https://buymeacoffee.com/facundo.malgieri" target="_blank" rel="noopener noreferrer">
              buymeacoffee.com/facundo.malgieri
            </a>
          </li>
        </ul>

        <h2>15. Disclaimer</h2>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 my-6">
          <p className="m-0">
            <strong>GARCA no está afiliado, asociado, autorizado, respaldado por, o de ninguna manera oficialmente 
            conectado con ARCA (Agencia de Recaudación y Control Aduanero) ni con ningún organismo gubernamental argentino.</strong>
          </p>
          <p className="mt-2 mb-0">
            El uso de esta herramienta es bajo tu propia responsabilidad. 
            Asegurate de cumplir con los términos de servicio de ARCA.
          </p>
        </div>

        <div className="mt-8 pt-8 border-t">
          <Link href="/" className="text-primary hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

