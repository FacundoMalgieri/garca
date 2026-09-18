"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

import { useModalA11y } from "@/hooks/useModalA11y"

interface ProjectionHelpModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Cómo usar Proyectar.
 *
 * El panel contesta una pregunta sola, pero las decisiones de atrás —qué es el
 * margen, por qué el mes en curso tiene piso, qué hace el candado— no se
 * explican solas. Van acá y no en la pantalla para no volver a llenarla de
 * texto, que es justamente de lo que la sacamos.
 */
export function ProjectionHelpModal({ isOpen, onClose }: ProjectionHelpModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const dialogRef = useModalA11y<HTMLDivElement>(isOpen && mounted, onClose)

  // El contenido es largo: sin scroll-lock el fondo se mueve atrás del modal.
  useEffect(() => {
    if (!isOpen) return
    const html = document.documentElement
    const originalPaddingRight = html.style.paddingRight
    const originalOverflow = html.style.overflow
    const scrollbarWidth = window.innerWidth - html.clientWidth

    html.style.paddingRight = `${scrollbarWidth}px`
    html.style.overflow = "hidden"

    return () => {
      html.style.paddingRight = originalPaddingRight
      html.style.overflow = originalOverflow
    }
  }, [isOpen])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="projection-help-title"
        tabIndex={-1}
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg border border-border bg-background shadow-lg"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 id="projection-help-title" className="text-lg font-semibold">
              Cómo usar Proyectar
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Te dice cuánto podés facturar por mes, de acá a la recategorización, sin pasarte de
              categoría.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 rounded-md px-2 py-1 text-muted-foreground cursor-pointer hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-success"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-5 text-sm">
          <Seccion titulo="La ventana de 12 meses">
            <p>
              ARCA no mira el año calendario: en cada recategorización suma los{" "}
              <strong className="text-foreground">últimos 12 meses</strong>. Por eso el panel trabaja
              sobre esa ventana, y no sobre enero–diciembre. El selector de{" "}
              <strong className="text-foreground">Recategorización</strong> define contra qué fecha
              se calcula todo.
            </p>
          </Seccion>

          <Seccion titulo="Objetivo y margen">
            <p>
              <strong className="text-foreground">Objetivo</strong> es la categoría en la que querés
              terminar. En <em>Automático</em> usa la que te corresponde hoy por lo que ya llevás
              facturado, o sea: quedarte donde estás.
            </p>
            <p>
              <strong className="text-foreground">Margen</strong> es un colchón que se deja sin usar.
              Con $200k, el plan apunta a $200.000 por debajo del tope en vez de al tope justo. Sirve
              porque un cobro que entra más tarde de lo previsto, o un tipo de cambio que se mueve,
              te pueden correr de categoría por poco.
            </p>
          </Seccion>

          <Seccion titulo="El número grande">
            <p>
              Es facturación <strong className="text-foreground">nueva por mes</strong>: agarra lo
              que te queda hasta el objetivo y lo divide en partes iguales entre los meses que
              faltan. La frase de abajo te dice en qué categoría terminás si seguís ese ritmo.
            </p>
          </Seccion>

          <Seccion titulo="La barra">
            <p>
              El tramo verde es lo ya facturado —eso no se puede deshacer—, el azul es lo que estás
              proyectando y el naranja de la punta es tu margen. A la derecha está el total de la
              ventana contra el tope de tu objetivo.
            </p>
          </Seccion>

          <Seccion titulo="Ajustar mes por mes">
            <p>
              Cada campo es el <strong className="text-foreground">total del mes</strong>, no lo que
              falta. Por eso el mes en curso arranca con lo que ya facturaste: ese es su piso y no
              puede bajar de ahí. Abajo del campo te dice cuánto estás proyectando de más.
            </p>
            <p>
              <strong className="text-foreground">Fijo / Abierto</strong>: fijá los meses que ya
              sabés cuánto van a ser. A los fijos no los toca nada; su monto se descuenta primero y
              el resto se reparte entre los abiertos.
            </p>
            <p>
              Si te sobra plata aparece <strong className="text-foreground">Repartir</strong>; si te
              pasaste, <strong className="text-foreground">Recortar</strong>. Los dos hacen lo mismo:
              recalculan los meses abiertos para que el total aterrice justo en tu objetivo.
            </p>
          </Seccion>

          <Seccion titulo="Una advertencia">
            <p>
              Es una estimación. Las facturas en moneda extranjera entran convertidas a pesos, así
              que si el dólar se mueve entre hoy y el día que facturás, el total real va a ser otro.
              Si arriba del panel te aparecen comprobantes{" "}
              <strong className="text-foreground">sin tipo de cambio</strong>, cargalos: hasta que lo
              hagas, esas facturas no suman al total.
            </p>
          </Seccion>
        </div>

        <div className="border-t border-border p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-md border border-border px-3 py-2 text-sm cursor-pointer hover:bg-muted focus-visible:outline-2 focus-visible:outline-success"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mb-5 last:mb-0">
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-success">{titulo}</h3>
      <div className="space-y-2 text-muted-foreground [&_strong]:font-medium">{children}</div>
    </section>
  )
}
