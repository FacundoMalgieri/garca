import { describe, expect, it, vi } from "vitest"

import { ProjectionHelpModal } from "./HelpModal"

import { fireEvent, render, screen } from "@testing-library/react"

describe("ProjectionHelpModal", () => {
  it("no renderiza nada cerrado", () => {
    render(<ProjectionHelpModal isOpen={false} onClose={vi.fn()} />)

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("es un diálogo con nombre accesible", () => {
    render(<ProjectionHelpModal isOpen onClose={vi.fn()} />)

    const dialog = screen.getByRole("dialog")
    expect(dialog).toHaveAttribute("aria-modal", "true")
    expect(dialog).toHaveAccessibleName("Cómo usar Proyectar")
  })

  it("explica las decisiones que la pantalla no explica sola", () => {
    render(<ProjectionHelpModal isOpen onClose={vi.fn()} />)

    // El margen y el piso del mes en curso son las dos que más confunden.
    expect(screen.getByText(/últimos 12 meses/i)).toBeInTheDocument()
    expect(screen.getByText(/colchón/i)).toBeInTheDocument()
    expect(screen.getByText(/ese es su piso/i)).toBeInTheDocument()
    expect(screen.getByText(/Fijo \/ Abierto/)).toBeInTheDocument()
  })

  it("cierra con la ✕ y con Entendido", () => {
    const onClose = vi.fn()
    const { unmount } = render(<ProjectionHelpModal isOpen onClose={onClose} />)

    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }))
    expect(onClose).toHaveBeenCalledTimes(1)

    unmount()
    render(<ProjectionHelpModal isOpen onClose={onClose} />)
    fireEvent.click(screen.getByRole("button", { name: "Entendido" }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it("cierra con Escape", () => {
    const onClose = vi.fn()
    render(<ProjectionHelpModal isOpen onClose={onClose} />)

    fireEvent.keyDown(document, { key: "Escape" })

    expect(onClose).toHaveBeenCalled()
  })
})
