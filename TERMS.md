# Términos y Condiciones de Uso

**Última actualización:** Abril 2026

---

## 1. Aceptación de los Términos

Al acceder y utilizar GARCA ("el Servicio"), aceptás estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, no debés usar el Servicio. El uso del Servicio constituye aceptación vinculante de estos Términos.

## 2. Definiciones

- **"Servicio"**: la aplicación web GARCA, incluyendo todas sus funcionalidades, interfaces y componentes.
- **"Usuario"**: toda persona que acceda o utilice el Servicio.
- **"Desarrollador"**: el creador y mantenedor del Servicio.
- **"ARCA"**: Agencia de Recaudación y Control Aduanero de la República Argentina.
- **"Scraping"**: extracción automatizada de datos del portal de ARCA.
- **"Datos Locales"**: información almacenada en el localStorage del navegador del Usuario.

## 3. Descripción del Servicio

GARCA es una herramienta gratuita y de código abierto que permite:

- Recuperar comprobantes desde el portal de ARCA mediante scraping.
- Visualizar y analizar datos de facturación.
- Calcular y proyectar categorías de Monotributo.
- Exportar datos en diferentes formatos (PDF, CSV, JSON).

El Servicio funciona como intermediario entre el navegador del Usuario y el portal de ARCA, requiriendo credenciales de Clave Fiscal para operar. Los datos obtenidos se almacenan exclusivamente en el navegador del Usuario.

## 4. Requisitos de Uso

### 4.1 Elegibilidad

- Debés ser mayor de 18 años o contar con autorización de un tutor legal.
- Debés tener una cuenta válida y activa en el portal de ARCA.
- Debés ser el titular legítimo de las credenciales que ingresás, o contar con autorización expresa del titular.

### 4.2 Uso Aceptable

Te comprometés a:

- Proporcionar credenciales válidas y propias (o con autorización del titular).
- No intentar acceder a datos de terceros sin autorización.
- No realizar un uso excesivo que pueda afectar el funcionamiento del Servicio o del portal de ARCA.
- No intentar eludir las medidas de seguridad implementadas (Turnstile, rate limiting, etc.).
- Verificar la exactitud de los datos y cálculos obtenidos antes de tomar decisiones basadas en ellos.

### 4.3 Uso Prohibido

Está expresamente prohibido:

- Usar el Servicio para actividades ilegales, fraudulentas o contrarias a la moral y las buenas costumbres.
- Intentar realizar ingeniería inversa del Servicio con fines maliciosos.
- Usar bots, scripts automatizados o herramientas de scraping sobre el propio Servicio para abusar de él.
- Compartir acceso al Servicio con fines comerciales sin autorización.
- Usar el Servicio para ofrecer un servicio competidor o derivado sin cumplir con la licencia MIT.
- Intentar sobrecargar intencionalmente los servidores del Servicio o del portal de ARCA.

## 5. Credenciales y Seguridad

### 5.1 Responsabilidad del Usuario

Sos el único responsable de mantener la confidencialidad de tus credenciales de ARCA. El Servicio no almacena tus contraseñas en ningún servidor, pero debés asegurarte de usar el Servicio en dispositivos seguros y redes confiables. No nos hacemos responsables por el acceso no autorizado a tus credenciales debido a negligencia del Usuario.

### 5.2 Encriptación y Transmisión

Las credenciales se encriptan con AES-256 antes de transmitirse al servidor de scraping. La comunicación utiliza HTTPS/TLS. Sin embargo, ningún sistema de encriptación es infalible. Usás el Servicio bajo tu propio riesgo y asumís la responsabilidad de evaluar si las medidas de seguridad son adecuadas para tus necesidades.

### 5.3 Clave Fiscal

Al ingresar tu Clave Fiscal, autorizás expresamente al Servicio a utilizarla para acceder al portal de ARCA en tu nombre y recuperar los comprobantes disponibles en tu cuenta. Esta autorización se limita exclusivamente a la consulta de comprobantes y no incluye ninguna otra operación en el portal de ARCA.

## 6. Privacidad y Datos

El uso del Servicio está sujeto a nuestra [Política de Privacidad](PRIVACY.md), que describe en detalle cómo se procesa, almacena y protege tu información. La Política de Privacidad forma parte integral de estos Términos.

## 7. Propiedad Intelectual

### 7.1 Licencia del Software

GARCA es software de código abierto distribuido bajo la [Licencia MIT](LICENSE). Podés usar, modificar y distribuir el código según los términos de dicha licencia.

### 7.2 Marcas y Nombres

"GARCA" y el logo asociado son propiedad del Desarrollador. ARCA es una marca registrada de la Agencia de Recaudación y Control Aduanero de Argentina. El uso de estas marcas en el Servicio es puramente referencial y no implica afiliación ni respaldo.

### 7.3 Contenido del Usuario

Los datos de comprobantes y demás información que procesás a través del Servicio son de tu propiedad. El Servicio no reclama ningún derecho sobre tus datos.

## 8. Exactitud de los Datos y Cálculos

### 8.1 Datos de ARCA

Los datos recuperados del portal de ARCA se presentan tal como fueron obtenidos. No garantizamos que sean completos, precisos o actualizados. ARCA puede modificar la estructura o contenido de su portal en cualquier momento, lo que podría afectar la exactitud de los datos recuperados.

### 8.2 Cálculos y Proyecciones

Las categorías de Monotributo, proyecciones de facturación, tipos de cambio manuales y cualquier otro cálculo provisto por el Servicio son **orientativos y no constituyen asesoramiento fiscal, contable ni legal**. Siempre debés consultar con un profesional habilitado (contador, abogado, etc.) antes de tomar decisiones basadas en estos datos.

### 8.3 No Constituye Asesoramiento Profesional

El Servicio es una herramienta de visualización y análisis. La información presentada no reemplaza el asesoramiento de un contador público, abogado u otro profesional habilitado. El Desarrollador no es responsable por decisiones tomadas en base a la información del Servicio.

## 9. Limitación de Responsabilidad

### 9.1 Sin Garantías

El Servicio se proporciona "TAL CUAL" ("AS IS") y "SEGÚN DISPONIBILIDAD" ("AS AVAILABLE"), sin garantías de ningún tipo, expresas o implícitas, incluyendo pero no limitándose a garantías de comerciabilidad, idoneidad para un propósito particular, disponibilidad o no infracción.

### 9.2 Exclusión de Responsabilidad

En la máxima medida permitida por la ley aplicable, en ningún caso el Desarrollador será responsable por:

- Pérdida de datos, información o ingresos.
- Daños directos, indirectos, incidentales, especiales, consecuentes o punitivos.
- Interrupciones, demoras o errores del Servicio.
- Acciones tomadas por ARCA o cualquier organismo gubernamental debido al uso del Servicio.
- Inexactitudes, omisiones o errores en los datos recuperados o cálculos realizados.
- Problemas derivados de la modificación del portal de ARCA.
- Decisiones fiscales, contables o legales tomadas en base a los datos del Servicio.
- Acceso no autorizado a los datos almacenados en tu navegador.
- Pérdida de datos por fallos del navegador o del dispositivo.

### 9.3 Uso Bajo tu Propio Riesgo

Reconocés y aceptás que:

- El scraping puede violar los términos de servicio de ARCA, y asumís ese riesgo.
- ARCA puede cambiar su portal sin previo aviso, afectando parcial o totalmente el funcionamiento del Servicio.
- Los datos recuperados pueden contener errores o estar incompletos.
- El Servicio puede dejar de funcionar en cualquier momento sin previo aviso.
- Los cálculos son orientativos y no reemplazan el trabajo de un profesional.

### 9.4 Límite de Responsabilidad

En cualquier caso, la responsabilidad total del Desarrollador por cualquier concepto no excederá la suma que hayas pagado por el uso del Servicio (que, al ser gratuito, es cero).

## 10. Indemnización

Aceptás indemnizar, defender y mantener indemne al Desarrollador, sus colaboradores y contribuidores de cualquier reclamo, demanda, daño, pérdida, responsabilidad, costo o gasto (incluyendo honorarios legales razonables) que surja directa o indirectamente de:

- Tu uso del Servicio.
- Tu violación de estos Términos.
- Tu violación de los derechos de terceros.
- Tu violación de los términos de servicio de ARCA.
- Cualquier contenido o dato que proceses a través del Servicio.

## 11. Disponibilidad del Servicio

No garantizamos que el Servicio esté disponible de forma ininterrumpida, segura o libre de errores. El Servicio puede experimentar interrupciones por:

- Mantenimiento programado o no programado.
- Cambios en el portal de ARCA.
- Problemas de infraestructura o red.
- Fuerza mayor o eventos fuera de nuestro control.

Nos reservamos el derecho de modificar, suspender o discontinuar el Servicio (o cualquier parte del mismo) en cualquier momento, temporal o permanentemente, con o sin previo aviso.

## 12. Modificaciones de los Términos

Podemos actualizar estos Términos ocasionalmente para reflejar cambios en el Servicio, en la legislación aplicable o por cualquier otra razón que consideremos apropiada.

Los cambios entrarán en vigencia al publicarse en esta página con una nueva fecha de "Última actualización". El uso continuado del Servicio después de la publicación de los cambios constituye aceptación de los nuevos Términos.

Para cambios sustanciales, haremos un esfuerzo razonable por notificar a los usuarios a través del repositorio de GitHub.

## 13. Terminación

Podemos suspender o terminar tu acceso al Servicio en cualquier momento, por cualquier motivo, con o sin causa, con o sin previo aviso. En particular, podemos restringir el acceso si detectamos uso abusivo, violación de estos Términos o actividad sospechosa.

Podés dejar de usar el Servicio en cualquier momento. Los datos almacenados en tu navegador permanecerán hasta que los elimines manualmente.

Las cláusulas de Limitación de Responsabilidad, Indemnización y Descargo de Responsabilidad sobrevivirán a la terminación de estos Términos.

## 14. Ley Aplicable y Jurisdicción

Estos Términos se rigen e interpretan de acuerdo con las leyes de la República Argentina. Para cualquier controversia derivada de estos Términos o del uso del Servicio, las partes se someten a la jurisdicción exclusiva de los tribunales ordinarios competentes de la Ciudad Autónoma de Buenos Aires, renunciando expresamente a cualquier otro fuero que pudiera corresponderles.

## 15. Divisibilidad

Si alguna disposición de estos Términos se considera inválida, ilegal o inaplicable por un tribunal competente, dicha invalidez no afectará la validez de las restantes disposiciones, que permanecerán en pleno vigor y efecto. La disposición inválida será reemplazada por una disposición válida que se aproxime lo más posible a la intención original.

## 16. Renuncia

La omisión o demora del Desarrollador en ejercer cualquier derecho bajo estos Términos no constituirá una renuncia a dicho derecho. Ninguna renuncia será efectiva salvo que sea por escrito y firmada por el Desarrollador.

## 17. Acuerdo Completo

Estos Términos, junto con la [Política de Privacidad](PRIVACY.md), constituyen el acuerdo completo entre vos y el Desarrollador respecto al uso del Servicio y reemplazan cualquier acuerdo previo, oral o escrito, relacionado con el mismo.

## 18. Contacto

Para consultas, sugerencias o reclamos sobre estos Términos:

- Abrí un issue en [GitHub](https://github.com/FacundoMalgieri/garca/issues)

## 19. Descargo de Responsabilidad

**GARCA no está afiliado, asociado, autorizado, respaldado por, o de ninguna manera oficialmente conectado con ARCA (Agencia de Recaudación y Control Aduanero), AFIP, ni con ningún organismo gubernamental argentino. Todos los nombres de productos y empresas son marcas registradas de sus respectivos propietarios.**

El uso de esta herramienta es bajo tu propia y exclusiva responsabilidad. Asegurate de cumplir con los términos de servicio de ARCA y con toda la legislación fiscal y tributaria aplicable. El Servicio no reemplaza el asesoramiento profesional.
