import Link from "next/link";

export default function PrivacidadPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h1>Política de Privacidad</h1>
        <p className="text-muted-foreground">Última actualización: Noviembre 2025</p>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 my-6">
          <p className="text-lg font-medium text-primary dark:text-white m-0">
            GARCA es una herramienta que funciona <strong>100% en tu navegador</strong>. 
            No recopilamos, almacenamos ni transmitimos tus datos personales a ningún servidor externo.
          </p>
        </div>

        <h2>Información que Procesamos</h2>

        <h3>Credenciales de ARCA (CUIT y Contraseña)</h3>
        <ul>
          <li><strong>Uso:</strong> Solo se utilizan para autenticarte en el portal de ARCA durante la consulta.</li>
          <li><strong>Transmisión:</strong> Se encriptan con AES-256 antes de enviarse al servidor de scraping.</li>
          <li><strong>Almacenamiento:</strong> <strong>NO</strong> se almacenan. Se descartan inmediatamente después de la consulta.</li>
          <li><strong>Acceso:</strong> Solo se usan para el proceso de scraping y nunca se guardan en logs ni bases de datos.</li>
        </ul>

        <h3>Datos de Comprobantes</h3>
        <ul>
          <li><strong>Almacenamiento:</strong> Se guardan <strong>únicamente</strong> en el localStorage de tu navegador.</li>
          <li><strong>Transmisión:</strong> <strong>NO</strong> se envían a ningún servidor externo.</li>
          <li><strong>Control:</strong> Podés eliminarlos en cualquier momento usando el botón &quot;Limpiar Datos&quot;.</li>
          <li><strong>Persistencia:</strong> Permanecen en tu dispositivo hasta que los elimines o limpies los datos del navegador.</li>
        </ul>

        <h3>Información de la Empresa</h3>
        <ul>
          <li><strong>Uso:</strong> El nombre y CUIT de tu empresa se extraen para mostrarlos en la interfaz y en las exportaciones.</li>
          <li><strong>Almacenamiento:</strong> Solo en el localStorage de tu navegador.</li>
        </ul>

        <h2>Información que NO Recopilamos</h2>
        <ul>
          <li>❌ Contraseñas (se descartan después de cada consulta)</li>
          <li>❌ Datos personales identificables</li>
          <li>❌ Historial de navegación</li>
          <li>❌ Cookies de seguimiento</li>
          <li>❌ Información de ubicación</li>
          <li>❌ Datos de uso o analytics</li>
          <li>❌ Contenido de tus comprobantes en nuestros servidores</li>
        </ul>

        <h2>Seguridad</h2>

        <h3>Encriptación</h3>
        <ul>
          <li>Las credenciales se encriptan con <strong>AES-256</strong> antes de transmitirse.</li>
          <li>La comunicación con el servidor usa <strong>HTTPS</strong>.</li>
        </ul>

        <h3>Protección Anti-Bot</h3>
        <ul>
          <li>Implementamos <strong>Cloudflare Turnstile</strong> para proteger contra ataques automatizados.</li>
          <li>Rate limiting de <strong>30 requests por minuto</strong> por IP.</li>
        </ul>

        <h3>Código Abierto</h3>
        <p>
          Todo el código es <strong>open source</strong> y está disponible en{" "}
          <a href="https://github.com/FacundoMalgieri/garca" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>. Podés auditar exactamente qué hace la aplicación.
        </p>

        <h2>Servicios de Terceros</h2>

        <h3>ARCA (Agencia de Recaudación y Control Aduanero)</h3>
        <p>
          Nos conectamos al portal de ARCA para recuperar tus comprobantes. 
          Esta conexión está sujeta a los términos y condiciones de ARCA.
        </p>

        <h3>Cloudflare Turnstile</h3>
        <p>
          Utilizamos Turnstile para verificación anti-bot.{" "}
          <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">
            Política de Privacidad de Cloudflare
          </a>
        </p>

        <h3>Render (Hosting)</h3>
        <p>
          La aplicación está alojada en Render.{" "}
          <a href="https://render.com/privacy" target="_blank" rel="noopener noreferrer">
            Política de Privacidad de Render
          </a>
        </p>

        <h2>Tus Derechos</h2>
        <p>Tenés derecho a:</p>
        <ul>
          <li><strong>Acceder</strong> a tus datos (están en tu navegador, podés verlos en cualquier momento)</li>
          <li><strong>Eliminar</strong> tus datos (botón &quot;Limpiar Datos&quot; o limpiando el localStorage)</li>
          <li><strong>Exportar</strong> tus datos (funciones de exportación a PDF, CSV, JSON)</li>
          <li><strong>No usar</strong> el servicio si no estás de acuerdo con esta política</li>
        </ul>

        <h2>Cambios a esta Política</h2>
        <p>
          Podemos actualizar esta política ocasionalmente. Los cambios se publicarán en esta página 
          con una nueva fecha de &quot;Última actualización&quot;.
        </p>

        <h2>Contacto</h2>
        <p>Si tenés preguntas sobre esta política de privacidad, podés:</p>
        <ul>
          <li>
            Abrir un issue en{" "}
            <a href="https://github.com/FacundoMalgieri/garca/issues" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </li>
          <li>
            Contactarme en{" "}
            <a href="https://buymeacoffee.com/facundo.malgieri" target="_blank" rel="noopener noreferrer">
              Buy Me a Coffee
            </a>
          </li>
        </ul>

        <h2>Jurisdicción</h2>
        <p>Esta política se rige por las leyes de la República Argentina.</p>

        <div className="mt-8 pt-8 border-t">
          <Link href="/" className="text-primary hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

